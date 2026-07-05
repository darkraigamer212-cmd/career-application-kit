# Application Kit Index

Use this file as the control center before applying for remote internships, freelance work, and part-time developer roles.

## Personal Details

- Profile data example: `profile_data.example.json`
- Local private profile data: `profile_data.json` (gitignored)
- Profile data apply script: `scripts/apply_profile_data.py`
- Readiness audit script: `scripts/audit_application_kit.py`
- Finalization guide: `docs/finalize_personal_details.md`

## GitHub

- Root README: `README.md`
- GitHub profile README draft: `docs/github_profile_readme.md`
- Project recommendation and cleanup plan: `docs/career_review.md`
- Repository setup guide: `docs/github_repo_setup.md`
- GitHub Actions test workflow: `.github/workflows/python-tests.yml`

## Portfolio

- Static portfolio starter: `portfolio/index.html`
- Styles: `portfolio/styles.css`
- Publishing checklist: `docs/portfolio_publish_checklist.md`
- Intended public portfolio URL: `https://darkraigamer212-cmd.github.io/career-application-kit/portfolio/`

## Resumes

- ATS Markdown resume: `docs/resume_ats.md`
- ATS DOCX resume: `docs/generated/karthik_ats_resume.docx`
- ATS PDF resume: `docs/generated/karthik_ats_resume.pdf`
- Startup Markdown resume: `docs/resume_startup.md`
- Startup DOCX resume: `docs/generated/karthik_startup_resume.docx`
- Startup PDF resume: `docs/generated/karthik_startup_resume.pdf`

## LinkedIn

- LinkedIn rewrite: `docs/linkedin_profile.md`

## Outreach

- Internship, freelance, and part-time message templates: `docs/application_message_templates.md`

## Featured Project Proof

- Offline demo data: `sample_data/rental_listings_sample.json`
- Offline demo command: `python scripts/build_sample_report.py`
- Unit test command: `python -m unittest discover -s tests`
- Project case study: `docs/project_case_study_rental_research.md`
- Interview talking points: `docs/interview_talking_points.md`

## Readiness Audit

Run this after updating personal details:

```bash
python scripts/audit_application_kit.py
```

If checking a starter/example profile only, use:

```bash
python scripts/audit_application_kit.py --allow-placeholders
```

## Before Applying

1. Push this repo to GitHub with the clean name `career-application-kit`.
2. Enable GitHub Pages and verify the portfolio/resume URLs.
3. Pin only the strongest repositories.
4. Review the live LinkedIn profile after sign-in.
5. Add a short demo GIF if you want stronger visual proof than the current README screenshot.
