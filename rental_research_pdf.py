import argparse
import json
import math
import os
import re
import textwrap
import urllib.parse
import urllib.request
from datetime import date

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


WORKDIR = os.path.abspath(os.path.dirname(__file__))
OUTDIR = os.path.join(WORKDIR, "output", "pdf")
os.makedirs(OUTDIR, exist_ok=True)

RATHINAM = {
    "name": "Rathinam Technical Campus, Pollachi Main Road, Eachanari, Coimbatore",
    "lat": 10.915,
    "lon": 76.970,
}

LOCALITIES = [
    "Eachanari",
    "Malumichampatti",
    "Kurichi",
    "Podanur",
    "Kuniyamuthur",
]

DEFAULT_SUMMARY_NAME = "rathinam_rental_research_summary.json"


def fetch(url):
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"
            )
        },
    )
    with urllib.request.urlopen(req, timeout=35) as resp:
        return resp.read().decode("utf-8", errors="replace")


def extract_state(html):
    direct = re.search(r'"resultList"\s*:\s*(\[.*?\])\s*,\s*"isCsr"', html, flags=re.S)
    if direct:
        return {"resultList": json.loads(direct.group(1))}
    marker = "var SERVER_PRELOADED_STATE_ ="
    start = html.find(marker)
    if start == -1:
        return {}
    start = html.find("{", start)
    depth = 0
    for i in range(start, len(html)):
        ch = html[i]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                raw = html[start : i + 1]
                return json.loads(raw)
    return {}


def first_list(obj):
    if isinstance(obj, list):
        if obj and isinstance(obj[0], dict) and ("propertyTitle" in obj[0] or "priceD" in obj[0]):
            return obj
        for item in obj:
            got = first_list(item)
            if got:
                return got
    if isinstance(obj, dict):
        for key, value in obj.items():
            if key in {"resultList", "searchResultList"} and isinstance(value, list):
                return value
        for value in obj.values():
            got = first_list(value)
            if got:
                return got
    return []


def extract_property_objects(html):
    objects = []
    used = set()
    for match in re.finditer(r'"propertyTitle"\s*:', html):
        start = html.rfind('{"encId"', 0, match.start())
        if start == -1 or start in used:
            continue
        used.add(start)
        depth = 0
        in_string = False
        escaped = False
        end = None
        for i in range(start, len(html)):
            ch = html[i]
            if in_string:
                if escaped:
                    escaped = False
                elif ch == "\\":
                    escaped = True
                elif ch == '"':
                    in_string = False
                continue
            if ch == '"':
                in_string = True
            elif ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    end = i + 1
                    break
        if end:
            try:
                objects.append(json.loads(html[start:end]))
            except json.JSONDecodeError:
                pass
    return objects


def haversine_km(lat1, lon1, lat2, lon2):
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def mb_url(locality):
    return (
        "https://www.magicbricks.com/property-for-rent/residential-real-estate"
        "?bedroom=1&proptype=Residential-House,Residential-Apartment"
        f"&cityName=Coimbatore&Locality={urllib.parse.quote(locality)}"
    )


def maps_link(query):
    return "https://www.google.com/maps/search/?api=1&query=" + urllib.parse.quote(query)


def direction_link(destination):
    origin = RATHINAM["name"]
    return (
        "https://www.google.com/maps/dir/?api=1&travelmode=driving&origin="
        + urllib.parse.quote(origin)
        + "&destination="
        + urllib.parse.quote(destination)
    )


