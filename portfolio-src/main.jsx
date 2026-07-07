import React, { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import "./styles.css";

const links = {
  portfolio: "https://darkraigamer212-cmd.github.io/career-application-kit/portfolio/",
  links: "https://darkraigamer212-cmd.github.io/career-application-kit/portfolio/links.html",
  atsResume: "../docs/generated/karthik_ats_resume.pdf",
  startupResume: "../docs/generated/karthik_startup_resume.pdf",
  github: "https://github.com/darkraigamer212-cmd/career-application-kit",
  linkedin: "https://www.linkedin.com/in/deepan-karthick-166735374/",
  email: "mailto:deepankarthick212@gmail.com",
  calculator: "https://calculator00.pages.dev/",
  erp: "https://lakshmipriya-erp.vercel.app/home",
  samplePdf: "../output/pdf/sample_rental_research_pack.pdf",
  caseStudy: "../docs/project_case_study_rental_research.md"
};

const screenshots = {
  portfolioHome: "./assets/screenshots/portfolio-home.png",
  oneTapLinks: "./assets/screenshots/one-tap-links.png",
  resumePreview: "./assets/screenshots/resume-preview.png",
  rentalReport: "./assets/screenshots/rental-research-report.png",
  printingErp: "./assets/screenshots/printing-erp-dashboard.png",
  calculator: "./assets/screenshots/timber-calculator.png"
};

const proofPoints = [
  { label: "Strongest proof", value: "Python rental research generator with tests and PDF output" },
  { label: "Business proof", value: "React/Supabase ERP-style workflow demo" },
  { label: "Ready to review", value: "ATS resume, startup resume, GitHub, LinkedIn, one-tap links" }
];

const trustSignals = [
  "Offline sample data and unit tests for reliable demos",
  "Generated PDF/DOCX reports, not only screenshots",
  "Project case study explains problem, constraints, approach, and limits",
  "Skills grouped honestly, with beginner tools labeled as basics",
  "Open to remote internships, part-time work, freelance, and contract projects"
];

const projects = [
  {
    name: "Rental Research Report Generator",
    type: "Python automation",
    image: screenshots.rentalReport,
    imageAlt: "Generated rental research report preview",
    problem: "Rental searches were scattered across noisy listings and hard to compare.",
    businessValue: "Turns a messy real-life decision into a ranked report that a family or reviewer can inspect.",
    proof: "Runnable offline demo, unit tests, sample PDF, case study, and generated report assets.",
    features: ["Normalizes public listing data", "Filters unsuitable listings", "Ranks by budget and commute fit", "Generates English/Tamil PDF and DOCX reports"],
    stack: ["Python", "ReportLab", "python-docx", "JSON", "unittest"],
    learned: "How to turn messy public data into a repeatable decision-support workflow.",
    links: [{ label: "Review Source", href: links.github }, { label: "Open Sample PDF", href: links.samplePdf }, { label: "Read Case Study", href: links.caseStudy }]
  },
  {
    name: "Printing Press ERP / Business Management System",
    type: "React business software",
    image: screenshots.printingErp,
    imageAlt: "Public printing press business workflow website screenshot",
    problem: "Local-business operations need structured workflow screens, not just static pages.",
    businessValue: "Shows practical thinking about inventory, production, order operations, dashboards, and business users.",
    proof: "Public demo route plus portfolio/resume explanation; source stays private unless approved.",
    features: ["Order workflow thinking", "Inventory and production tracking", "Dashboard-style operational views", "Role-based access concepts"],
    stack: ["React", "Supabase", "JavaScript", "Vite", "ERP workflows"],
    learned: "Business software must be simple enough for daily use and structured enough for operations.",
    links: [{ label: "Open Live ERP", href: links.erp }]
  },
  {
    name: "Career Application Kit / Portfolio System",
    type: "Career proof system",
    image: screenshots.portfolioHome,
    imageAlt: "Trust-focused portfolio homepage screenshot",
    problem: "Applications, resumes, links, and proof assets were scattered.",
    businessValue: "Packages proof into one recruiter-friendly system with resumes, links, trackers, reports, and project evidence.",
    proof: "Public portfolio, one-tap link page, generated resumes, application packs, and GitHub documentation.",
    features: ["ATS and startup resumes", "Portfolio and one-tap links", "Application packs and tracker", "Tests, scripts, reports, and public proof"],
    stack: ["React", "Python", "GitHub Pages", "Docs", "Automation"],
    learned: "A career system is stronger when every claim links back to proof.",
    links: [{ label: "Open One-tap Links", href: "links.html" }, { label: "Review GitHub", href: links.github }]
  },
  {
    name: "Curtain & Wallpaper Calculator",
    type: "Commercial calculator",
    image: screenshots.calculator,
    imageAlt: "Curtain and wallpaper calculator live site screenshot",
    problem: "Measurement-heavy local business tasks need quick, practical estimates.",
    businessValue: "Shows ability to build small workflow tools for local business tasks.",
    proof: "Public live demo.",
    features: ["Fast calculation flow", "Simple commercial UI", "Mobile-friendly layout", "Direct public demo"],
    stack: ["JavaScript", "HTML", "CSS", "Responsive UI"],
    learned: "Small tools become useful when the interface stays focused on the working task.",
    links: [{ label: "Open Live Demo", href: links.calculator }]
  }
];

const proofGallery = [
  { title: "Portfolio homepage", detail: "Trust-focused first screen", image: screenshots.portfolioHome },
  { title: "One-tap links", detail: "WhatsApp-shareable profile hub", image: screenshots.oneTapLinks },
  { title: "ATS resume", detail: "One-page PDF preview", image: screenshots.resumePreview },
  { title: "Rental report output", detail: "Generated report proof", image: screenshots.rentalReport },
  { title: "ERP/business workflow", detail: "Public proof route", image: screenshots.printingErp },
  { title: "Commercial calculator", detail: "Live calculator proof", image: screenshots.calculator }
];

const primaryLinks = [
  { label: "View Portfolio", detail: "Full proof page", href: "index.html", variant: "primary" },
  { label: "Download ATS Resume", detail: "One-page PDF", href: links.atsResume },
  { label: "GitHub", detail: "Code and docs", href: links.github },
  { label: "LinkedIn", detail: "Profile", href: links.linkedin }
];

const featuredProofLinks = [
  {
    title: "Printing Press ERP",
    detail: "Business workflow site for print and packaging operations.",
    image: screenshots.printingErp,
    href: links.erp,
    cta: "ERP Demo"
  },
  {
    title: "Rental Research Report",
    detail: "Python automation that ranks listings and generates reports.",
    image: screenshots.rentalReport,
    href: links.samplePdf,
    cta: "Report PDF"
  },
  {
    title: "Calculator",
    detail: "Commercial measurement calculator for quick estimates.",
    image: screenshots.calculator,
    href: links.calculator,
    cta: "Calculator"
  },
  {
    title: "Career Portfolio / GitHub",
    detail: "Trust-focused portfolio, resumes, proof assets, and docs.",
    image: screenshots.portfolioHome,
    href: links.github,
    cta: "GitHub"
  }
];

const secondaryLinks = [
  { label: "Startup Resume", detail: "Project-focused PDF", href: links.startupResume },
  { label: "Case Study", detail: "Rental research breakdown", href: links.caseStudy },
  { label: "Sample Report", detail: "Generated PDF output", href: links.samplePdf }
];

const skillGroups = [
  { title: "Strong", items: ["React", "JavaScript", "Python", "HTML", "CSS", "Git", "GitHub", "Supabase", "Dashboards", "Automation", "ERP workflows"] },
  { title: "Working knowledge", items: ["Django basics", "PDF/DOCX generation", "Testing", "CLI tools", "REST API basics", "PostgreSQL basics", "Technical documentation"] },
  { title: "Currently learning", items: ["TypeScript basics", "Docker basics", "CI/CD basics", "GitHub Actions", "GSAP basics", "Framer Motion basics"] }
];

const timeline = [
  {
    label: "2026 - Present",
    title: "Lakshmipriya ERP / business software work",
    body: "Built and presented ERP-style business software thinking with React, Supabase, dashboards, workflow tracking, and operational screens."
  },
  {
    label: "Independent projects",
    title: "Automation, reporting, and portfolio systems",
    body: "Built rental research automation, PDF/DOCX generation, public portfolio links, career docs, and small business tools."
  },
  {
    label: "Workflow",
    title: "AI-assisted development with manual verification",
    body: "Uses AI tools for planning, coding support, documentation, and debugging while keeping claims, code, and outputs reviewed by the developer."
  },
  {
    label: "Communication",
    title: "Teaching interest and technical support mindset",
    body: "Interested in explaining software clearly, documenting setup, and helping peers understand practical development workflows."
  }
];

const fadeUp = {
  initial: { opacity: 1, y: 0 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-70px" },
  transition: { duration: 0.62, ease: "easeOut" }
};

function App() {
  const isLinksPage = document.body.dataset.page === "links";

  return (
    <>
      <AnimatedBackground />
      <Header compact={isLinksPage} />
      {isLinksPage ? <LinksPage /> : <PortfolioPage />}
    </>
  );
}

function Header({ compact }) {
  return (
    <header className="site-header">
      <a className="brand" href={compact ? "index.html" : "#home"} aria-label="Deepan Karthick portfolio home">
        <KLogo small />
        <span>Deepan Karthick</span>
      </a>
      <nav aria-label="Primary navigation">
        <a href={compact ? "index.html#projects" : "#projects"}>Projects</a>
        <a href={compact ? "index.html#skills" : "#skills"}>Skills</a>
        <a href={compact ? "index.html#experience" : "#experience"}>Experience</a>
        <a href="links.html">Links</a>
      </nav>
    </header>
  );
}

function PortfolioPage() {
  return (
    <main>
      <CyberHero />
      <TrustOverview />
      <AicRaiseReady />
      <About />
      <Projects />
      <ProofGallery />
      <SkillMatrix />
      <Timeline />
      <LinkHub />
    </main>
  );
}

function CyberHero() {
  const glowRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion || !glowRef.current) return;
    const pulse = gsap.to(glowRef.current, {
      filter: "drop-shadow(0 0 34px rgba(0, 229, 255, 0.82))",
      scale: 1.025,
      duration: 1.8,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });
    return () => pulse.kill();
  }, [reduceMotion]);

  return (
    <section id="home" className="hero section-shell">
      <motion.div className="hero-copy" {...fadeUp}>
        <p className="signal">B.Sc. CS (AI) student / Python automation / React dashboards</p>
        <h1>Practical software for messy business workflows.</h1>
        <p className="lead">I build Python report generators, React dashboards, ERP-style workflow tools, and one-tap proof systems for remote internships, freelance work, and startup teams.</p>
        <div className="button-row">
          <MotionLink className="button primary" href="#proof">30-second Proof</MotionLink>
          <MotionLink className="button" href={links.atsResume}>ATS Resume</MotionLink>
          <MotionLink className="button" href={links.github}>Review GitHub</MotionLink>
          <MotionLink className="button" href={links.linkedin}>LinkedIn</MotionLink>
          <MotionLink className="button ghost" href="links.html">One-tap Links</MotionLink>
        </div>
        <div className="proof-strip" aria-label="Recruiter proof summary">
          <span>Python automation</span>
          <span>React dashboards</span>
          <span>ERP workflows</span>
          <span>PDF/DOCX reports</span>
          <span>Tests + sample data</span>
        </div>
      </motion.div>

      <motion.div className="hero-console" {...fadeUp} transition={{ duration: 0.7, delay: 0.12, ease: "easeOut" }}>
        <div className="orbital-logo" ref={glowRef}>
          <KLogo />
        </div>
        <DashboardMockup />
      </motion.div>
    </section>
  );
}

