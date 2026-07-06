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

const projects = [
  {
    name: "Rental Research Report Generator",
    type: "Python automation",
    problem: "Rental searches were scattered across noisy listings and hard to compare.",
    features: ["Filters unsuitable listings", "Ranks by budget and commute fit", "Generates English/Tamil PDF and DOCX reports", "Includes verification checklists and source links"],
    stack: ["Python", "ReportLab", "python-docx", "JSON", "unittest"],
    learned: "How to turn messy public data into a repeatable decision-support workflow.",
    links: [{ label: "GitHub", href: links.github }, { label: "Sample PDF", href: links.samplePdf }, { label: "Case Study", href: links.caseStudy }]
  },
  {
    name: "Printing Press ERP / Business Management System",
    type: "React business software",
    problem: "Local-business operations need structured workflow screens, not just static pages.",
    features: ["Order workflow thinking", "Inventory and production tracking", "Dashboard-style operational views", "Role-based access concepts"],
    stack: ["React", "Supabase", "JavaScript", "Vite", "ERP workflows"],
    learned: "Business software must be simple enough for daily use and structured enough for operations.",
    links: [{ label: "Live ERP", href: links.erp }]
  },
  {
    name: "Timber Calculator",
    type: "Commercial calculator",
    problem: "Measurement-heavy local business tasks need quick, practical estimates.",
    features: ["Fast calculation flow", "Simple commercial UI", "Mobile-friendly layout", "Direct public demo"],
    stack: ["JavaScript", "HTML", "CSS", "Responsive UI"],
    learned: "Small tools become useful when the interface stays focused on the working task.",
    links: [{ label: "Live Demo", href: links.calculator }]
  },
  {
    name: "Wedding Card Studio",
    type: "Creative web tool",
    problem: "Custom invitation workflows need structured layout and fast preview thinking.",
    features: ["Card layout workflow", "Editable text/content planning", "Design preview thinking", "AI-assisted creative iteration"],
    stack: ["React planning", "JavaScript", "UI design", "AI-assisted workflow"],
    learned: "Creative tools need both visual polish and clear editing controls.",
    links: []
  },
  {
    name: "Career Application Kit / Portfolio System",
    type: "Career operating system",
    problem: "Applications, resumes, links, and proof assets were scattered.",
    features: ["ATS and startup resumes", "Portfolio and one-tap links", "Application packs and tracker", "Tests, scripts, reports, and public proof"],
    stack: ["Python", "React", "GitHub Pages", "Docs", "Automation"],
    learned: "A career system is stronger when every claim links back to proof.",
    links: [{ label: "GitHub", href: links.github }, { label: "One-tap Links", href: "links.html" }]
  }
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
      <About />
      <Projects />
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
        <p className="signal">CS with AI student / software developer / AI-assisted builder</p>
        <h1>Practical software in a neon system shell.</h1>
        <p className="lead">I build practical business software, dashboards, automation tools, and ERP-style systems.</p>
        <div className="button-row">
          <MotionLink className="button primary" href="#projects">View Projects</MotionLink>
          <MotionLink className="button" href={links.atsResume}>Resume</MotionLink>
          <MotionLink className="button" href={links.github}>GitHub</MotionLink>
          <MotionLink className="button" href={links.linkedin}>LinkedIn</MotionLink>
          <MotionLink className="button ghost" href="links.html">One-tap Links</MotionLink>
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

function About() {
  return (
    <section id="about" className="section-shell two-column">
      <motion.div {...fadeUp}>
        <p className="section-label">About</p>
        <h2>Builder story, grounded in useful work.</h2>
      </motion.div>
      <motion.div className="copy-stack" {...fadeUp}>
        <p>I am Deepan Karthick, a B.Sc. Computer Science with Artificial Intelligence student at Rathinam Global University, Coimbatore. Expected graduation: 2028.</p>
        <p>I started by building small practical tools and kept turning them into stronger systems: a printing press ERP, rental research automation, a career application kit, calculators, reports, and portfolio proof.</p>
        <p>My current focus is software engineering, AI-assisted development, business software, dashboards, automation, and clear documentation.</p>
      </motion.div>
    </section>
  );
}

function Projects() {
  return (
    <section id="projects" className="section-shell">
      <motion.div className="section-heading" {...fadeUp}>
        <p className="section-label">Projects</p>
        <h2>Proof systems and project UI mockups.</h2>
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
      <div className="mock-strip" aria-hidden="true">
        <span></span><span></span><span></span>
      </div>
      <p><strong>Problem:</strong> {project.problem}</p>
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
        <h2>All useful links in one clean panel.</h2>
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
    <main className="links-page">
      <section className="section-shell links-hero">
        <motion.div {...fadeUp}>
          <KLogo />
          <p className="section-label">One-tap Links</p>
          <h1>Deepan Karthick</h1>
          <p className="lead">React dashboards, Python automation, ERP-style business software, and AI-assisted development workflows.</p>
        </motion.div>
        <motion.div className="link-grid" {...fadeUp}>
          <LinkTile label="Portfolio" detail="View projects and skills" href="index.html" />
          <LinkTile label="ATS Resume" detail="PDF resume" href={links.atsResume} />
          <LinkTile label="Startup Resume" detail="Project-focused PDF" href={links.startupResume} />
          <LinkTile label="GitHub" detail="Career kit repository" href={links.github} />
          <LinkTile label="LinkedIn" detail="Professional profile" href={links.linkedin} />
          <LinkTile label="Email" detail="deepankarthick212@gmail.com" href={links.email} />
          <LinkTile label="Timber Calculator" detail="Live calculator" href={links.calculator} />
          <LinkTile label="Printing Press ERP" detail="Public demo route" href={links.erp} />
        </motion.div>
        <motion.div className="whatsapp-panel neon-card" {...fadeUp}>
          <span>WhatsApp share text</span>
          <p>Hi, I am Deepan Karthick, a B.Sc. CS (AI) student building React dashboards, Python automation, ERP-style business software, and AI-assisted tools. Portfolio: {links.portfolio}</p>
        </motion.div>
      </section>
    </main>
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