def normalize_magicbricks_listing(p, locality):
    title = p.get("propertyTitle") or p.get("auto_desc") or p.get("dtldesc") or ""
    prop_type = p.get("propTypeD") or ""
    bedrooms = p.get("bedroomD") or ""
    rent = int(p.get("price") or 0)
    if rent <= 0 or rent > 12000:
        return None

    lower = " ".join([title, prop_type, p.get("seoDesc", "")]).lower()
    if any(bad in lower for bad in ["pg", "hostel", "shared", "dormitory", "paying guest"]):
        return None
    if any(bad_bhk in lower for bad_bhk in ["3 bhk", "3bhk", "4 bhk", "4bhk", "5 bhk", "5bhk"]):
        return None
    if rent < 5000:
        return None
    if not any(ok in lower for ok in ["1 bhk", "1bhk", "2 bhk", "2bhk", "residential house", "apartment", "flat"]):
        return None

    coords = p.get("ltcoordGeo") or ""
    lat, lon = None, None
    if "," in coords:
        try:
            lat, lon = [float(x.strip()) for x in coords.split(",", 1)]
        except ValueError:
            lat, lon = None, None
    if not lat and p.get("pmtLat"):
        lat = float(p.get("pmtLat"))
        lon = float(p.get("pmtLong"))
    distance = None
    if lat and lon:
        distance = haversine_km(RATHINAM["lat"], RATHINAM["lon"], lat, lon) * 1.25
    if distance and distance > 10:
        return None

    address = p.get("catAdd1") or ""
    if not address and "address of this house is " in p.get("seoDesc", "").lower():
        address = re.split("address of this house is ", p.get("seoDesc", ""), flags=re.I)[-1].split(".")[0]
    if not address or address.lower().startswith("this "):
        address = p.get("lmtDName") or locality

    deposit = p.get("bookingAmtExact") or "Not public"
    seo = p.get("seoURL") or p.get("url") or ""
    if seo and not seo.startswith("http"):
        seo = "https://www.magicbricks.com/" + seo
    dest = f"{address}, {p.get('lmtDName') or locality}, Coimbatore"

    return {
        "source": "MagicBricks",
        "title": title,
        "rent": rent,
        "deposit": f"Rs {int(deposit):,}" if str(deposit).isdigit() else deposit,
        "address": dest,
        "locality": p.get("lmtDName") or locality,
        "maps": maps_link(dest),
        "directions": direction_link(dest),
        "distance": round(distance, 1) if distance else "Estimate needed",
        "time": f"{max(6, min(20, round((distance or 5) / 0.45)))} min",
        "furnished": p.get("furnishedD") or "Not public",
        "parking": p.get("parkingD") or p.get("coveredParkingD") or "Ask owner",
        "water": "Ask owner",
        "internet": "Fibre likely in this corridor; confirm Airtel/Jio/ACT at address",
        "contact": (
            (p.get("userType") or "Contact form")
            + (f": {p.get('oname')}" if p.get("oname") else "")
            + "; phone hidden by portal"
        ),
        "area": f"{p.get('ca') or p.get('coveredArea') or 'NA'} sqft",
        "posted": p.get("postedLabelD") or p.get("modifiedDate") or "Not public",
        "url": seo,
        "type": prop_type,
        "bedrooms": bedrooms,
    }


def parse_magicbricks():
    rows = []
    sources = [
        ("99acres search", "Coimbatore rent", "https://www.99acres.com/rent-property-in-coimbatore-ffid"),
        ("Housing search", "Coimbatore rent", "https://housing.com/rent/flats-for-rent-in-coimbatore-tamil-nadu-P679xe99fao81k6vz"),
        ("NoBroker search", "Coimbatore rent", "https://www.nobroker.in/property/rent/coimbatore/multiple"),
        ("OLX search", "Coimbatore house rent", "https://www.olx.in/coimbatore_g4059167/q-house-for-rent"),
        ("Facebook Marketplace", "Coimbatore rentals", "https://www.facebook.com/marketplace/coimbatore/propertyrentals"),
    ]
    seen = set()
    for locality in LOCALITIES + ["Sundarapuram", "Madukkarai"]:
        url = mb_url(locality)
        sources.append(("MagicBricks", locality, url))
        try:
            html = fetch(url)
            listings = extract_property_objects(html)
            if not listings:
                listings = first_list(extract_state(html))
        except Exception as exc:
            sources.append(("MagicBricks fetch note", locality, str(exc)))
            continue
        for p in listings:
            pid = str(p.get("id") or p.get("encId") or p.get("seoURL") or "")
            if not pid or pid in seen:
                continue
            seen.add(pid)
            row = normalize_magicbricks_listing(p, locality)
            if row:
                rows.append(row)
    return rows, sources


def score(row):
    rent_score = max(0, 35 - max(0, row["rent"] - 5000) / 200)
    dist = row["distance"] if isinstance(row["distance"], (int, float)) else 7
    commute_score = max(0, 30 - dist * 3)
    furnishing_score = 12 if "semi" in row["furnished"].lower() else 6 if "unfurnished" in row["furnished"].lower() else 8
    house_score = 8 if "house" in row["type"].lower() else 5
    deposit_score = 10 if row["deposit"] == "Not public" else max(0, 10 - int(re.sub(r"\D", "", row["deposit"]) or 0) / 6000)
    return round(rent_score + commute_score + furnishing_score + house_score + deposit_score, 1)