function TrustOverview() {
  return (
    <section id="proof" className="section-shell trust-overview">
      <motion.div className="section-heading" {...fadeUp}>
        <p className="section-label">30-second proof</p>
        <h2>What a recruiter or founder should trust quickly.</h2>
        <p>Not a claim-only profile: each headline skill points to a project, output, resume, or public link.</p>
      </motion.div>
      <div className="proof-grid">
        {proofPoints.map((item) => (
          <motion.article className="proof-card" key={item.label} {...fadeUp}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </motion.article>
        ))}
      </div>
      <motion.div className="trust-list neon-card" {...fadeUp}>
        <h3>Trust signals</h3>
        <ul>
          {trustSignals.map((signal) => <li key={signal}>{signal}</li>)}
        </ul>
      </motion.div>
    </section>
  );
}

function AicRaiseReady() {
  return (
    <section className="section-shell aic-callout">
      <motion.div className="neon-card aic-card" {...fadeUp}>
        <div>
          <p className="section-label">AIC RAISE ready</p>
          <h2>Available for flexible internship / startup project work.</h2>
          <p>React dashboards, Python automation, ERP/internal tools, AI-assisted software workflows, PDF/DOCX/report generation, and practical business software.</p>
        </div>
        <div className="aic-actions">
          <MotionLink className="button primary" href="links.html">View one-tap profile</MotionLink>
          <MotionLink className="button" href={links.atsResume}>Download resume</MotionLink>
          <MotionLink className="button ghost" href={links.email}>Contact me</MotionLink>
        </div>
      </motion.div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="section-shell two-column">
      <motion.div {...fadeUp}>
        <p className="section-label">About</p>
        <h2>Builder story, grounded in useful work.</h2>
      </motion.div>
      <motion.div className="copy-stack" {...fadeUp}>
        <p>I am Deepan Karthick, a B.Sc. Computer Science with Artificial Intelligence student at Rathinam Global University, Coimbatore. Expected graduation: 2028.</p>
        <p>I started with practical local problems and turned them into proof: a printing press ERP, rental research automation, calculators, generated reports, and this career application kit.</p>
        <p>My current focus is software engineering, AI-assisted development with manual verification, business software, dashboards, automation, and clear documentation.</p>
      </motion.div>
    </section>
  );
}

