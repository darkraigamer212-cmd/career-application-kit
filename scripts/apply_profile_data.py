import argparse
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PROFILE_LOCAL = ROOT / "profile_data.json"
PROFILE_EXAMPLE = ROOT / "profile_data.example.json"

TARGETS = [
    ROOT / "docs" / "resume_ats.md",
    ROOT / "docs" / "resume_startup.md",
    ROOT / "docs" / "github_profile_readme.md",
    ROOT / "docs" / "application_message_templates.md",
    ROOT / "portfolio" / "index.html",
]

PLACEHOLDER_KEYS = {
    "ADD_EMAIL": "email",
    "ADD_PHONE": "phone",
    "ADD_CITY_COUNTRY": "city_country",
    "ADD_GITHUB_URL": "github_url",
    "ADD_LINKEDIN_URL": "linkedin_url",
    "ADD_PORTFOLIO_URL": "portfolio_url",
    "ADD_DEGREE": "degree",
    "ADD_COLLEGE": "college",
    "ADD_GRADUATION_YEAR": "graduation_year",
    "ADD_DATES": "experience_dates",
    "ADD_RESUME_LINK": "resume_link",
    "ADD_TIMELINE": "default_timeline",
    "ADD_BUDGET": "default_budget",
}

DEFAULT_OPTIONAL = {
    "default_timeline": "ADD_TIMELINE",
    "default_budget": "ADD_BUDGET",
}


def load_profile(path):
    with path.open("r", encoding="utf-8-sig") as fh:
        data = json.load(fh)
    return {**DEFAULT_OPTIONAL, **data}


def unresolved_profile_fields(profile):
    unresolved = []
    for placeholder, key in PLACEHOLDER_KEYS.items():
        value = str(profile.get(key, ""))
        if not value or value == placeholder or value.startswith("ADD_"):
            unresolved.append(key)
    return sorted(set(unresolved))


def apply_replacements(text, profile):
    for placeholder, key in PLACEHOLDER_KEYS.items():
        if key in profile:
            text = text.replace(placeholder, str(profile[key]))
    if "email" in profile:
        text = text.replace("mailto:ADD_EMAIL", f"mailto:{profile['email']}")
    return text


def main():
    parser = argparse.ArgumentParser(description="Apply profile_data.json values to public application drafts.")
    parser.add_argument("--dry-run", action="store_true", help="Report files that would change without writing them.")
    parser.add_argument("--check", action="store_true", help="Fail if target files still contain ADD_* placeholders after replacement.")
    parser.add_argument("--allow-placeholders", action="store_true", help="Allow unresolved ADD_* values in the profile data.")
    parser.add_argument("--profile", type=Path, help="Use a specific profile JSON file.")
    parser.add_argument("--use-example", action="store_true", help="Use profile_data.example.json instead of requiring profile_data.json.")
    args = parser.parse_args()

    profile_path = args.profile or (PROFILE_EXAMPLE if args.use_example else PROFILE_LOCAL)
    if not profile_path.exists():
        raise SystemExit("Create profile_data.json from profile_data.example.json before running this script.")

    profile = load_profile(profile_path)
    unresolved = unresolved_profile_fields(profile)
    if unresolved and not args.allow_placeholders:
        raise SystemExit("Fill these profile fields first: " + ", ".join(unresolved))

    changed = []
    remaining_placeholders = {}
    for path in TARGETS:
        original = path.read_text(encoding="utf-8")
        updated = apply_replacements(original, profile)
        if updated != original:
            changed.append(path)
            if not args.dry_run:
                path.write_text(updated, encoding="utf-8")
        leftovers = sorted(set(re.findall(r"ADD_[A-Z0-9_]+", updated)))
        if leftovers:
            remaining_placeholders[path] = leftovers

    if args.dry_run:
        print("Would update:")
    else:
        print("Updated:")
    for path in changed:
        print(f"- {path.relative_to(ROOT)}")
    if not changed:
        print("- no files")

    if args.check and remaining_placeholders:
        print("Remaining placeholders:")
        for path, placeholders in remaining_placeholders.items():
            print(f"- {path.relative_to(ROOT)}: {', '.join(placeholders)}")
        raise SystemExit(1)


if __name__ == "__main__":
    main()