def p(text, style):
    return Paragraph(str(text).replace("&", "&amp;"), style)


def build_pdf(rows, sources, pdf_name="rathinam_rental_research_pack.pdf"):
    rows = sorted(rows, key=lambda r: (-score(r), r["rent"]))[:10]
    best = rows[0] if rows else None

    pdf_path = os.path.join(OUTDIR, pdf_name)
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=landscape(A4),
        rightMargin=12 * mm,
        leftMargin=12 * mm,
        topMargin=10 * mm,
        bottomMargin=10 * mm,
    )
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="Small", parent=styles["BodyText"], fontSize=7.2, leading=9))
    styles.add(ParagraphStyle(name="Tiny", parent=styles["BodyText"], fontSize=6.3, leading=8))
    styles.add(ParagraphStyle(name="H1x", parent=styles["Title"], fontSize=20, leading=24, alignment=TA_LEFT))
    styles.add(ParagraphStyle(name="H2x", parent=styles["Heading2"], fontSize=12, leading=15, spaceBefore=7))
    styles.add(ParagraphStyle(name="CenterSmall", parent=styles["Small"], alignment=TA_CENTER))
    story = []

    story.append(p("Rathinam Rental Research Pack", styles["H1x"]))
    story.append(p(f"Prepared on {date.today().isoformat()} for a temporary 10-12 month stay near Rathinam Technical Campus.", styles["Small"]))
    story.append(Spacer(1, 4 * mm))
    intro = (
        "Hard filters used: no PG, hostel, shared room, dormitory, or paying guest options; target rent Rs 5,000-Rs 10,000, "
        "maximum Rs 12,000; estimated within 10 km and about 15-20 minutes by bike. Public portals often hide phone numbers, "
        "water source, exact deposit, and broadband feasibility until owner contact, so those fields are marked for verification where needed."
    )
    story.append(p(intro, styles["Small"]))

    if best:
        story.append(p("Best Single Recommendation", styles["H2x"]))
        rec = (
            f"{best['title']} at {best['address']} - rent Rs {best['rent']:,}, deposit {best['deposit']}, "
            f"{best['furnished']}, about {best['distance']} km / {best['time']} by bike. It ranks highest because it balances "
            "low monthly cost, short commute, independent living, and easier move-out for a 10-12 month stay. Before paying, verify "
            "night safety, borewell/municipal water, bike parking, exact deposit refund terms, and fibre installation at the door."
        )
        story.append(p(rec, styles["Small"]))
        story.append(p(f"Listing: {best['url']}", styles["Tiny"]))
        story.append(p(f"Map/Directions: {best['directions']}", styles["Tiny"]))

    story.append(p("Ranked Top 10 Properties", styles["H2x"]))
    data = [[
        "Rank", "Score", "Rent", "Deposit", "Property", "Address", "Dist/time",
        "Furnishing", "Parking", "Contact"
    ]]
    for i, r in enumerate(rows, 1):
        data.append([
            str(i),
            str(score(r)),
            f"Rs {r['rent']:,}",
            r["deposit"],
            f"{r['bedrooms']} {r['type']} ({r['area']})",
            r["address"],
            f"{r['distance']} km / {r['time']}",
            r["furnished"],
            r["parking"],
            r["contact"],
        ])
    wrapped = []
    for row in data:
        wrapped.append([p(cell, styles["Tiny"]) for cell in row])
    table = Table(wrapped, colWidths=[9*mm, 11*mm, 16*mm, 18*mm, 44*mm, 72*mm, 22*mm, 23*mm, 20*mm, 43*mm], repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#233143")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 6.0),
        ("LEADING", (0, 0), (-1, -1), 7.0),
        ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#c9ced6")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f6f8fb")]),
    ]))
    story.append(table)
    story.append(Spacer(1, 2 * mm))
    story.append(p("Water source is not reliably public on these portal cards; verify borewell/municipal supply and summer backup during the visit. Fibre internet is likely in the Eachanari-Kurichi-Sundarapuram corridor, but final availability must be checked by exact door number with Airtel, Jio, ACT, or a local ISP.", styles["Tiny"]))

    story.append(PageBreak())
    story.append(p("Area Shortlist", styles["H2x"]))
    area_data = [
        ["Area", "Fit", "Why it matters"],
        ["Eachanari", "Best commute", "Closest to campus, easiest bike commute, good for late college/work days."],
        ["Malumichampatti", "Good value", "Often lower rent and calmer streets; verify exact pocket is not too isolated."],
        ["Kurichi", "Convenient", "More urban services and roads; commute can stretch in traffic."],
        ["Podanur", "Facilities", "Railway-side services, shops, hospitals; choose quiet inner residential lanes."],
        ["Kuniyamuthur", "Urban fallback", "Better facilities but farther; only pick if property quality/deposit is clearly better."],
    ]
    story.append(Table(area_data, colWidths=[36*mm, 32*mm, 210*mm], style=[
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#233143")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#c9ced6")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))

    story.append(p("Monthly Budget", styles["H2x"]))
    rent = best["rent"] if best else 9000
    monthly = [
        ["Item", "Low", "Expected", "Notes"],
        ["Rent", f"Rs {rent:,}", f"Rs {rent:,}", "Use selected property rent."],
        ["Electricity", "Rs 600", "Rs 1,000", "Fan, laptop, lights, occasional appliance use."],
        ["Internet", "Rs 600", "Rs 900", "Airtel/Jio/ACT entry fibre plan if available."],
        ["Groceries + cooking", "Rs 3,500", "Rs 5,000", "Simple home cooking, tea/snacks."],
        ["Eating out", "Rs 1,000", "Rs 2,000", "Keep controlled for MBA savings."],
        ["Bike fuel/maintenance", "Rs 1,200", "Rs 1,800", "Campus commute and errands."],
        ["Laundry/cleaning", "Rs 500", "Rs 900", "Detergent, cleaning supplies, occasional help."],
        ["Mobile/misc.", "Rs 800", "Rs 1,500", "Recharge, small repairs, medicines."],
        ["Total", f"Rs {rent + 8200:,}", f"Rs {rent + 13100:,}", "Expected monthly living cost excluding one-time setup."],
    ]
    story.append(Table(monthly, colWidths=[60*mm, 35*mm, 35*mm, 145*mm], style=[
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#233143")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#c9ced6")),
    ]))

    story.append(p("First-Month Expenses", styles["H2x"]))
    deposit_num = 20000
    if best and best["deposit"] != "Not public":
        deposit_num = int(re.sub(r"\D", "", best["deposit"]) or deposit_num)
    first_month = [
        ["Item", "Estimate"],
        ["Rent", f"Rs {rent:,}"],
        ["Security deposit", f"Rs {deposit_num:,}"],
        ["Wi-Fi install/router", "Rs 0-Rs 2,000"],
        ["Electricity buffer", "Rs 1,000"],
        ["Kitchen essentials", "Rs 3,500-Rs 6,000"],
        ["Mattress if needed", "Rs 3,000-Rs 6,000"],
        ["Basic utensils", "Rs 2,000-Rs 3,500"],
        ["Cleaning supplies", "Rs 800-Rs 1,500"],
        ["Transport/misc.", "Rs 1,500-Rs 3,000"],
        ["Likely first-month total", f"Rs {rent + deposit_num + 11800:,}-Rs {rent + deposit_num + 23000:,}"],
    ]
    story.append(Table(first_month, colWidths=[90*mm, 80*mm], style=[
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#233143")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#c9ced6")),
    ]))

    story.append(PageBreak())
    story.append(p("One-Year Cost And Hostel Savings", styles["H2x"]))
    expected_monthly = rent + 13100
    one_year = expected_monthly * 12 + 17000
    hostel_low = 18000 * 12
    hostel_high = 25000 * 12
    story.append(p(
        f"Expected 12-month rental living cost: about Rs {one_year:,}, including monthly expenses plus a basic setup allowance. "
        f"Compared with a hostel/managed stay at Rs 18,000-Rs 25,000 per month, estimated savings are about "
        f"Rs {max(0, hostel_low - one_year):,}-Rs {max(0, hostel_high - one_year):,}. Actual savings depend on food habits and deposit refund.",
        styles["Small"],
    ))

    checklist_sections = [
        ("Moving Checklist", [
            "Visit at night and during morning commute before paying token.",
            "Confirm written rent, deposit, notice period, lock-in, painting/cleaning deductions.",
            "Check mobile signal indoors for Jio/Airtel/Vi and run a speed test.",
            "Ask neighbours about water timing, power cuts, and street safety.",
            "Photograph meter reading, walls, taps, switchboards, and existing damage.",
            "Get owner ID, rent agreement, keys, EB card/consumer number, and deposit receipt.",
        ]),
        ("Furniture Checklist", [
            "Bed or cot, mattress, pillow, bedsheet, light blanket.",
            "Cupboard or cloth rack, study table, chair, shoe rack.",
            "Fan must already work; avoid buying heavy furniture for a temporary stay.",
        ]),
        ("Kitchen Checklist", [
            "Induction stove or single gas setup, one kadai, one pan, pressure cooker.",
            "Two plates, two tumblers, spoon set, knife, chopping board, storage boxes.",
            "Water can or filter, dish soap, scrub, dustbin, reusable grocery bags.",
        ]),
        ("Internet Setup", [
            "Check Airtel Xstream, JioFiber/AirFiber, ACT, and local fibre availability by exact door number.",
            "Prefer no long lock-in; avoid expensive installation if staying only 10-12 months.",
            "Keep mobile hotspot backup for exams, interviews, and MBA application work.",
        ]),
        ("Move-Out Checklist", [
            "Give notice in writing as per agreement.",
            "Clear EB, water, internet, and maintenance dues.",
            "Patch only real damage; avoid open-ended repainting deductions.",
            "Take final room video and meter photo during key handover.",
            "Collect deposit refund confirmation before leaving Coimbatore.",
        ]),
    ]
    for title, items in checklist_sections:
        story.append(p(title, styles["H2x"]))
        for item in items:
            story.append(p("- " + item, styles["Small"]))

    story.append(p("Source Links", styles["H2x"]))
    for name, locality, url in sources:
        if url.startswith("http"):
            story.append(p(f"- {name} {locality}: {url}", styles["Tiny"]))
    story.append(p("- Rathinam campus address reference: https://en.wikipedia.org/wiki/Rathinam_College_of_Arts_and_Science", styles["Tiny"]))
    story.append(p("- Public portal limitation: owner phone numbers, exact water source, and broadband status usually require contacting the listing owner.", styles["Tiny"]))

    def footer(canvas, doc_):
        canvas.saveState()
        canvas.setFont("Helvetica", 7)
        canvas.setFillColor(colors.HexColor("#667085"))
        canvas.drawString(12 * mm, 6 * mm, "Rathinam rental research pack - verify listing availability before paying any token.")
        canvas.drawRightString(285 * mm, 6 * mm, f"Page {doc_.page}")
        canvas.restoreState()

    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    return pdf_path, rows


def load_report_data(path):
    with open(path, "r", encoding="utf-8") as fh:
        payload = json.load(fh)
    if "ranked" not in payload or "sources" not in payload:
        raise ValueError("Input JSON must contain 'ranked' and 'sources' keys.")
    return payload["ranked"], payload["sources"]


def write_summary(ranked, sources, summary_name=DEFAULT_SUMMARY_NAME):
    summary_path = os.path.join(OUTDIR, summary_name)
    with open(summary_path, "w", encoding="utf-8") as fh:
        json.dump({"ranked": ranked, "sources": sources}, fh, indent=2)
    return summary_path


def build_arg_parser():
    parser = argparse.ArgumentParser(description="Build a rental research PDF from live listings or saved JSON data.")
    parser.add_argument(
        "--input-json",
        help="Use an existing JSON payload with ranked/sources keys instead of fetching live portal data.",
    )
    parser.add_argument(
        "--pdf-name",
        default="rathinam_rental_research_pack.pdf",
        help="Output PDF filename under output/pdf.",
    )
    parser.add_argument(
        "--summary-name",
        default=DEFAULT_SUMMARY_NAME,
        help="Output summary JSON filename under output/pdf. Use an empty value to skip writing a summary.",
    )
    parser.add_argument(
        "--no-summary",
        action="store_true",
        help="Do not write a summary JSON file.",
    )
    return parser


def main(argv=None):
    args = build_arg_parser().parse_args(argv)
    if args.input_json:
        rows, sources = load_report_data(args.input_json)
    else:
        rows, sources = parse_magicbricks()

    pdf_path, ranked = build_pdf(rows, sources, pdf_name=args.pdf_name)
    summary_path = None if args.no_summary else write_summary(ranked, sources, args.summary_name)

    print(pdf_path)
    if summary_path:
        print(summary_path)
    print(f"properties={len(ranked)}")
    for i, row in enumerate(ranked, 1):
        print(f"{i}. Rs {row['rent']:,} | {row['title']} | {row['address']} | {row['distance']} km | {row['url']}")
    return pdf_path, summary_path, ranked


if __name__ == "__main__":
    main()