function Projects() {
  return (
    <section id="projects" className="section-shell">
      <motion.div className="section-heading" {...fadeUp}>
        <p className="section-label">Projects</p>
        <h2>Projects with business context and reviewable proof.</h2>
      </motion.div>
      <div className="project-grid">
        {projects.map((project, index) => (
          <ProjectCard key={project.name} project={project} index={index} />
        ))}
      </div>
    </section>
  );
}

function ProjectCard({ project, index }) {
  return (
    <motion.article className="neon-card project-card" {...fadeUp} transition={{ duration: 0.55, delay: Math.min(index * 0.06, 0.22), ease: "easeOut" }}>
      <div className="project-topline">
        <span>{project.type}</span>
        <span>0{index + 1}</span>
      </div>
      <h3>{project.name}</h3>
      <figure className="project-shot">
        <img src={project.image} alt={project.imageAlt} />
      </figure>
      <p><strong>Problem:</strong> {project.problem}</p>
      <p><strong>Business value:</strong> {project.businessValue}</p>
      <p><strong>Proof:</strong> {project.proof}</p>
      <div>
        <h4>Features</h4>
        <ul>
          {project.features.map((feature) => <li key={feature}>{feature}</li>)}
        </ul>
      </div>
      <div className="chips" aria-label={`${project.name} tech stack`}>
        {project.stack.map((item) => <span key={item}>{item}</span>)}
      </div>
      <p><strong>Learned:</strong> {project.learned}</p>
      <div className="card-links">
        {project.links.length ? project.links.map((link) => (
          <MotionLink key={link.label} href={link.href}>{link.label}</MotionLink>
        )) : <span className="private-link">No public link yet</span>}
      </div>
    </motion.article>
  );
}

