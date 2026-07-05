# Portfolio Publish Checklist

## Before Publishing

1. Confirm `portfolio/index.html` has the final email, GitHub URL, LinkedIn URL, project links, and resume link.
2. Confirm `docs/resume_ats.md` and `docs/resume_startup.md` have final education, skills, and availability details.
3. Regenerate DOCX/PDF files:

```bash
python scripts/build_resumes.py
```

4. Open `portfolio/index.html` locally and check desktop/mobile layout.

## Simple Hosting Options

### GitHub Pages

Best if this portfolio stays inside the same repository.

1. Push the repo to GitHub.
2. Go to Settings > Pages.
3. Set source to the main branch.
4. Use the public portfolio URL: `https://darkraigamer212-cmd.github.io/career-application-kit/portfolio/`.
5. Use the public resume URL: `https://darkraigamer212-cmd.github.io/career-application-kit/docs/generated/karthik_ats_resume.pdf`.

### Netlify

Best if you want drag-and-drop hosting.

1. Create a folder containing `portfolio/index.html`, `portfolio/styles.css`, `docs/generated/karthik_ats_resume.pdf`, and the `output/pdf/` preview/sample PDF assets referenced by the page.
2. Drag that folder into Netlify.
3. Update the final deployed URL in GitHub, LinkedIn, and the resume.

### Vercel

Best if you later convert the portfolio into React or Next.js.

1. Import the GitHub repository.
2. Set the output/root directory to `portfolio` if prompted.
3. Deploy and add the URL to your profiles.

## Final Checks

- Hero section loads without broken links.
- Resume download works.
- Sample PDF link works.
- GitHub and LinkedIn links open in a new tab or same tab intentionally.
- Mobile layout does not overflow.
- No starter placeholders remain in publishable resume, portfolio, GitHub profile, or LinkedIn copy.
