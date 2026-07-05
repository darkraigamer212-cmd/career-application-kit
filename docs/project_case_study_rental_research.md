# Case Study: Rental Research Report Generator

## One-Line Summary

Python automation tool that turns noisy rental listing data into a ranked housing shortlist and bilingual decision reports.

## Problem

Finding a temporary student rental near Rathinam Technical Campus required checking multiple portals, filtering unsuitable options, estimating commute fit, and explaining the decision clearly to family. Manual searching was slow, inconsistent, and easy to forget.

## Goal

Build a practical tool that can:

- collect public listing data,
- remove unsuitable listings,
- rank the remaining options,
- generate a clear PDF report,
- support an offline demo with sample data,
- explain limitations honestly.

## Constraints

- Public listing portals hide or change important fields such as owner phone, water source, deposit terms, and internet availability.
- Listings change quickly, so the report should be treated as a shortlist, not final truth.
- The report needed to be understandable to non-technical readers.
- The project needed an offline sample path so reviewers could run it without relying on live websites.

## Approach

1. Parse listing data from public pages or saved JSON.
2. Normalize listings into a consistent structure.
3. Reject bad matches such as PGs, hostels, shared rooms, high-rent properties, and far-away listings.
4. Score properties using rent, commute distance, furnishing, property type, and deposit practicality.
5. Generate PDF reports with ranked options, budgets, checklists, and source links.
6. Add sample data, unit tests, CLI flags, and a readiness audit so the project is easier to review.

## Technical Decisions

- Python was chosen because it is fast for scripting, parsing, scoring, and document generation.
- ReportLab was used for deterministic PDF generation.
- JSON was used as the offline data format so the report can run without live scraping.
- The filtering logic was extracted into `normalize_magicbricks_listing()` so it can be unit tested.
- The CLI supports `--input-json`, `--pdf-name`, and `--no-summary` to make demos repeatable.

## What I Would Improve Next

- Add budget, distance, and language flags to the CLI.
- Split report sections into reusable modules.
- Add saved real HTML parser fixtures.
- Add a small FastAPI endpoint that generates a report from uploaded JSON.
- Add a demo GIF or short walkthrough video.

## Interview Pitch

I built this because I wanted a real tool, not a tutorial project. It takes rental listing data, filters out unsuitable options, ranks the remaining homes, and generates a decision report with budgets and verification checklists. The interesting part was not just making a PDF. I had to think about unreliable public data, scoring tradeoffs, offline demos, and how to make the output understandable to a non-technical reader.

## Demo Script

1. Show the README preview image.
2. Run:

```bash
python scripts/build_sample_report.py
```

3. Open `output/pdf/sample_rental_research_pack.pdf`.
4. Show the tests:

```bash
python -m unittest discover -s tests
```

5. Mention that the live scraper is intentionally treated as unstable because rental portals change often.

