import json
import os

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = os.path.abspath(os.path.dirname(__file__))
DATA = os.path.join(ROOT, "output", "pdf", "rathinam_rental_research_summary.json")
OUT = os.path.join(ROOT, "output", "english_report")
os.makedirs(OUT, exist_ok=True)

NAVY = colors.HexColor("#123A63")
BLUE = colors.HexColor("#2E74B5")
LIGHT = colors.HexColor("#EAF2FB")
PALE = colors.HexColor("#F7FAFE")
GRID = colors.HexColor("#C7D3E3")
INK = colors.HexColor("#111827")
MUTED = colors.HexColor("#5B677A")


def load_houses():
    with open(DATA, "r", encoding="utf-8") as f:
        return json.load(f)["ranked"]


def money(value):
    if isinstance(value, int):
        return f"Rs {value:,}"
    return str(value)


def styles():
    base = getSampleStyleSheet()
    return {
        "cover": ParagraphStyle("cover", parent=base["Title"], fontName="Helvetica-Bold", fontSize=22, leading=29, alignment=TA_CENTER, textColor=NAVY),
        "meta": ParagraphStyle("meta", parent=base["BodyText"], fontName="Helvetica", fontSize=10.5, leading=16, alignment=TA_CENTER, textColor=INK),
        "h1": ParagraphStyle("h1", parent=base["Heading1"], fontName="Helvetica-Bold", fontSize=15, leading=21, textColor=NAVY, spaceBefore=8, spaceAfter=7),
        "h2": ParagraphStyle("h2", parent=base["Heading2"], fontName="Helvetica-Bold", fontSize=12, leading=17, textColor=BLUE, spaceBefore=5, spaceAfter=5),
        "body": ParagraphStyle("body", parent=base["BodyText"], fontName="Helvetica", fontSize=9.5, leading=14.5, textColor=INK, spaceAfter=5),
        "small": ParagraphStyle("small", parent=base["BodyText"], fontName="Helvetica", fontSize=8.0, leading=11, textColor=INK),
        "tiny": ParagraphStyle("tiny", parent=base["BodyText"], fontName="Helvetica", fontSize=6.7, leading=8.8, textColor=INK),
        "tinyW": ParagraphStyle("tinyW", parent=base["BodyText"], fontName="Helvetica", fontSize=6.7, leading=8.8, textColor=colors.white),
        "smallW": ParagraphStyle("smallW", parent=base["BodyText"], fontName="Helvetica", fontSize=8.0, leading=11, textColor=colors.white),
    }


def P(text, style):
    safe = str(text).replace("&", "&amp;")
    return Paragraph(safe, style)


AREA_ROWS = [
    ["Area", "Safety", "Distance", "Food", "Hospitals", "Internet", "Commute", "Rent", "Peace", "Overall"],
    ["Eachanari", "8", "10", "8", "8", "8", "10", "8", "8", "8.5"],
    ["Malumichampatti", "7", "8", "7", "7", "7", "8", "9", "8", "7.6"],
    ["Kurichi", "8", "7", "9", "8", "8", "7", "7", "7", "7.6"],
    ["Podanur", "7", "6", "9", "9", "8", "6", "7", "6", "7.2"],
    ["Kuniyamuthur", "8", "6", "9", "8", "9", "6", "6", "7", "7.4"],
]

MONTHLY = [
    ["Rent", 7000, 6500, 10000],
    ["Electricity", 1000, 600, 1500],
    ["Fiber Internet / Wi-Fi", 900, 600, 1200],
    ["Groceries + cooking", 5000, 3500, 6500],
    ["Bike fuel + maintenance", 1800, 1200, 2500],
    ["Emergency / medical buffer", 1500, 800, 2500],
]

ONE_TIME = [
    ["Security Deposit", "Rs 10,000", "Based on the recommended house"],
    ["Kitchen essentials", "Rs 3,500 - Rs 6,000", "Induction/gas, vessels, storage"],
    ["Mattress", "Rs 3,000 - Rs 6,000", "Only if cot/bed is not provided"],
    ["Wi-Fi setup/router", "Rs 0 - Rs 2,000", "Depends on ISP offer"],
    ["Basic utensils", "Rs 2,000 - Rs 3,500", "Plate, tumbler, cooker, pan"],
    ["Cleaning supplies", "Rs 800 - Rs 1,500", "Bucket, broom, mop, liquids"],
    ["Bike accessories", "Rs 1,000 - Rs 2,000", "Lock, rain cover, basic toolkit"],
]

