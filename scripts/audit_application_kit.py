import argparse
import re
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

REQUIRED_FILES = [
    "README.md",
    "requirements.txt",
    ".gitignore",
    ".github/workflows/python-tests.yml",
    "profile_data.example.json",
    "scripts/apply_profile_data.py",
    "scripts/build_resumes.py",
    "scripts/build_sample_report.py",
    "tests/test_rental_research.py",
    "tests/fixtures/magicbricks_direct_result_list.html",
    "tests/fixtures/magicbricks_server_state.html",
    "tests/fixtures/magicbricks_property_objects.html",
    "sample_data/rental_listings_sample.json",
    "portfolio/index.html",
    "portfolio/styles.css",
    "docs/application_kit_index.md",
    "docs/finalize_personal_details.md",
    "docs/github_profile_readme.md",
    "docs/github_repo_setup.md",
    "docs/project_case_study_rental_research.md",
    "docs/interview_talking_points.md",
    "docs/linkedin_profile.md",
    "docs/resume_ats.md",
    "docs/resume_startup.md",
    "docs/application_message_templates.md",
    "docs/generated/karthik_ats_resume.docx",
    "docs/generated/karthik_ats_resume.pdf",
    "docs/generated/karthik_startup_resume.docx",
    "docs/generated/karthik_startup_resume.pdf",
    "output/pdf/rathinam_rental_research_pack_page-1.png",
    "output/pdf/sample_rental_research_pack.pdf",
]

PUBLISH_TARGETS = [
    "docs/resume_ats.md",
    "docs/resume_startup.md",
    "docs/github_profile_readme.md",
    "docs/application_message_templates.md",
    "portfolio/index.html",
]

COMMANDS = [
    [sys.executable, "-m", "unittest", "discover", "-s", "tests"],
    [sys.executable, "scripts/build_sample_report.py"],
    [
        sys.executable,
        "-m",
        "py_compile",
        "scripts/apply_profile_data.py",
        "scripts/audit_application_kit.py",
        "scripts/build_resumes.py",
        "scripts/build_sample_report.py",
        "rental_research_pdf.py",
        "english_report_builder.py",
        "tamil_report_v2.py",
        "tamil_rental_report_builder.py",
        "tests/test_rental_research.py",
    ],
]


def rel(path):
    return str(path.relative_to(ROOT)).replace("\\", "/")


def find_placeholders():
    found = {}
    for item in PUBLISH_TARGETS:
        path = ROOT / item
        text = path.read_text(encoding="utf-8")
        matches = sorted(set(re.findall(r"ADD_[A-Z0-9_]+", text)))
        if matches:
            found[item] = matches
    return found


def run_command(command):
    return subprocess.run(command, cwd=ROOT, text=True, capture_output=True)


def main():
    parser = argparse.ArgumentParser(description="Audit the local application kit for readiness.")
    parser.add_argument("--skip-commands", action="store_true", help="Only check files/placeholders; skip test/demo commands.")
    parser.add_argument("--allow-placeholders", action="store_true", help="Do not fail when ADD_* placeholders remain.")
    args = parser.parse_args()

    failures = []
    warnings = []

    print("Application kit audit")
    print("=====================")

    for item in REQUIRED_FILES:
        path = ROOT / item
        if not path.exists():
            failures.append(f"Missing required file: {item}")
        elif path.is_file() and path.stat().st_size == 0:
            failures.append(f"Required file is empty: {item}")

    if (ROOT / "profile_data.json").exists():
        warnings.append("profile_data.json exists locally; confirm it is not staged before committing.")
    else:
        warnings.append("profile_data.json is not present yet, so publishable files still need real personal details.")

    placeholders = find_placeholders()
    if placeholders and not args.allow_placeholders:
        for item, matches in placeholders.items():
            failures.append(f"Placeholders remain in {item}: {', '.join(matches)}")
    elif placeholders:
        for item, matches in placeholders.items():
            warnings.append(f"Placeholders remain in {item}: {', '.join(matches)}")

    if not args.skip_commands:
        for command in COMMANDS:
            result = run_command(command)
            command_text = " ".join(command)
            if result.returncode != 0:
                failures.append(f"Command failed: {command_text}\n{result.stdout}{result.stderr}")
            else:
                print(f"OK command: {command_text}")

    if warnings:
        print("\nWarnings")
        for warning in warnings:
            print(f"- {warning}")

    if failures:
        print("\nFailures")
        for failure in failures:
            print(f"- {failure}")
        raise SystemExit(1)

    print("\nAudit passed.")


if __name__ == "__main__":
    main()
