# Finalize Personal Details

Use this when you are ready to replace placeholders with real application details.

## 1. Create Local Profile Data

Copy the example file:

```bash
copy profile_data.example.json profile_data.json
```

Edit `profile_data.json` with your real details:

- name
- email
- phone
- city/country
- GitHub URL
- LinkedIn URL
- portfolio URL
- degree
- college
- graduation year
- experience dates
- resume link

`profile_data.json` is intentionally gitignored so private contact details do not get committed by accident.

## 2. Apply Details To Drafts

Preview what will change:

```bash
python scripts/apply_profile_data.py --dry-run
```

Use a specific profile file if you want to test safely before creating `profile_data.json`:

```bash
python scripts/apply_profile_data.py --profile C:\path\to\profile.json --dry-run
```

Apply your details to the Markdown drafts and portfolio:

```bash
python scripts/apply_profile_data.py
```

If you intentionally want to leave timeline or budget placeholders inside outreach templates, fill `default_timeline` and `default_budget` in `profile_data.json`, or edit those messages manually per job.

## 3. Regenerate Resume Files

```bash
python scripts/build_resumes.py
```

Generated files:

- `docs/generated/karthik_ats_resume.docx`
- `docs/generated/karthik_ats_resume.pdf`
- `docs/generated/karthik_startup_resume.docx`
- `docs/generated/karthik_startup_resume.pdf`

## 4. Update Any Remaining Custom Draft Fields

Check and manually tailor any remaining placeholders in:

- `docs/resume_ats.md`
- `docs/resume_startup.md`
- `docs/github_profile_readme.md`
- `docs/application_message_templates.md`
- `portfolio/index.html`

## 5. Audit Placeholders

```bash
Select-String -Path docs\*.md,portfolio\index.html -Pattern 'starter placeholder'
```

No starter placeholders should remain in files you plan to publish or send.

## 6. Run Readiness Audit

```bash
python scripts/audit_application_kit.py
```

If you are checking the kit before real personal details are filled, use:

```bash
python scripts/audit_application_kit.py --allow-placeholders
```

## 7. Final Checks

```bash
python -m unittest discover -s tests
python scripts/build_sample_report.py
python -m py_compile rental_research_pdf.py english_report_builder.py tamil_report_v2.py tamil_rental_report_builder.py scripts\build_resumes.py scripts\build_sample_report.py scripts\apply_profile_data.py scripts\audit_application_kit.py tests\test_rental_research.py
```
