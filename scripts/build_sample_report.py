import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SAMPLE = ROOT / "sample_data" / "rental_listings_sample.json"
sys.path.insert(0, str(ROOT))

from rental_research_pdf import main as build_report_main


def main():
    build_report_main(
        [
            "--input-json",
            str(SAMPLE),
            "--pdf-name",
            "sample_rental_research_pack.pdf",
            "--no-summary",
        ]
    )


if __name__ == "__main__":
    main()