function ProofGallery() {
  return (
    <section className="section-shell">
      <motion.div className="section-heading" {...fadeUp}>
        <p className="section-label">Screenshot proof</p>
        <h2>Real screens and generated outputs reviewers can inspect.</h2>
      </motion.div>
      <div className="proof-shot-grid">
        {proofGallery.map((item) => (
          <motion.figure className="proof-shot neon-card" key={item.title} {...fadeUp}>
            <img src={item.image} alt={`${item.title} screenshot`} />
            <figcaption>
              <strong>{item.title}</strong>
              <span>{item.detail}</span>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}

function SkillMatrix() {
  return (
    <section id="skills" className="section-shell">
      <motion.div className="section-heading" {...fadeUp}>
        <p className="section-label">Skills / Tech Stack</p>
        <h2>Grouped honestly by current confidence.</h2>
      </motion.div>
      <div className="skill-matrix">
        {skillGroups.map((group) => (
          <motion.article className="neon-card skill-card" key={group.title} {...fadeUp}>
            <h3>{group.title}</h3>
            <div className="chips">
              {group.items.map((item) => <span key={item}>{item}</span>)}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function Timeline() {
  return (
    <section id="experience" className="section-shell two-column">
      <motion.div {...fadeUp}>
        <p className="section-label">Experience / Leadership</p>
        <h2>Independent work, business software, and clear communication.</h2>
      </motion.div>
      <div className="timeline">
        {timeline.map((item) => (
          <motion.article className="timeline-item" key={item.title} {...fadeUp}>
            <span>{item.label}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function LinkHub() {
  return (
    <section id="contact" className="section-shell link-hub">
      <motion.div className="section-heading" {...fadeUp}>
        <p className="section-label">Contact / One-tap Links</p>
        <h2>Everything needed to decide and contact.</h2>
        <p>Open to remote internships, flexible part-time developer work, freelance automation, React dashboards, Python tools, and business software projects.</p>
      </motion.div>
      <motion.div className="link-grid" {...fadeUp}>
        <LinkTile label="Portfolio" detail="Public portfolio" href={links.portfolio} />
        <LinkTile label="ATS Resume" detail="PDF resume" href={links.atsResume} />
        <LinkTile label="Startup Resume" detail="Project-focused PDF" href={links.startupResume} />
        <LinkTile label="GitHub" detail="Source and docs" href={links.github} />
        <LinkTile label="LinkedIn" detail="Professional profile" href={links.linkedin} />
        <LinkTile label="Email" detail="Direct contact" href={links.email} />
        <LinkTile label="Timber Calculator" detail="Live web tool" href={links.calculator} />
        <LinkTile label="Printing Press ERP" detail="Public demo route" href={links.erp} />
      </motion.div>
      <motion.div className="whatsapp-panel neon-card" {...fadeUp}>
        <span>WhatsApp share text</span>
        <p>Hi, I am Deepan Karthick. I build React dashboards, Python automation, ERP-style business software, PDF/DOCX reports, and AI-assisted tools. Portfolio: {links.portfolio}</p>
      </motion.div>
    </section>
  );
}

function LinksPage() {
  return (
    <main className="links-page premium-links-page">
      <section className="links-business-card">
        <motion.div className="links-identity" {...fadeUp}>
          <KLogo />
          <div>
            <p className="section-label">One-tap profile</p>
            <h1>Deepan Karthick</h1>
            <p className="links-value">Python automation, React dashboards, ERP-style business software, and AI-assisted development workflows.</p>
            <p className="links-subtext">B.Sc. CS with AI student building practical software for real workflows.</p>
          </div>
        </motion.div>

        <motion.div className="primary-link-grid" {...fadeUp}>
          {primaryLinks.map((item) => (
            <PremiumLink key={item.label} {...item} />
          ))}
        </motion.div>

        <motion.section className="quick-contact neon-card" {...fadeUp}>
          <div>
            <span>Email</span>
            <a href={links.email}>deepankarthick212@gmail.com</a>
          </div>
          <p>Hi, I am Deepan Karthick. I build React dashboards, Python automation, ERP/internal tools, and report-generation workflows.</p>
          <strong>Available for flexible internship / startup projects.</strong>
        </motion.section>
      </section>

      <section className="links-section">
        <motion.div className="links-section-heading" {...fadeUp}>
          <p className="section-label">Featured proof</p>
          <h2>Strongest work to review first.</h2>
        </motion.div>
        <div className="featured-proof-list">
          {featuredProofLinks.map((item) => (
            <ProofLinkCard key={item.title} {...item} />
          ))}
        </div>
      </section>

      <section className="links-section secondary-links-section">
        <motion.div className="links-section-heading compact" {...fadeUp}>
          <p className="section-label">More links</p>
        </motion.div>
        <motion.div className="secondary-link-grid" {...fadeUp}>
          {secondaryLinks.map((item) => (
            <PremiumLink key={item.label} {...item} compact />
          ))}
        </motion.div>
      </section>

      <section className="links-section startup-cta">
        <motion.div className="neon-card startup-card" {...fadeUp}>
          <h2>Looking for a flexible intern or startup project contributor?</h2>
          <ul>
            <li>React dashboards</li>
            <li>Python automation</li>
            <li>ERP / internal tools</li>
          </ul>
          <MotionLink className="button primary" href="index.html">Open full portfolio</MotionLink>
        </motion.div>
      </section>
    </main>
  );
}

function PremiumLink({ label, detail, href, variant = "", compact = false }) {
  return (
    <MotionLink className={`premium-link ${variant} ${compact ? "compact" : ""}`} href={href}>
      <strong>{label}</strong>
      <span>{detail}</span>
    </MotionLink>
  );
}

function ProofLinkCard({ title, detail, image, href, cta }) {
  return (
    <motion.article className="proof-link-card neon-card" {...fadeUp}>
      <img src={image} alt={`${title} screenshot`} />
      <div>
        <h3>{title}</h3>
        <p>{detail}</p>
        <MotionLink className="proof-link-action" href={href}>{cta}</MotionLink>
      </div>
    </motion.article>
  );
}

function LinkTile({ label, detail, href }) {
  return (
    <MotionLink className="link-tile" href={href}>
      <strong>{label}</strong>
      <span>{detail}</span>
    </MotionLink>
  );
}

function MotionLink({ children, className = "", href }) {
  return (
    <motion.a
      className={className}
      href={href}
      whileHover={{ y: -3, scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.a>
  );
}

function AnimatedBackground() {
  const gridRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion || !gridRef.current) return;
    const tween = gsap.to(gridRef.current, {
      backgroundPosition: "120px 120px",
      duration: 10,
      repeat: -1,
      ease: "none"
    });
    return () => tween.kill();
  }, [reduceMotion]);

  return (
    <div className="background-stage" aria-hidden="true">
      <div className="city-line"></div>
      <div className="grid-plane" ref={gridRef}></div>
      <div className="glow glow-cyan"></div>
      <div className="glow glow-violet"></div>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="dashboard-mockup neon-card" aria-label="Animated developer dashboard mockup">
      <div className="terminal-head">
        <span></span><span></span><span></span>
        <strong>karthick.system</strong>
      </div>
      <div className="system-layout">
        <div className="terminal-panel">
          <code>build: portfolio</code>
          <code>verify: links</code>
          <code>ship: GitHub Pages</code>
          <code>status: focused</code>
        </div>
        <div className="chart-panel">
          <div className="chart-line"></div>
          <div className="bar-row"><span></span><span></span><span></span></div>
        </div>
      </div>
      <div className="node-map">
        <span></span><span></span><span></span><span></span>
      </div>
    </div>
  );
}

function KLogo({ small = false }) {
  return (
    <svg className={small ? "k-logo small" : "k-logo"} viewBox="0 0 120 120" role="img" aria-label="Abstract glowing K logo">
      <defs>
        <linearGradient id="kGradient" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#00e5ff" />
          <stop offset="0.52" stopColor="#7c3cff" />
          <stop offset="1" stopColor="#33ffcc" />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="104" height="104" rx="24" fill="rgba(3, 8, 24, 0.88)" stroke="url(#kGradient)" strokeWidth="3" />
      <path d="M37 28v64M78 29 47 58l33 33M48 60h28" fill="none" stroke="url(#kGradient)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

createRoot(document.getElementById("root")).render(<App />);
