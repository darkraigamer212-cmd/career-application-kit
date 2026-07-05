import json
import tempfile
import unittest
from pathlib import Path

from rental_research_pdf import (
    build_arg_parser,
    extract_property_objects,
    extract_state,
    first_list,
    haversine_km,
    load_report_data,
    normalize_magicbricks_listing,
    score,
)


FIXTURES = Path(__file__).parent / "fixtures"


class RentalResearchTests(unittest.TestCase):
    def test_haversine_returns_zero_for_same_point(self):
        self.assertAlmostEqual(haversine_km(10.915, 76.970, 10.915, 76.970), 0.0)

    def test_haversine_estimates_known_nearby_distance(self):
        distance = haversine_km(10.915, 76.970, 10.930, 76.970)
        self.assertGreater(distance, 1.5)
        self.assertLess(distance, 1.8)

    def test_score_rewards_low_rent_short_commute_and_semifurnished_house(self):
        strong_listing = {
            "rent": 7000,
            "distance": 2.2,
            "furnished": "Semi-Furnished",
            "type": "Residential House",
            "deposit": "Rs 10,000",
        }
        weak_listing = {
            "rent": 11000,
            "distance": 9.5,
            "furnished": "Unfurnished",
            "type": "Apartment",
            "deposit": "Rs 60,000",
        }
        self.assertGreater(score(strong_listing), score(weak_listing))

    def test_score_accepts_missing_distance_estimate(self):
        listing = {
            "rent": 8500,
            "distance": "Estimate needed",
            "furnished": "Unfurnished",
            "type": "Apartment",
            "deposit": "Not public",
        }
        self.assertIsInstance(score(listing), float)

    def test_load_report_data_reads_ranked_and_sources(self):
        payload = {"ranked": [{"rent": 7000}], "sources": [["Sample", "Demo", "sample.json"]]}
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "sample.json"
            path.write_text(json.dumps(payload), encoding="utf-8")
            rows, sources = load_report_data(path)
        self.assertEqual(rows, payload["ranked"])
        self.assertEqual(sources, payload["sources"])

    def test_load_report_data_rejects_wrong_shape(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "bad.json"
            path.write_text(json.dumps({"items": []}), encoding="utf-8")
            with self.assertRaises(ValueError):
                load_report_data(path)

    def test_cli_parser_accepts_input_and_output_names(self):
        args = build_arg_parser().parse_args(
            [
                "--input-json",
                "sample_data/rental_listings_sample.json",
                "--pdf-name",
                "sample.pdf",
                "--no-summary",
            ]
        )
        self.assertEqual(args.input_json, "sample_data/rental_listings_sample.json")
        self.assertEqual(args.pdf_name, "sample.pdf")
        self.assertTrue(args.no_summary)

    def test_normalize_magicbricks_listing_accepts_valid_house(self):
        listing = {
            "id": "valid-1",
            "propertyTitle": "1 BHK Residential House",
            "propTypeD": "Residential House",
            "bedroomD": "1",
            "price": 7000,
            "seoDesc": "1 BHK house for rent",
            "ltcoordGeo": "10.915,76.970",
            "catAdd1": "Sample Street",
            "lmtDName": "Eachanari",
            "bookingAmtExact": "10000",
            "seoURL": "sample-listing",
            "furnishedD": "Semi-Furnished",
            "parkingD": "Bike parking",
            "ca": "520",
            "postedLabelD": "Sample",
        }
        row = normalize_magicbricks_listing(listing, "Eachanari")
        self.assertIsNotNone(row)
        self.assertEqual(row["rent"], 7000)
        self.assertEqual(row["deposit"], "Rs 10,000")
        self.assertEqual(row["locality"], "Eachanari")
        self.assertTrue(row["url"].startswith("https://www.magicbricks.com/"))

    def test_normalize_magicbricks_listing_rejects_pg_and_hostel(self):
        listing = {
            "propertyTitle": "PG room near college",
            "propTypeD": "Paying Guest",
            "bedroomD": "1",
            "price": 7000,
            "seoDesc": "shared hostel room",
        }
        self.assertIsNone(normalize_magicbricks_listing(listing, "Eachanari"))

    def test_normalize_magicbricks_listing_rejects_out_of_budget(self):
        listing = {
            "propertyTitle": "1 BHK Residential House",
            "propTypeD": "Residential House",
            "bedroomD": "1",
            "price": 15000,
            "seoDesc": "1 BHK house",
        }
        self.assertIsNone(normalize_magicbricks_listing(listing, "Eachanari"))

    def test_normalize_magicbricks_listing_rejects_far_listing(self):
        listing = {
            "propertyTitle": "1 BHK Residential House",
            "propTypeD": "Residential House",
            "bedroomD": "1",
            "price": 8000,
            "seoDesc": "1 BHK house",
            "ltcoordGeo": "11.200,77.200",
        }
        self.assertIsNone(normalize_magicbricks_listing(listing, "Eachanari"))

    def test_extract_state_reads_direct_result_list_fixture(self):
        html = (FIXTURES / "magicbricks_direct_result_list.html").read_text(encoding="utf-8")
        state = extract_state(html)
        listings = first_list(state)
        self.assertEqual(len(listings), 1)
        self.assertEqual(listings[0]["propertyTitle"], "1 BHK Residential House")

    def test_extract_state_reads_server_preloaded_fixture(self):
        html = (FIXTURES / "magicbricks_server_state.html").read_text(encoding="utf-8")
        state = extract_state(html)
        listings = first_list(state)
        self.assertEqual(len(listings), 1)
        self.assertEqual(listings[0]["propertyTitle"], "2 BHK Apartment")

    def test_extract_property_objects_reads_card_fixture(self):
        html = (FIXTURES / "magicbricks_property_objects.html").read_text(encoding="utf-8")
        listings = extract_property_objects(html)
        self.assertEqual(len(listings), 2)
        self.assertEqual(listings[0]["encId"], "abc123")
        self.assertEqual(listings[1]["propertyTitle"], "2 BHK Residential House")


if __name__ == "__main__":
    unittest.main()