VERIFY = [
    "Water source - borewell / corporation / tanker backup",
    "Fiber Internet availability - Airtel / Jio / ACT / local ISP",
    "Neighbour quality and street activity",
    "Safe bike parking",
    "Rent agreement, notice period, and lock-in period",
    "Security deposit refund terms in writing",
    "Power cut frequency",
    "Night street safety and street lighting",
    "Noise from traffic, workshops, factories, or loudspeakers",
    "Indoor mobile signal and speed test",
    "Owner ID and ownership documents",
    "Separate EB connection and meter-reading process",
]

RISKS = [
    ["Living alone", "Maintain routine, emergency contacts, and location sharing."],
    ["Cooking", "Keep a simple cooking plan and reduce outside food."],
    ["Bills", "Put rent, EB, and Wi-Fi due dates into calendar reminders."],
    ["Cleaning", "Clean twice a week and deep-clean once a month."],
    ["Maintenance", "Inform the owner on WhatsApp and keep repair records."],
    ["Emergency", "Pin nearby hospital, pharmacy, friend, and owner contacts."],
]


def table(rows, widths, s, tiny=False):
    normal = s["tiny"] if tiny else s["small"]
    head = s["tinyW"] if tiny else s["smallW"]
    data = [[P(c, head if i == 0 else normal) for c in row] for i, row in enumerate(rows)]
    t = Table(data, colWidths=widths, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("GRID", (0, 0), (-1, -1), 0.35, GRID),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, PALE]),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    return t


def card(title, lines, s):
    rows = [[P(title, s["h2"])]] + [[P(x, s["body"])] for x in lines]
    t = Table(rows, colWidths=[176 * mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT),
        ("BOX", (0, 0), (-1, -1), 1, BLUE),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    return t


def house_rows(houses):
    rows = [["#", "House", "Rent", "Deposit", "Distance", "Time", "Furnished", "Parking", "Advantages", "Watch-outs"]]
    for i, h in enumerate(houses, 1):
        kind = "1BHK House" if h["bedrooms"] == "1" and "House" in h["type"] else ("2BHK House" if h["bedrooms"] == "2" and "House" in h["type"] else f"{h['bedrooms']}BHK Flat")
        if i == 1:
            plus = "Low rent, very close, semi-furnished"
            minus = "Verify water, parking, and agreement terms"
        elif h["furnished"] == "Unfurnished":
            plus = "Rent is controlled; commute is acceptable"
            minus = "Unfurnished; setup cost required"
        else:
            plus = "Close to college; easy commute"
            minus = "Verify deposit and owner terms"
        if "500,000" in h["deposit"]:
            minus = "Deposit appears very high; avoid or strictly verify"
        rows.append([str(i), f"{h['locality']} - {kind}", money(h["rent"]), money(h["deposit"]), f"{h['distance']} km", h["time"], h["furnished"], h["parking"].replace("Ask owner", "Ask owner"), plus, minus])
    return rows


def build_pdf(houses):
    s = styles()
    best = houses[0]
    monthly_now = sum(x[1] for x in MONTHLY)
    monthly_min = sum(x[2] for x in MONTHLY)
    monthly_max = sum(x[3] for x in MONTHLY)
    yearly = monthly_now * 12 + 17000
    path = os.path.join(OUT, "rathinam_house_report_english.pdf")
    doc = SimpleDocTemplate(path, pagesize=A4, leftMargin=16*mm, rightMargin=16*mm, topMargin=15*mm, bottomMargin=14*mm)
    story = []

    story += [Spacer(1, 30*mm), P("Rental House Near Rathinam Technical Campus", s["cover"]), P("Complete Decision Report", s["cover"]), Spacer(1, 12*mm)]
    story += [P("Prepared for: My Father", s["meta"]), P("Prepared by: Dragon", s["meta"]), P("Date: 05 July 2026", s["meta"]), Spacer(1, 18*mm)]
    story += [card("Executive Recommendation", [
        "For a temporary one-year stay, the best balance is the 1BHK Residential House in Eachanari: low cost, peaceful setting, and very short commute.",
        f"Rent: {money(best['rent'])} | Security Deposit: {money(best['deposit'])} | Travel: {best['distance']} km / {best['time']}",
    ], s), Spacer(1, 5*mm), P("This is not an emotional decision. It is a practical productivity decision based on rent, commute, safety, internet suitability, and the plan to pursue an MBA abroad after graduation.", s["body"]), PageBreak()]

    story += [P("1. Why Move Out of the Hostel", s["h1"])]
    story.append(P("The purpose is not luxury. The goal is to create a quiet and controlled environment for studies, AI development, software projects, portfolio work, and MBA preparation for about 10-12 months.", s["body"]))
    for item in ["Better concentration", "Quiet environment", "Better sleep", "Better food control", "AI development and software projects", "MBA preparation", "Privacy and independence", "Temporary one-year plan only"]:
        story.append(P("- " + item, s["body"]))
    story += [P("2. Requirements", s["h1"])]
    for item in ["Rent between Rs 5,000 and Rs 10,000; maximum Rs 12,000 only for a significantly better option", "Independent room / 1 RK / 1 BHK / small independent house", "No PG, no hostel, no shared room", "Safe area, peaceful neighbourhood, good roads", "Hospital, grocery, and pharmacy nearby", "Bike travel below 15-20 minutes", "Good internet, good water, and good mobile signal", "Easy move-out after one year"]:
        story.append(P("- " + item, s["body"]))
    story += [P("3. Area Comparison", s["h1"]), table(AREA_ROWS, [30*mm,16*mm,14*mm,14*mm,18*mm,17*mm,16*mm,16*mm,17*mm,18*mm], s, tiny=True), Spacer(1,4*mm), P("Scores are estimated out of 10 based on public information, commute logic, residential suitability, and facility availability. Final confirmation must happen during a physical visit.", s["small"]), PageBreak()]

    story += [P("4. Top 10 Houses", s["h1"]), table(house_rows(houses), [7*mm,33*mm,15*mm,18*mm,13*mm,14*mm,18*mm,19*mm,30*mm,29*mm], s, tiny=True), PageBreak()]
    story += [P("5. Recommended House", s["h1"]), card("Recommended House - Eachanari 1BHK Residential House", [
        f"Rent: {money(best['rent'])}",
        f"Security Deposit: {money(best['deposit'])}",
        f"Bike distance: {best['distance']} km",
        f"Travel time: {best['time']}",
        f"Furnishing: {best['furnished']}",
        "Daily commute to college will be easy.",
        "Semi-furnished status reduces initial setup cost.",
        "Rent and deposit are practical for a temporary one-year stay.",
    ], s), P("This house is not being chosen for luxury. It is being chosen to create a quiet, productive, low-cost environment. Before paying any advance, water, parking, agreement terms, deposit refund, neighbours, and internet availability must be verified in person.", s["body"])]

    budget = [["Expense", "Current", "Minimum", "Maximum"]] + [[x[0], money(x[1]), money(x[2]), money(x[3])] for x in MONTHLY] + [["Total", money(monthly_now), money(monthly_min), money(monthly_max)]]
    story += [P("6. Expected Expenses - Monthly Budget", s["h1"]), table(budget, [62*mm,38*mm,38*mm,38*mm], s), P(f"Yearly cost estimate: average monthly cost {money(monthly_now)} x 12 + basic setup buffer = about {money(yearly)}.", s["body"]), PageBreak()]
    story += [P("7. One-Time Expenses", s["h1"]), table([["Item", "Approx. Amount", "Note"]] + ONE_TIME + [["Total", "Rs 21,300 - Rs 31,000", "Approximate setup range including deposit"]], [55*mm,42*mm,79*mm], s), PageBreak()]

    story += [P("8. Verify Before Paying Advance", s["h1"])]
    for item in VERIFY:
        story.append(P("- " + item, s["body"]))
    story += [P("9. Advantages of an Independent Room", s["h1"]), P("An independent room is better than a hostel for this one-year phase because it improves focus, privacy, health control, project execution, MBA preparation, and time management. The goal is not isolation; the goal is a quiet execution environment.", s["body"])]
    story += [P("10. Possible Risks and Management", s["h1"]), table([["Risk", "How to Manage"]] + RISKS, [52*mm,124*mm], s)]
    story += [P("11. Final Recommendation", s["h1"]), card("Respectful Request to Father", ["Father, I am not choosing this emotionally. I studied the distance, rent, deposit, safety, internet, water, and future MBA plan carefully. This house is only for about one year. After graduation, I plan to move abroad for an MBA. So this is not a permanent expense; it is a temporary investment for better productivity, health, projects, and preparation. Please review it and share your opinion. I will pay advance only after you are comfortable with it."], s)]

    def footer(canvas, doc_):
        canvas.saveState()
        canvas.setFont("Helvetica", 7)
        canvas.setFillColor(MUTED)
        canvas.drawString(16*mm, 8*mm, "Rental House Near Rathinam Technical Campus - Decision Report")
        canvas.drawRightString(194*mm, 8*mm, str(doc_.page))
        canvas.restoreState()

    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    return path


if __name__ == "__main__":
    print(build_pdf(load_houses()))
