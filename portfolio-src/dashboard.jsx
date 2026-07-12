import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./dashboard.css";

const portfolioUrl = "./index.html";
const dataVersion = "20260712-two-track-research";
const salesStorageKey = "dragon-os-sales-private-v2";

const files = {
  master: "./data/money_opportunity_master_report.md",
  actions: "./data/master_action_tracker.csv",
  leads: "./data/agent_1_local_client_leads.csv",
  internships: "./data/agent_5_internship_opportunities.csv",
  startups: "./data/agent_4_startup_incubator_database.csv",
  services: "./data/agent_3_service_pricing_table.csv",
  saas: "./data/agent_6_saas_ideas.csv",
  erp: "./data/agent_7_reusable_erp_framework.md",
  crm: "./data/agent_8_personal_crm_spec.md",
  outcomes: "./data/outcome_log.csv",
  salesLeads: "./data/sales_leads.csv",
  salesBriefs: "./data/sales_company_briefs.csv",
  salesIndustryKnowledge: "./data/sales_industry_knowledge.md",
  businessIndustries: "./data/two_track_research/business_industries.csv",
  businessWorkflows: "./data/two_track_research/business_workflow_manuals.csv",
  businessInterviews: "./data/two_track_research/business_interviews.csv",
  businessLessons: "./data/two_track_research/business_lessons.csv",
  businessPilots: "./data/two_track_research/business_pilot_ideas.csv",
  businessScoreboard: "./data/two_track_research/business_experience_scoreboard.csv",
  mbaCountries: "./data/two_track_research/mba_country_comparison.csv",
  mbaPrograms: "./data/two_track_research/mba_program_shortlist.csv",
  mbaScholarships: "./data/two_track_research/mba_scholarships.csv",
  mbaExams: "./data/two_track_research/mba_exam_plan.csv",
  mbaProfile: "./data/two_track_research/mba_profile_roadmap.csv",
  mbaFinance: "./data/two_track_research/mba_financial_scenarios.csv",
  mbaTimeline: "./data/two_track_research/mba_application_timeline.csv"
};

const navGroups = [
  { label: "Career", pages: ["Overview", "Leads", "Internships", "AIC RAISE / Startup"] },
  { label: "Business", pages: ["Business Intelligence", "Sales", "Services", "Print ERP Demo", "PrintExpo"] },
  { label: "Global education", pages: ["Global Education Strategy"] },
  { label: "Planning", pages: ["Weekly Plan", "Outcomes", "SaaS Ideas"] }
];

const statusOptions = ["all", "ready", "researched", "planned", "not contacted", "ongoing"];

const printDemoDefaults = {
  customer: "Sri Murugan Cards",
  jobName: "Wedding Invitation - 500 cards",
  size: "A5 folded",
  paper: "300 GSM art card",
  quantity: 500,
  paperRate: 8,
  plateCost: 1200,
  printCost: 3500,
  finishingCost: 2200,
  designCost: 1500,
  wastagePercent: 8,
  marginPercent: 22,
  advancePercent: 50,
  dueDate: "2026-07-17"
};

const printStages = [
  { stage: "Estimate", owner: "Front office", status: "done", age: "Today" },
  { stage: "Artwork approval", owner: "Designer", status: "waiting", age: "1 day" },
  { stage: "Plate / prepress", owner: "Prepress", status: "next", age: "After approval" },
  { stage: "Printing", owner: "Machine floor", status: "planned", age: "2 hours" },
  { stage: "Cutting + packing", owner: "Finishing", status: "planned", age: "Same day" },
  { stage: "Dispatch", owner: "Dispatch", status: "planned", age: "After balance" }
];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    if (row.some((value) => value.trim() !== "")) rows.push(row);
  }

  const [headers, ...body] = rows;
  if (!headers) return [];
  return body.map((values) =>
    headers.reduce((acc, header, index) => {
      acc[header.trim()] = (values[index] || "").trim();
      return acc;
    }, {})
  );
}

function numberFrom(value) {
  const found = String(value || "").match(/\d+/);
  return found ? Number(found[0]) : 0;
}

function currency(value) {
  return `INR ${Math.round(value).toLocaleString("en-IN")}`;
}

function scoreOf(row) {
  return Number(row.priority_score || row.priority || row.match_score || row.overall_score || 0);
}

function moneyFrom(row) {
  const value =
    row.expected_value ||
    row.estimated_project_value_inr ||
    row.expected_value_inr ||
    row.standard_price_inr ||
    row.pricing ||
    row.stipend_or_pay ||
    "";
  return String(value).replaceAll("INR", "INR ");
}

function normalizeStatus(row) {
  return (row.status || row.stage || row.internship_job_possibility || "researched").toLowerCase();
}

function priorityLabel(score) {
  if (score >= 85) return "critical";
  if (score >= 75) return "high";
  if (score >= 60) return "medium";
  return "watch";
}

function matches(row, query) {
  if (!query) return true;
  return Object.values(row).join(" ").toLowerCase().includes(query.toLowerCase());
}

function useDashboardData() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const entries = await Promise.all(
          Object.entries(files).map(async ([key, url]) => {
            const fetchUrl = `${url}${url.includes("?") ? "&" : "?"}v=${dataVersion}`;
            const response = await fetch(fetchUrl);
            if (!response.ok) throw new Error(`${url} ${response.status}`);
            const text = await response.text();
            return [key, url.endsWith(".csv") ? parseCsv(text) : text];
          })
        );
        if (active) setData(Object.fromEntries(entries));
      } catch (err) {
        if (active) setError(err.message);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  return { data, error };
}

function Shell({ children, activePage, setActivePage, query, setQuery, status, setStatus }) {
  const [navOpen, setNavOpen] = useState(false);
  const selectPage = (page) => {
    setActivePage(page);
    setNavOpen(false);
  };
  return (
    <div className="app-shell">
      <button className="nav-toggle" type="button" aria-label="Open dashboard navigation" aria-expanded={navOpen} onClick={() => setNavOpen((open) => !open)}>Menu</button>
      <aside className={navOpen ? "sidebar open" : "sidebar"} aria-label="Dashboard navigation">
        <a className="brand" href="./dashboard.html" aria-label="Dragon OS Mission Control">
          <span className="brand-mark">DO</span>
          <span>
            <strong>Dragon OS</strong>
            <small>Founder mission control</small>
          </span>
        </a>
        <nav className="nav-list" aria-label="Dashboard pages">
          {navGroups.map((group) => <section className="nav-group" key={group.label} aria-label={group.label}>
            <p>{group.label}</p>
            {group.pages.map((page) => <button key={page} className={activePage === page ? "nav-item active" : "nav-item"} onClick={() => selectPage(page)} type="button"><span className="nav-dot" />{page}</button>)}
          </section>)}
        </nav>
        <div className="side-card">
          <span className="label">Primary daily target</span>
          <strong>First INR 5k</strong>
          <p>Ship one useful demo, track follow-ups, and turn every lesson into Dragon OS memory.</p>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">Live local-data dashboard</p>
            <h1>{activePage}</h1>
          </div>
          <div className="top-actions">
            <label className="search-box">
              <span>Search</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Lead, role, city, skill..." />
            </label>
            <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Status filter">
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <a className="portfolio-link" href={portfolioUrl}>
              Portfolio
            </a>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

function Metric({ label, value, tone = "cyan" }) {
  return (
    <div className={`metric ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MiniBars({ title, rows, note = "" }) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return <section className="mini-bars" aria-label={`${title}. ${rows.map((row) => `${row.label}: ${row.value}`).join(", ")}`}>
    <div className="section-title"><h3>{title}</h3><span>{note}</span></div>
    {rows.map((row) => <div className="bar-row" key={row.label}><span>{row.label}</span><div className="bar-track"><i style={{ width: `${Math.max(8, row.value / max * 100)}%` }} /></div><strong>{row.value}</strong></div>)}
  </section>;
}

function Tag({ children, type = "neutral" }) {
  return <span className={`tag ${type}`}>{children}</span>;
}

function DataTable({ rows, columns, empty = "No matching records." }) {
  if (!rows.length) return <div className="empty-state">{empty}</div>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.business_name || row.company_or_platform || row.name || row.idea || index}-${index}`}>
              {columns.map((column) => (
                <td key={column.key}>{column.render ? column.render(row, index) : row[column.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function applyFilters(rows, query, status) {
  return rows.filter((row) => matches(row, query)).filter((row) => status === "all" || normalizeStatus(row).includes(status));
}

function readPrivateSalesState() {
  try {
    return JSON.parse(localStorage.getItem(salesStorageKey)) || {};
  } catch {
    return {};
  }
}

function backupLabel(meta = {}) {
  if (meta.lastBackupAt) return `Last backup: ${new Date(meta.lastBackupAt).toLocaleString()}`;
  if (meta.lastImportAt) return `Last import: ${new Date(meta.lastImportAt).toLocaleString()}`;
  return "No local backup recorded";
}

function isYes(value) {
  return ["true", "yes", "1", "on"].includes(String(value || "").toLowerCase());
}

function Overview({ data, query, status }) {
  const overview = useMemo(() => {
    const actions = applyFilters(data.actions, query, status);
    const publicSalesLeads = data.salesLeads || [];
    const privateSales = readPrivateSalesState();
    const privateLeads = privateSales.leads || [];
    const privateEmails = privateSales.emails || [];
    const freshFive = publicSalesLeads.filter((lead) => lead.daily_batch === "2026-07-11-industrial");
    return {
      topActions: [...actions].sort((a, b) => numberFrom(a.priority) - numberFrom(b.priority)).slice(0, 8),
      hotLeads: data.leads.filter((lead) => scoreOf(lead) >= 82).length,
      serviceFloor: data.services.reduce((sum, row) => sum + numberFrom(row.standard_price_inr), 0),
      privateSales,
      freshFive,
      selectedThree: freshFive.filter((lead) => lead.today_pick === "Yes"),
      draftsAwaitingReview: privateEmails.filter((email) => email.approval_status !== "Approved" && email.sent_status !== "Sent").length,
      followUpsDue: privateLeads.filter((lead) => dateIsDue(lead.next_follow_up)).length,
      repliesWaiting: privateEmails.filter((email) => email.reply_status && email.reply_status !== "No reply").length
    };
  }, [data, query, status]);
  const internshipCount = data.internships.length;
  const outcomeCount = data.outcomes.length;
  const exactNextAction = "Validate one printing quote-to-job case before building anything.";

  return (
    <div className="page-grid">
      <section className="panel hero-panel">
        <div>
          <p className="eyebrow">Founder command center</p>
          <h2>One real workflow. One strong evidence trail.</h2>
          <p>Today&apos;s priority is to turn the printing quote-to-job workflow into a verified learning asset that compounds across career, startup, and education decisions.</p>
        </div>
        <div className="hero-metrics">
          <Metric label="Hot local leads" value={overview.hotLeads} />
          <Metric label="Tracked actions" value={data.actions.length} tone="pink" />
          <Metric label="Internship channels" value={internshipCount} tone="green" />
          <Metric label="Logged outcomes" value={outcomeCount} tone="violet" />
        </div>
      </section>

      <section className="panel full-panel command-grid">
        <div className="command-action"><p className="eyebrow">Exact next action</p><h2>{exactNextAction}</h2><p>Ask an owner or estimator to reconstruct one completed anonymous job. Capture where information is re-entered, delayed, or lost.</p><Tag type="green">real-world validation</Tag></div>
        <div className="command-status"><p className="eyebrow">Waiting for your action</p><div><strong>Track A</strong><span>Questions prepared; local validation not started.</span></div><div><strong>Track B</strong><span>Academic evidence folder and prerequisite map.</span></div><div><strong>Sales</strong><span>Paused until sender readiness is confirmed.</span></div></div>
        <div className="command-status"><p className="eyebrow">Privacy and continuity</p><div><strong>Browser-local sales</strong><span>{backupLabel(overview.privateSales.meta)}</span></div><div><strong>Read today</strong><span>Printing and Packaging Manual</span></div><div><strong>Question Hela</strong><span>Which degree path compounds verified operating evidence?</span></div></div>
      </section>

      <section className="panel full-panel two-objectives">
        <div className="section-title"><h2>Two Main Objectives</h2><Tag type="green">research-to-evidence</Tag></div>
        <div className="objective-grid">
          <article>
            <p className="eyebrow">Track A - Business Experience</p>
            <h3>Printing and packaging: quote-to-job handoff</h3>
            <div className="metric-row"><Metric label="Industries" value={data.businessIndustries.length} /><Metric label="Workflow stages" value={data.businessWorkflows.length} tone="green" /><Metric label="Interview slots" value={data.businessInterviews.length} tone="violet" /><Metric label="Lessons / pilots" value={`${data.businessLessons.length} / ${data.businessPilots.length}`} tone="pink" /></div>
            <p><strong>Next real-world action:</strong> reconstruct one completed job with an owner or estimator. <strong>Blocker:</strong> no local validation yet.</p>
            <p className="action-callout">Today: read the printing manual and prepare the ten discovery questions; do not build or pitch.</p>
          </article>
          <article>
            <p className="eyebrow">Track B - Global Education</p>
            <h3>Build evidence first; choose the degree path deliberately.</h3>
            <div className="metric-row"><Metric label="Countries" value={data.mbaCountries.length} /><Metric label="Programs" value={data.mbaPrograms.length} tone="green" /><Metric label="Scholarships" value={data.mbaScholarships.length} tone="violet" /></div>
            <p><strong>Recommendation:</strong> early-career analytics, technology-management, innovation, or entrepreneurship programs after graduation; conventional MBA after 3-5 years of meaningful work. <strong>Uncertainty:</strong> 2028 entry requirements.</p>
            <p className="action-callout">Today: collect transcripts, syllabus, and grading-scale evidence; map quantitative prerequisites.</p>
          </article>
        </div>
        <div className="decision-strip">
          <span><strong>Combined priority</strong> Turn one printing workflow into measurable, application-ready evidence.</span>
          <span><strong>Read today</strong> Printing and Packaging Manual</span>
          <span><strong>Question Hela</strong> Which degree family best compounds verified operating experience?</span>
          <span><strong>Real-world action</strong> Validate one anonymous quote-to-job case.</span>
          <span className="warning"><strong>Do not build yet</strong> No prototype until a real workflow, role, baseline, consent, and stop rule are confirmed.</span>
        </div>
      </section>

      <section className="panel launch-safety-panel full-panel">
        <div className="section-title">
          <h2>Today Before Any Outreach</h2>
          <Tag type="critical">send limit: 0 until sender ready</Tag>
        </div>
        <div className="launch-grid">
          <div className="launch-primary">
            <span>Exact next action</span>
            <strong>{exactNextAction}</strong>
            <p>Private sales activity is browser-local. Export a backup after each session.</p>
          </div>
          <Metric label="Professional sender" value="Blocked" tone="pink" />
          <Metric label="Fresh-5 status" value={`${overview.freshFive.length}/5`} />
          <Metric label="Selected best 3" value={`${overview.selectedThree.length}/3`} tone="green" />
          <Metric label="Drafts awaiting review" value={overview.draftsAwaitingReview} tone="violet" />
          <Metric label="Follow-ups due" value={overview.followUpsDue} tone="pink" />
          <Metric label="Replies waiting" value={overview.repliesWaiting} tone="green" />
          <Metric label="Last backup status" value={backupLabel(overview.privateSales.meta)} tone="cyan" />
        </div>
        <div className="selected-strip">
          {overview.selectedThree.map((lead) => (
            <span key={lead.lead_id}>{lead.business_name}</span>
          ))}
        </div>
      </section>

      <section className="panel today-panel">
        <div className="section-title">
          <h2>Mission Actions</h2>
          <Tag type="critical">manual only</Tag>
        </div>
        <div className="action-list">
          {overview.topActions.map((item) => (
            <article className="action-row" key={`${item.priority}-${item.opportunity}`}>
              <span className="rank">{item.priority}</span>
              <div>
                <strong>{item.opportunity}</strong>
                <p>{item.action}</p>
              </div>
              <Tag type={priorityLabel(100 - Number(item.priority || 20) * 4)}>{item.status}</Tag>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-title">
          <h2>Priority Pipeline</h2>
          <span>Expected value focus</span>
        </div>
        <DataTable
          rows={overview.topActions.slice(0, 6)}
          columns={[
            { key: "channel", label: "Channel" },
            { key: "opportunity", label: "Opportunity" },
            { key: "expected_value", label: "Value" },
            { key: "difficulty", label: "Difficulty" },
            { key: "next_follow_up", label: "Follow-up" }
          ]}
        />
      </section>

      <section className="panel">
        <div className="section-title">
          <h2>Offer Stack</h2>
          <span>Fastest monetizable services</span>
        </div>
        <div className="offer-stack">
          {data.services.slice(0, 6).map((service) => (
            <div className="offer" key={service.service}>
              <strong>{service.service}</strong>
              <span>INR {service.starter_price_inr} - {service.advanced_price_inr}</span>
            </div>
          ))}
        </div>
        <p className="panel-note">Current service-market potential in standard packages: INR {overview.serviceFloor.toLocaleString("en-IN")} across tracked offers.</p>
      </section>

      <section className="panel">
        <div className="section-title">
          <h2>Learning Loop</h2>
          <span>Actions to memory</span>
        </div>
        <div className="outcome-list">
          {data.outcomes.slice(0, 3).map((outcome) => (
            <article className="outcome-card" key={`${outcome.date}-${outcome.action}`}>
              <div>
                <strong>{outcome.action}</strong>
                <p>{outcome.lesson}</p>
              </div>
              <Tag type="green">{outcome.status_delta}</Tag>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function Leads({ data, query, status }) {
  const rows = applyFilters(data.leads, query, status).sort((a, b) => scoreOf(b) - scoreOf(a));
  return (
    <section className="panel full-panel">
      <div className="section-title">
        <h2>Local Client Leads</h2>
        <span>{rows.length} visible</span>
      </div>
      <DataTable
        rows={rows}
        columns={[
          { key: "business_name", label: "Lead" },
          { key: "city", label: "City" },
          { key: "sector", label: "Sector" },
          { key: "likely_software_pain", label: "Pain" },
          { key: "possible_offer", label: "Offer" },
          { key: "estimated_project_value_inr", label: "Value" },
          { key: "priority_score", label: "Priority", render: (row) => <Tag type={priorityLabel(scoreOf(row))}>{scoreOf(row)}</Tag> }
        ]}
      />
    </section>
  );
}

function Internships({ data, query, status }) {
  const rows = applyFilters(data.internships, query, status).sort((a, b) => scoreOf(b) - scoreOf(a));
  return (
    <section className="panel full-panel">
      <div className="section-title">
        <h2>Internship Watchlist</h2>
        <Tag type="neutral">verify before applying</Tag>
      </div>
      <DataTable
        rows={rows}
        columns={[
          { key: "company_or_platform", label: "Company/Platform" },
          { key: "role", label: "Role" },
          { key: "location_remote", label: "Location" },
          { key: "stipend_or_pay", label: "Pay" },
          { key: "match_score", label: "Match", render: (row) => <Tag type={priorityLabel(scoreOf(row))}>{scoreOf(row)}</Tag> },
          { key: "recommended_resume", label: "Resume" },
          { key: "project_to_showcase", label: "Showcase" }
        ]}
      />
    </section>
  );
}

function Startup({ data, query, status }) {
  const rows = applyFilters(data.startups, query, status).sort((a, b) => scoreOf(b) - scoreOf(a));
  return (
    <div className="page-grid">
      <section className="panel">
        <div className="section-title">
          <h2>AIC RAISE Strategy</h2>
          <Tag type="critical">highest leverage</Tag>
        </div>
        <p className="lead-copy">
          Position as a student builder who can ship dashboards, MVP screens, report generators, and ERP modules for incubated startups and local MSMEs.
        </p>
        <div className="check-list">
          <span>Prepare one-page profile</span>
          <span>Show Printing ERP demo</span>
          <span>Offer scoped project support</span>
          <span>Track every conversation in CRM</span>
        </div>
      </section>
      <section className="panel">
        <div className="section-title">
          <h2>Startup Channels</h2>
          <span>{rows.length} visible</span>
        </div>
        <DataTable
          rows={rows}
          columns={[
            { key: "name", label: "Name" },
            { key: "location", label: "Location" },
            { key: "internship_job_possibility", label: "Possibility" },
            { key: "priority_score", label: "Priority", render: (row) => <Tag type={priorityLabel(scoreOf(row))}>{scoreOf(row)}</Tag> }
          ]}
        />
      </section>
    </div>
  );
}

function PrintExpo() {
  const questions = [
    "How do you create estimates today?",
    "Where does a job card move after approval?",
    "Which stage causes the most delay?",
    "How do you track artwork revisions?",
    "What report do you wish you had every morning?",
    "Would you pay first for estimating, job status, inventory, or dispatch?"
  ];
  const products = [
    "Print Estimate Calculator",
    "Job Card Tracker",
    "Artwork Approval Portal",
    "Paper Inventory Ledger",
    "Dispatch Board",
    "Mini Print ERP Starter"
  ];
  return (
    <div className="page-grid">
      <section className="panel">
        <div className="section-title">
          <h2>PrintExpo Playbook</h2>
          <Tag type="green">research mode</Tag>
        </div>
        <p className="lead-copy">
          Learn workflows first. Capture pain points manually. Build the Print Estimate + Job Card demo after the pattern repeats.
        </p>
        <div className="question-grid">
          {questions.map((question) => (
            <div className="question" key={question}>{question}</div>
          ))}
        </div>
      </section>
      <section className="panel">
        <div className="section-title">
          <h2>Product Angles</h2>
          <span>Demo-ready offers</span>
        </div>
        <div className="offer-stack">
          {products.map((product) => (
            <div className="offer" key={product}>
              <strong>{product}</strong>
              <span>Small module first, ERP later</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function PrintErpDemo() {
  const [quote, setQuote] = useState(printDemoDefaults);
  const paperCost = quote.quantity * quote.paperRate;
  const wastageCost = paperCost * (quote.wastagePercent / 100);
  const directCost = paperCost + wastageCost + quote.plateCost + quote.printCost + quote.finishingCost + quote.designCost;
  const margin = directCost * (quote.marginPercent / 100);
  const subtotal = directCost + margin;
  const gst = subtotal * 0.18;
  const total = subtotal + gst;
  const advance = total * (quote.advancePercent / 100);
  const balance = total - advance;

  function updateField(field, value) {
    const numericFields = ["quantity", "paperRate", "plateCost", "printCost", "finishingCost", "designCost", "wastagePercent", "marginPercent", "advancePercent"];
    setQuote((current) => ({
      ...current,
      [field]: numericFields.includes(field) ? Number(value) : value
    }));
  }

  const whatsappMessage = `Hello ${quote.customer}, estimate for ${quote.jobName}: ${currency(total)} incl. GST. Advance: ${currency(advance)}. Delivery target: ${quote.dueDate}.`;

  return (
    <div className="page-grid print-demo">
      <section className="panel hero-panel">
        <div>
          <p className="eyebrow">Money OS demo</p>
          <h2>Printing Quote + Job Card starter.</h2>
          <p>
            A practical first demo for print shop owners: fast estimate, advance/balance, job stages, and WhatsApp-ready status copy.
          </p>
        </div>
        <div className="hero-metrics">
          <Metric label="Quote total" value={currency(total)} />
          <Metric label="Advance" value={currency(advance)} tone="green" />
          <Metric label="Balance" value={currency(balance)} tone="pink" />
          <Metric label="Margin" value={currency(margin)} tone="violet" />
        </div>
      </section>

      <section className="panel">
        <div className="section-title">
          <h2>Estimate Builder</h2>
          <Tag type="green">editable demo</Tag>
        </div>
        <div className="quote-form">
          <label><span>Customer</span><input value={quote.customer} onChange={(event) => updateField("customer", event.target.value)} /></label>
          <label><span>Job</span><input value={quote.jobName} onChange={(event) => updateField("jobName", event.target.value)} /></label>
          <label><span>Size</span><input value={quote.size} onChange={(event) => updateField("size", event.target.value)} /></label>
          <label><span>Paper</span><input value={quote.paper} onChange={(event) => updateField("paper", event.target.value)} /></label>
          <label><span>Quantity</span><input type="number" value={quote.quantity} onChange={(event) => updateField("quantity", event.target.value)} /></label>
          <label><span>Paper rate</span><input type="number" value={quote.paperRate} onChange={(event) => updateField("paperRate", event.target.value)} /></label>
          <label><span>Plate cost</span><input type="number" value={quote.plateCost} onChange={(event) => updateField("plateCost", event.target.value)} /></label>
          <label><span>Print cost</span><input type="number" value={quote.printCost} onChange={(event) => updateField("printCost", event.target.value)} /></label>
          <label><span>Finishing</span><input type="number" value={quote.finishingCost} onChange={(event) => updateField("finishingCost", event.target.value)} /></label>
          <label><span>Design</span><input type="number" value={quote.designCost} onChange={(event) => updateField("designCost", event.target.value)} /></label>
          <label><span>Wastage %</span><input type="number" value={quote.wastagePercent} onChange={(event) => updateField("wastagePercent", event.target.value)} /></label>
          <label><span>Margin %</span><input type="number" value={quote.marginPercent} onChange={(event) => updateField("marginPercent", event.target.value)} /></label>
          <label><span>Advance %</span><input type="number" value={quote.advancePercent} onChange={(event) => updateField("advancePercent", event.target.value)} /></label>
          <label><span>Due date</span><input type="date" value={quote.dueDate} onChange={(event) => updateField("dueDate", event.target.value)} /></label>
        </div>
      </section>

      <section className="panel quote-preview">
        <div className="section-title">
          <h2>Quote Preview</h2>
          <span>owner-ready numbers</span>
        </div>
        <div className="quote-paper">
          <div className="quote-head">
            <div>
              <strong>Mini Print ERP Starter</strong>
              <span>Quotation + job card demo</span>
            </div>
            <Tag type="green">draft quote</Tag>
          </div>
          <dl>
            <div><dt>Customer</dt><dd>{quote.customer}</dd></div>
            <div><dt>Job</dt><dd>{quote.jobName}</dd></div>
            <div><dt>Paper</dt><dd>{quote.paper}</dd></div>
            <div><dt>Size</dt><dd>{quote.size}</dd></div>
            <div><dt>Direct cost</dt><dd>{currency(directCost)}</dd></div>
            <div><dt>GST 18%</dt><dd>{currency(gst)}</dd></div>
            <div className="quote-total"><dt>Total</dt><dd>{currency(total)}</dd></div>
          </dl>
          <div className="copy-box">{whatsappMessage}</div>
        </div>
      </section>

      <section className="panel full-panel">
        <div className="section-title">
          <h2>Printable Job Card</h2>
          <span>{quote.jobName}</span>
        </div>
        <div className="job-card-grid">
          <div className="job-ticket">
            <strong>JOB-PRN-001</strong>
            <span>{quote.customer}</span>
            <p>{quote.quantity} qty | {quote.paper} | {quote.size} | Due {quote.dueDate}</p>
            <div className="ticket-row"><span>Advance</span><b>{currency(advance)}</b></div>
            <div className="ticket-row"><span>Balance</span><b>{currency(balance)}</b></div>
          </div>
          <div className="stage-board">
            {printStages.map((stage) => (
              <article className="stage-card" key={stage.stage}>
                <div>
                  <strong>{stage.stage}</strong>
                  <span>{stage.owner}</span>
                </div>
                <Tag type={stage.status === "done" ? "green" : stage.status === "waiting" ? "medium" : "neutral"}>{stage.status}</Tag>
                <p>{stage.age}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Services({ data, query, status }) {
  const rows = applyFilters(data.services, query, status);
  return (
    <section className="panel full-panel">
      <div className="section-title">
        <h2>Service Pricing Menu</h2>
        <span>{rows.length} offers</span>
      </div>
      <DataTable
        rows={rows}
        columns={[
          { key: "service", label: "Service" },
          { key: "best_target_customer", label: "Target" },
          { key: "starter_price_inr", label: "Starter", render: (row) => `INR ${row.starter_price_inr}` },
          { key: "standard_price_inr", label: "Standard", render: (row) => `INR ${row.standard_price_inr}` },
          { key: "advanced_price_inr", label: "Advanced", render: (row) => `INR ${row.advanced_price_inr}` },
          { key: "monthly_maintenance_inr", label: "Maintenance", render: (row) => `INR ${row.monthly_maintenance_inr}` },
          { key: "delivery_time_days", label: "Delivery" }
        ]}
      />
    </section>
  );
}

function SaasIdeas({ data, query, status }) {
  const rows = applyFilters(data.saas, query, status).sort((a, b) => Number(a.rank) - Number(b.rank));
  return (
    <section className="panel full-panel">
      <div className="section-title">
        <h2>SaaS Idea Ranking</h2>
        <span>Fit, pain, speed, distribution</span>
      </div>
      <DataTable
        rows={rows}
        columns={[
          { key: "rank", label: "Rank" },
          { key: "idea", label: "Idea" },
          { key: "target_customer", label: "Customer" },
          { key: "pain_score", label: "Pain" },
          { key: "fit_with_skills", label: "Fit" },
          { key: "speed_to_mvp", label: "Speed" },
          { key: "overall_score", label: "Score", render: (row) => <Tag type={priorityLabel(scoreOf(row))}>{scoreOf(row)}</Tag> }
        ]}
      />
    </section>
  );
}

function Outcomes({ data, query }) {
  const rows = data.outcomes.filter((row) => matches(row, query));
  const moduleCounts = rows.reduce((acc, row) => {
    acc[row.module] = (acc[row.module] || 0) + 1;
    return acc;
  }, {});
  const moduleSummary = Object.entries(moduleCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([module, count]) => `${module}: ${count}`)
    .join(" | ");

  return (
    <div className="page-grid">
      <section className="panel">
        <div className="section-title">
          <h2>Outcome Ledger</h2>
          <Tag type="green">learning system</Tag>
        </div>
        <p className="lead-copy">
          This is where Dragon OS converts finished actions into results, lessons, money signals, and next moves for future Hela memory.
        </p>
        <div className="timeline">
          <div><strong>Action</strong><span>Start from the priority tracker, not random effort.</span></div>
          <div><strong>Outcome</strong><span>Record what actually happened, even if the result is small.</span></div>
          <div><strong>Lesson</strong><span>Save the reusable insight so it becomes knowledge.</span></div>
          <div><strong>Next move</strong><span>Turn the lesson into the next action or follow-up.</span></div>
        </div>
      </section>
      <section className="panel">
        <div className="section-title">
          <h2>Outcome Signals</h2>
          <span>{rows.length} logged</span>
        </div>
        <div className="hero-metrics">
          <Metric label="Outcomes" value={rows.length} />
          <Metric label="Modules" value={Object.keys(moduleCounts).length} tone="green" />
          <Metric label="Money signals" value={rows.filter((row) => row.money_signal && row.money_signal !== "none").length} tone="pink" />
          <Metric label="System wins" value={rows.filter((row) => row.outcome_type === "system_improvement").length} tone="violet" />
        </div>
        <p className="panel-note">{moduleSummary || "No module outcomes yet."}</p>
      </section>
      <section className="panel full-panel">
        <div className="section-title">
          <h2>Logged Outcomes</h2>
          <span>{rows.length} visible</span>
        </div>
        <DataTable
          rows={rows}
          columns={[
            { key: "date", label: "Date" },
            { key: "module", label: "Module" },
            { key: "action", label: "Action" },
            { key: "result", label: "Result" },
            { key: "lesson", label: "Lesson" },
            { key: "next_action", label: "Next Action" },
            { key: "money_signal", label: "Money" }
          ]}
        />
      </section>
    </div>
  );
}

function WeeklyPlan({ data, query, status }) {
  const rows = applyFilters(data.actions, query, status).sort((a, b) => numberFrom(a.priority) - numberFrom(b.priority));
  return (
    <div className="page-grid">
      <section className="panel">
        <div className="section-title">
          <h2>Daily Operating Loop</h2>
          <Tag type="critical">no auto outreach</Tag>
        </div>
        <div className="timeline">
          <div><strong>Morning</strong><span>Open dashboard, filter due/ready actions, choose top 3.</span></div>
          <div><strong>Build block</strong><span>Improve one demo or proposal asset before outreach.</span></div>
          <div><strong>Manual review</strong><span>Verify listings and messages yourself before any action.</span></div>
          <div><strong>Evening</strong><span>Update status, next follow-up, and outcome_log.csv.</span></div>
        </div>
      </section>
      <section className="panel">
        <div className="section-title">
          <h2>Outcome Capture Template</h2>
          <span>copy into CSV</span>
        </div>
        <div className="template-grid">
          <span>date</span>
          <span>module</span>
          <span>source_action_priority</span>
          <span>action</span>
          <span>outcome_type</span>
          <span>result</span>
          <span>money_signal</span>
          <span>lesson</span>
          <span>next_action</span>
          <span>status_delta</span>
        </div>
      </section>
      <section className="panel">
        <div className="section-title">
          <h2>Action Tracker</h2>
          <span>{rows.length} visible</span>
        </div>
        <DataTable
          rows={rows}
          columns={[
            { key: "priority", label: "#" },
            { key: "channel", label: "Channel" },
            { key: "opportunity", label: "Opportunity" },
            { key: "action", label: "Action" },
            { key: "deadline", label: "Deadline" },
            { key: "status", label: "Status", render: (row) => <Tag>{row.status}</Tag> }
          ]}
        />
      </section>
    </div>
  );
}

function dateIsDue(value) {
  if (!value) return false;
  const date = new Date(`${value}T23:59:59`);
  return !Number.isNaN(date.getTime()) && date <= new Date();
}

function ResearchTabs({ tabs, active, onChange }) {
  return <div className="research-tabs" role="tablist">{tabs.map((tab) => <button type="button" role="tab" aria-selected={active === tab} className={active === tab ? "active" : ""} key={tab} onClick={() => onChange(tab)}>{tab}</button>)}</div>;
}

function LearningMode({ meaning, verified, uncertain, question, action, notYet }) {
  return <details className="learning-mode"><summary>Learning mode</summary><div className="learning-grid"><span><strong>What this means</strong>{meaning}</span><span><strong>What is verified</strong>{verified}</span><span><strong>What is uncertain</strong>{uncertain}</span><span><strong>Ask Hela</strong>{question}</span><span><strong>Real-world validation</strong>{action}</span><span><strong>Not yet</strong>{notYet}</span></div></details>;
}

function BusinessIntelligence({ data, query, status }) {
  const tabs = ["Overview", "Industry Manuals", "Workflow Maps", "Roles", "Pain Points", "Software Opportunities", "Interview Plan", "Real-World Lessons", "Pilot Ideas", "Experience Scoreboard"];
  const [tab, setTab] = useState("Overview");
  const industries = useMemo(() => applyFilters(data.businessIndustries, query, status), [data.businessIndustries, query, status]);
  const active = data.businessIndustries[0];
  const workflows = useMemo(() => data.businessWorkflows.filter((row) => row.industry_id === active.industry_id), [data.businessWorkflows, active.industry_id]);
  const renderIndustry = (industry) => <article className="research-card" key={industry.industry_id}><div className="section-title"><h3>{industry.industry_name}</h3><Tag type={industry.industry_id === "TA-IND-01" ? "green" : "neutral"}>{industry.industry_id === "TA-IND-01" ? "first active industry" : "desk research"}</Tag></div><p><strong>How it makes money / core workflow:</strong> {industry.general_pattern}</p><p><strong>Focus:</strong> {industry.priority_subsegment}. <strong>Customers:</strong> {industry.primary_customer_types}.</p><p><strong>What must be verified:</strong> {industry.key_hypothesis_to_verify}</p><p><strong>Next action:</strong> {industry.first_real_world_action}</p><details><summary>Open Full Manual</summary><p>Scope: {industry.scope}</p><p>Workflow: {industry.workflow_start} to {industry.workflow_end}</p><p>Evidence: {industry.research_status}. Last verified {industry.last_verified}.</p></details></article>;
  let content;
  if (tab === "Overview") content = <><section className="metrics-grid">{[["Industries", industries.length], ["Workflow stages", data.businessWorkflows.length], ["Planned interviews", data.businessInterviews.length], ["Lessons", data.businessLessons.length], ["Pilot ideas", data.businessPilots.length]].map(([label, value]) => <Metric key={label} label={label} value={value} />)}</section><div className="chart-grid"><MiniBars title="Workflow stages by industry" rows={data.businessIndustries.map((industry) => ({ label: industry.industry_name, value: data.businessWorkflows.filter((row) => row.industry_id === industry.industry_id).length }))} note="Desk-research map" /><MiniBars title="Interview readiness" rows={[{ label: "Planned slots", value: data.businessInterviews.length }, { label: "Completed", value: data.businessInterviews.filter((row) => row.actual_date).length }]} note="No interviews claimed" /></div><section className="research-card-grid">{industries.map(renderIndustry)}</section></>;
  else if (tab === "Industry Manuals") content = <section className="research-card-grid">{industries.map(renderIndustry)}</section>;
  else if (tab === "Workflow Maps") content = <DataTable rows={workflows} columns={[{ key: "sequence", label: "#" }, { key: "stage", label: "Stage" }, { key: "primary_roles", label: "Roles" }, { key: "key_record", label: "Key record" }, { key: "common_exception", label: "Exception" }, { key: "validation_question", label: "Validate in reality" }]} />;
  else if (tab === "Roles") content = <DataTable rows={workflows} columns={[{ key: "stage", label: "Workflow stage" }, { key: "primary_roles", label: "Responsible roles" }, { key: "decision_or_control", label: "Decision/control" }, { key: "required_inputs", label: "Inputs" }]} />;
  else if (tab === "Pain Points") content = <DataTable rows={workflows} columns={[{ key: "stage", label: "Stage" }, { key: "common_exception", label: "Pain / exception" }, { key: "metric_candidate", label: "Measure" }, { key: "validation_question", label: "Reality check" }]} />;
  else if (tab === "Software Opportunities") content = <DataTable rows={data.businessPilots} columns={[{ key: "pilot_name", label: "Opportunity" }, { key: "problem_hypothesis", label: "Hypothesis" }, { key: "minimum_scope", label: "Smallest useful scope" }, { key: "explicit_exclusions", label: "Do not automate" }, { key: "stop_rule", label: "Stop rule" }]} />;
  else if (tab === "Interview Plan") content = <DataTable rows={data.businessInterviews} columns={[{ key: "planned_month", label: "Planned" }, { key: "target_role", label: "Role" }, { key: "research_objective", label: "Objective" }, { key: "status", label: "Status", render: (row) => <Tag type="medium">{row.status}</Tag> }, { key: "next_validation_step", label: "Next validation" }]} />;
  else if (tab === "Real-World Lessons") content = <DataTable rows={data.businessLessons} columns={[{ key: "current_lesson", label: "Lesson" }, { key: "original_assumption", label: "Original assumption" }, { key: "decision_effect", label: "Decision effect" }, { key: "needs_real_world_validation", label: "Validate?" }]} />;
  else if (tab === "Pilot Ideas") content = <DataTable rows={data.businessPilots} columns={[{ key: "pilot_name", label: "Pilot" }, { key: "target_user", label: "User" }, { key: "success_signal", label: "Success signal" }, { key: "privacy_risk", label: "Privacy risk" }, { key: "next_action", label: "Next action" }]} />;
  else content = <DataTable rows={data.businessScoreboard} columns={[{ key: "period", label: "Period" }, { key: "industry_focus", label: "Focus" }, { key: "conversation_target", label: "Conversation target" }, { key: "workflow_case_target", label: "Cases" }, { key: "current_score", label: "Current score" }, { key: "evidence_state", label: "Evidence" }]} />;
  return <div className="research-page"><section className="panel research-head"><div><p className="eyebrow">Track A</p><h2>Business Intelligence</h2><p>Start with printing and packaging. Research patterns are not local facts until a real workflow corrects them.</p></div><Tag type="green">first active: quote-to-job</Tag></section><ResearchTabs tabs={tabs} active={tab} onChange={setTab} /><section className="panel full-panel">{content}</section><LearningMode meaning="Use operating research to create evidence, not a premature product." verified="Five industry manuals and 40 desk-research workflow stages are prepared." uncertain="All local workflow assumptions and pain levels." question="Which evidence would make this experience strongest for an early-career application?" action="Reconstruct one completed anonymous printing job with an owner or estimator." notYet="Do not automate pricing, worker surveillance, compliance, or confidential data." /></div>;
}

function programGroup(category) {
  return { Dream: "Elite network / high reach", "Strong target": "Strong target", "Realistic target": "Strategic fit", "Financially safe backup": "Backup or lower-priority" }[category] || category;
}

function valueAssessment(program) {
  const tuition = String(program.current_tuition_snapshot || "").toLowerCase();
  const duration = numberFrom(program.duration);
  const degree = String(program.degree_family || "").toLowerCase();
  const highCost = /usd|gbp|eur 7[0-9]|eur 6[0-9]/.test(tuition);
  const lowCost = /no general tuition|no tuition|eur 4,000|eur 1,500/.test(tuition);
  const elite = program.category === "Dream";
  const aligned = degree.includes("analytics") || degree.includes("tech/business") || degree.includes("innovation");
  const inputs = { "Learning depth": aligned ? 4 : 3, "Practical exposure": 2, "Faculty access": 2, "Peer quality": elite ? 4 : 3, "Alumni usefulness": elite ? 4 : 3, "Founder/investor access": 2, "Technology ecosystem": ["US", "UK", "Singapore", "Germany"].some((country) => program.country.includes(country)) ? 4 : 3, "International mobility": 3, "Career opportunity": 3, "Total cost": lowCost ? 5 : highCost ? 1 : 3, "Program duration": duration && duration <= 14 ? 4 : duration <= 18 ? 3 : 2, "Opportunity cost": duration && duration <= 14 ? 4 : 2 };
  const score = Math.round(Object.values(inputs).reduce((sum, value) => sum + value, 0) / Object.keys(inputs).length * 20);
  const label = score >= 76 ? "Strong value" : score >= 62 ? "Conditional value" : score >= 48 ? "Weak value" : "Not worth the cost";
  return { inputs, score, label, difficult: elite ? "Potential peer, alumni, and location access may be difficult to reproduce independently; evidence needs direct verification." : "A verified international cohort, applied projects, and local employer access may be difficult to reproduce independently.", independent: "Core analytics, management theory, and technical foundations can be learned independently at far lower cost.", risk: highCost ? "Overpaying for brand or content without actively using access, projects, and alumni." : "Choosing lower tuition despite unclear prerequisite fit, network depth, or career access.", evidence: elite ? "Moderate evidence" : "Needs deeper verification" };
}

function ProgramCard({ program, selected, onToggle }) {
  const value = valueAssessment(program);
  return <article className="program-card"><div className="section-title"><div><h3>{program.university}</h3><p>{program.program} | {program.country}</p></div><Tag type={value.label === "Strong value" ? "green" : "medium"}>{value.label} {value.score}/100</Tag></div><div className="program-facts"><span><strong>Degree:</strong> {program.degree_family}</span><span><strong>Duration:</strong> {program.duration}</span><span><strong>Tuition:</strong> {program.current_tuition_snapshot}</span><span><strong>Work expectation:</strong> {program.work_experience}</span></div><p><strong>Why it fits:</strong> {program.why_fit_deepan}</p><p><strong>Why it may not:</strong> {program.main_gap_or_risk}</p><button className={selected ? "compare-toggle selected" : "compare-toggle"} type="button" onClick={() => onToggle(program.rank)} aria-pressed={selected}>{selected ? "Selected for comparison" : "Compare program"}</button><details><summary>Value for Money and Network Capital</summary><p className="provisional">Provisional planning assessment, not a university ranking. Unsupported access dimensions use a conservative baseline pending direct verification.</p><div className="score-grid">{Object.entries(value.inputs).map(([label, score]) => <span key={label}>{label}<strong>{score}/5</strong></span>)}</div><p><strong>What you are paying for:</strong> credentialed structure, cohort, feedback loops, local access, and career signalling where the program delivers them.</p><p><strong>Difficult to replicate:</strong> {value.difficult}</p><p><strong>Learn independently:</strong> {value.independent}</p><p><strong>Best-case value:</strong> active use of projects, mentors, peers, alumni, and location produces career and founder leverage.</p><p><strong>Realistic value:</strong> depends heavily on deliberate networking, participation, and prerequisite fit.</p><p><strong>Main overpayment risk:</strong> {value.risk}</p><p><strong>Network evidence:</strong> <Tag type={value.evidence === "Moderate evidence" ? "medium" : "watch"}>{value.evidence}</Tag></p></details><p className="source-link"><a href={program.official_program_url} target="_blank" rel="noreferrer">Official program source</a> <a href={program.official_admissions_or_fee_url} target="_blank" rel="noreferrer">Admissions / fee source</a> Verified {program.last_verified}</p></article>;
}

function GlobalEducationStrategy({ data, query, status }) {
  const tabs = ["Degree Decision", "Country Comparison", "Program Shortlist", "Network Capital", "Scholarships", "Exams", "Profile Building", "Timeline", "Financial Scenarios", "Risks", "Global Education Scoreboard"];
  const [tab, setTab] = useState("Degree Decision");
  const [filters, setFilters] = useState({ country: "all", degree: "all", value: "all" });
  const [comparison, setComparison] = useState([]);
  const programs = useMemo(() => applyFilters(data.mbaPrograms, query, status).filter((program) => (filters.country === "all" || program.country === filters.country) && (filters.degree === "all" || program.degree_family === filters.degree) && (filters.value === "all" || valueAssessment(program).label === filters.value)), [data.mbaPrograms, query, status, filters]);
  const toggleComparison = (rank) => setComparison((current) => current.includes(rank) ? current.filter((item) => item !== rank) : current.length < 3 ? [...current, rank] : current);
  const selectedPrograms = programs.filter((program) => comparison.includes(program.rank));
  const filterControls = <div className="program-filters"><label>Country<select value={filters.country} onChange={(event) => setFilters((current) => ({ ...current, country: event.target.value }))}><option value="all">All countries</option>{[...new Set(data.mbaPrograms.map((program) => program.country))].map((country) => <option key={country}>{country}</option>)}</select></label><label>Degree<select value={filters.degree} onChange={(event) => setFilters((current) => ({ ...current, degree: event.target.value }))}><option value="all">All degrees</option>{[...new Set(data.mbaPrograms.map((program) => program.degree_family))].map((degree) => <option key={degree}>{degree}</option>)}</select></label><label>Value<select value={filters.value} onChange={(event) => setFilters((current) => ({ ...current, value: event.target.value }))}><option value="all">All value categories</option>{["Strong value", "Conditional value", "Weak value", "Not worth the cost"].map((value) => <option key={value}>{value}</option>)}</select></label></div>;
  let content;
  if (tab === "Degree Decision") content = <><div className="decision-grid">{[["A. Study immediately after B.Sc.", "Strong only for an exceptional early-career pathway.", "Analytics, technology management, innovation, entrepreneurship, MiM", "Admissions and scholarship fit depend on academic evidence; leadership credibility is still developing."], ["B. Work/build for 2-3 years, then study", "Best balance for a stronger specialist master's application.", "Business analytics, tech-business, innovation", "Creates measurable impact, leadership, and clearer founder direction; waiting has an opportunity cost."], ["C. Build/work for 3-5 years, then apply for MBA", "Best conventional MBA timing in the current plan.", "MBA / executive network routes", "Stronger leadership credibility and cohort contribution; do not wait passively."]].map(([title, verdict, degrees, risk]) => <article key={title}><h3>{title}</h3><p>{verdict}</p><p><strong>Best degree types:</strong> {degrees}</p><p><strong>Leverage / risk:</strong> {risk}</p></article>)}</div><div className="chart-grid"><MiniBars title="Programs by country" rows={Object.entries(data.mbaPrograms.reduce((totals, program) => ({ ...totals, [program.country]: (totals[program.country] || 0) + 1 }), {})).map(([label, value]) => ({ label, value }))} note="Shortlist coverage" /><MiniBars title="Programs by degree family" rows={Object.entries(data.mbaPrograms.reduce((totals, program) => ({ ...totals, [program.degree_family]: (totals[program.degree_family] || 0) + 1 }), {})).map(([label, value]) => ({ label, value }))} note="Not an admission forecast" /></div></>;
  else if (tab === "Country Comparison") content = <DataTable rows={data.mbaCountries} columns={[{ key: "country", label: "Country" }, { key: "best_fresh_grad_path", label: "Early-career route" }, { key: "tech_business_job_market", label: "Career / technology" }, { key: "startup_ecosystem", label: "Ecosystem" }, { key: "major_risks", label: "Risk" }, { key: "recommendation", label: "Recommendation" }]} />;
  else if (tab === "Program Shortlist") content = <><div className="section-title"><h3>Compare up to three programs</h3><span>{comparison.length}/3 selected</span></div>{filterControls}{selectedPrograms.length > 0 && <DataTable rows={selectedPrograms} columns={[{ key: "university", label: "University" }, { key: "country", label: "Country" }, { key: "degree_family", label: "Degree" }, { key: "duration", label: "Duration" }, { key: "current_tuition_snapshot", label: "Tuition" }, { key: "main_gap_or_risk", label: "Main risk" }]} />}{programs.length ? <div className="program-groups">{["Elite network / high reach", "Strong target", "Strategic fit", "Backup or lower-priority"].map((group) => <section key={group}><h3>{group}</h3>{programs.filter((program) => programGroup(program.category) === group).map((program) => <ProgramCard key={`${program.rank}-${program.university}`} program={program} selected={comparison.includes(program.rank)} onToggle={toggleComparison} />)}</section>)}</div> : <div className="empty-state">No programs match these filters. Clear one filter to continue comparing.</div>}</>;
  else if (tab === "Network Capital") content = <div className="program-groups">{programs.map((program) => { const value = valueAssessment(program); return <article className="network-card" key={program.rank}><div className="section-title"><h3>{program.university}</h3><Tag type={value.evidence === "Moderate evidence" ? "medium" : "watch"}>{value.evidence}</Tag></div><p><strong>Potential network capital:</strong> peer and alumni reach, founder/investor access, technology ecosystem, corporate access, location advantage, mobility, diversity, and practical exposure must be verified directly.</p><p><strong>Could give Deepan:</strong> structured access points and a credible reason to request feedback, projects, and conversations.</p><p><strong>Cannot guarantee:</strong> mentors, investors, internships, jobs, warm introductions, or founder outcomes.</p><p><strong>Deepan must contribute:</strong> active participation, well-prepared outreach, useful work, follow-through, and evidence of impact.</p></article>; })}</div>;
  else if (tab === "Scholarships") content = <DataTable rows={data.mbaScholarships} columns={[{ key: "opportunity", label: "Scholarship" }, { key: "country_or_scope", label: "Scope" }, { key: "funding_snapshot", label: "Funding" }, { key: "key_eligibility_or_constraint", label: "Constraint" }, { key: "deadline_status", label: "Deadline" }, { key: "official_url", label: "Official source", render: (row) => <a href={row.official_url} target="_blank" rel="noreferrer">Source</a> }]} />;
  else if (tab === "Exams") content = <DataTable rows={data.mbaExams} columns={[{ key: "exam", label: "Exam" }, { key: "decision", label: "Decision" }, { key: "recommended_timing", label: "Timing" }, { key: "first_action", label: "First action" }, { key: "official_source_url", label: "Official source", render: (row) => <a href={row.official_source_url} target="_blank" rel="noreferrer">Source</a> }]} />;
  else if (tab === "Profile Building") content = <DataTable rows={data.mbaProfile} columns={[{ key: "period", label: "Period" }, { key: "priority", label: "Priority" }, { key: "action", label: "Action" }, { key: "deliverable", label: "Evidence" }, { key: "track_a_link", label: "Track A link" }]} />;
  else if (tab === "Timeline") content = <DataTable rows={data.mbaTimeline} columns={[{ key: "window", label: "Window" }, { key: "stage", label: "Stage" }, { key: "required_actions", label: "Required actions" }, { key: "decision_gate", label: "Decision gate" }, { key: "official_fact_to_reverify", label: "Reverify" }]} />;
  else if (tab === "Financial Scenarios") content = <DataTable rows={data.mbaFinance} columns={[{ key: "scenario", label: "Scenario" }, { key: "example_route", label: "Route" }, { key: "total_planning_band", label: "Planning band" }, { key: "scholarship_assumption", label: "Scholarship" }, { key: "decision_rule", label: "Decision rule" }]} />;
  else if (tab === "Risks") content = <DataTable rows={programs} columns={[{ key: "university", label: "Program" }, { key: "main_gap_or_risk", label: "Main risk" }, { key: "deadline_status_for_deepan_intake", label: "Timing" }, { key: "unstable_fact_flag", label: "Reverify?" }]} />;
  else content = <section className="metrics-grid">{[["Countries researched", data.mbaCountries.length], ["Programs researched", data.mbaPrograms.length], ["Scholarships", data.mbaScholarships.length], ["Profile actions", data.mbaProfile.length], ["Current recommendation", "Specialist master first"]].map(([label, value]) => <Metric key={label} label={label} value={value} />)}</section>;
  return <div className="research-page"><section className="panel research-head"><div><p className="eyebrow">Track B</p><h2>Global Education Strategy</h2><p>Do not rush into a conventional MBA immediately after graduation unless a truly exceptional early-career pathway is available.</p></div><Tag type="medium">2028 facts must be reverified</Tag></section><ResearchTabs tabs={tabs} active={tab} onChange={setTab} /><section className="panel full-panel">{content}</section><LearningMode meaning="A degree is an access-and-leverage decision, not a tuition comparison." verified="Twenty program snapshots and official-source links were captured on 2026-07-12." uncertain="Future fees, deadlines, curriculum delivery, access quality, visas, and 2028 eligibility." question="Which program offers genuinely non-replicable access for my current evidence and intended path?" action="Build an academic prerequisite matrix and verify each shortlisted program directly." notYet="Do not treat prestige, scholarships, or an immediate MBA as a complete decision." /></div>;
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function downloadFile(filename, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

const privateLeadDefaults = {
  status: "Not contacted",
  do_not_contact: "false",
  opt_out: "false",
  last_contacted: "",
  next_follow_up: "",
  bounce_status: "Not checked",
  local_notes: ""
};

const privateLeadFields = Object.keys(privateLeadDefaults);

function mergeSalesRows(freshRows, savedRows) {
  const saved = new Map((savedRows || []).map((row) => [row.lead_id, row]));
  return freshRows.map((row) => {
    const local = saved.get(row.lead_id) || {};
    const privatePatch = privateLeadFields.reduce((acc, key) => {
      acc[key] = local[key] ?? privateLeadDefaults[key];
      return acc;
    }, {});
    return { ...row, ...privatePatch };
  });
}

function readyCheck(lead) {
  const sourceOk = Boolean(lead.contact_source || lead.website);
  const verifiedOk = Boolean(lead.contact_verified_date) && lead.contact_status === "Verified";
  const consentOk = !isYes(lead.do_not_contact) && !isYes(lead.opt_out);
  const duplicateOk = !lead.last_contacted;
  const bounceOk = lead.bounce_status !== "Bounced";
  return { ready: sourceOk && verifiedOk && consentOk && duplicateOk && bounceOk, sourceOk, verifiedOk, consentOk, duplicateOk, bounceOk };
}

function Sales({ data }) {
  const [tab, setTab] = useState("Today");
  const [briefLeadId, setBriefLeadId] = useState("");
  const [filters, setFilters] = useState({ search: "", city: "all", industry: "all", contact: "all", due: false });
  const [state, setState] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(salesStorageKey));
      if (!saved) return { leads: mergeSalesRows(data.salesLeads, []), emails: [], meta: {} };
      return {
        leads: mergeSalesRows(data.salesLeads, saved.leads),
        emails: Array.isArray(saved.emails) ? saved.emails : [],
        meta: saved.meta || {}
      };
    } catch {
      return { leads: mergeSalesRows(data.salesLeads, []), emails: [], meta: {} };
    }
  });

  useEffect(() => localStorage.setItem(salesStorageKey, JSON.stringify(state)), [state]);

  const leads = state.leads || [];
  const emails = state.emails || [];
  const cities = [...new Set(leads.map((row) => row.city).filter(Boolean))].sort();
  const industries = [...new Set(leads.map((row) => row.industry).filter(Boolean))].sort();
  const visibleLeads = leads.filter((row) => {
    if (!matches(row, filters.search)) return false;
    if (filters.city !== "all" && row.city !== filters.city) return false;
    if (filters.industry !== "all" && row.industry !== filters.industry) return false;
    if (filters.contact !== "all" && row.contact_status !== filters.contact) return false;
    if (filters.due && !dateIsDue(row.next_follow_up)) return false;
    return true;
  }).sort((a, b) => (a.business_name || "").localeCompare(b.business_name || ""));

  const emailFor = (leadId) => emails.find((item) => item.lead_id === leadId);
  const briefs = data.salesBriefs || [];
  const industryKnowledge = data.salesIndustryKnowledge || "";
  const dailyBatch = leads.filter((row) => row.daily_batch === "2026-07-11-industrial");
  const selectedToday = dailyBatch.filter((row) => row.today_pick === "Yes");
  const todayEmails = emails.filter((row) => dailyBatch.some((lead) => lead.lead_id === row.lead_id));
  const activeBrief = briefs.find((brief) => brief.lead_id === briefLeadId);
  const today = {
    verify: leads.filter((row) => row.contact_status !== "Verified").length,
    approve: emails.filter((row) => row.approval_status !== "Approved" && row.sent_status !== "Sent").length,
    followups: leads.filter((row) => dateIsDue(row.next_follow_up)).length,
    replies: emails.filter((row) => row.reply_status && row.reply_status !== "No reply").length,
    meetings: leads.filter((row) => row.status === "Meeting booked").length
  };

  function updateLead(id, patch) {
    setState((current) => ({ ...current, leads: current.leads.map((row) => row.lead_id === id ? { ...row, ...patch } : row) }));
  }

  function updateEmail(id, patch) {
    setState((current) => ({ ...current, emails: current.emails.map((row) => row.lead_id === id ? { ...row, ...patch } : row) }));
  }

  function exportJson() {
    const next = { ...state, meta: { ...(state.meta || {}), lastBackupAt: new Date().toISOString() } };
    localStorage.setItem(salesStorageKey, JSON.stringify(next));
    setState(next);
    downloadFile("dragon-os-sales-private-backup.json", JSON.stringify(next, null, 2), "application/json");
  }

  function exportCsv() {
    const headers = Object.keys(leads[0] || {});
    const content = [headers.join(","), ...leads.map((row) => headers.map((key) => csvEscape(row[key])).join(","))].join("\n");
    downloadFile("sales-private-local-export.csv", content, "text/csv");
  }

  function importJson(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const next = JSON.parse(reader.result);
        if (!Array.isArray(next.leads) || !Array.isArray(next.emails)) throw new Error("Invalid pipeline backup");
        setState({
          leads: mergeSalesRows(data.salesLeads, next.leads),
          emails: next.emails,
          meta: { ...(next.meta || {}), lastImportAt: new Date().toISOString() }
        });
      } catch (error) {
        window.alert(error.message);
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function createDraft(lead) {
    if (emailFor(lead.lead_id)) {
      setTab("Email Queue");
      return;
    }
    setState((current) => ({
      ...current,
      emails: [
        ...current.emails,
        {
          lead_id: lead.lead_id,
          company: lead.business_name,
          recipient_email: lead.email || "",
          subject_a: "",
          email_body: "",
          approval_status: "Draft - Requires Approval",
          sent_status: "Not sent",
          sent_date: "",
          reply_status: "No reply",
          bounce_status: "Not checked",
          private_notes: ""
        }
      ]
    }));
    setTab("Email Queue");
  }

  const tabs = ["Today", "Leads", "Email Queue", "Follow-Ups", "Replies", "Meetings", "Proposals", "Revenue", "Industry Knowledge"];
  const rowsForTab = tab === "Follow-Ups" ? visibleLeads.filter((row) => row.next_follow_up) :
    tab === "Replies" ? visibleLeads.filter((row) => emailFor(row.lead_id)?.reply_status !== "No reply") :
    tab === "Meetings" ? visibleLeads.filter((row) => row.status === "Meeting booked") :
    tab === "Proposals" ? visibleLeads.filter((row) => ["Proposal sent", "Won", "Lost"].includes(row.status)) :
    tab === "Revenue" ? visibleLeads.filter((row) => row.status === "Won") : visibleLeads;

  return (
    <div className="sales-workspace">
      <section className="panel sales-head">
        <div>
          <h2>Sales Pipeline</h2>
          <p>Private sales activity is stored only in this browser. Export a backup after each session. Do not store customer secrets or confidential information here.</p>
          <span className="local-warning">Browser-local storage: {backupLabel(state.meta)}</span>
        </div>
        <div className="sales-io">
          <button type="button" onClick={exportJson}>Export JSON</button>
          <button type="button" onClick={exportCsv}>Export Local CSV</button>
          <label className="import-button">Import JSON<input type="file" accept="application/json" onChange={importJson} /></label>
        </div>
      </section>

      <div className="sales-tabs" role="tablist">
        {tabs.map((item) => <button type="button" key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}</button>)}
      </div>

      {tab === "Today" && (
        <>
          <section className="sales-metrics">
            <button onClick={() => setTab("Leads")}><span>Fresh today</span><strong>{dailyBatch.length}/5</strong></button>
            <button onClick={() => setTab("Leads")}><span>Verify</span><strong>{today.verify}</strong></button>
            <button onClick={() => setTab("Email Queue")}><span>Approve</span><strong>{today.approve}</strong></button>
            <button onClick={() => setTab("Email Queue")}><span>Queued today</span><strong>{todayEmails.length}</strong></button>
            <button onClick={() => setTab("Follow-Ups")}><span>Follow-ups</span><strong>{today.followups}</strong></button>
            <button onClick={() => setTab("Replies")}><span>Replies</span><strong>{today.replies}</strong></button>
            <div><span>Max sends today</span><strong>0</strong></div>
          </section>
          <section className="panel sales-today-grid">
            <div>
              <h3>Top next action</h3>
              <strong>Configure a professional sender first. Until then, review only and send nothing.</strong>
              <p>Today has {dailyBatch.length} researched companies, {selectedToday.length} selected leads, {today.approve} private drafts awaiting review, and {today.followups} follow-ups due.</p>
            </div>
            <ol>
              <li>Confirm business sender</li><li>Verify contact source</li><li>Check opt-out flags</li><li>Approve manually</li><li>Export JSON backup</li>
            </ol>
          </section>
          <section className="panel daily-best">
            <div className="section-title"><h2>Selected Best 3</h2><Tag type={dailyBatch.length === 5 ? "green" : "medium"}>{dailyBatch.length === 5 ? "daily batch complete" : "incomplete"}</Tag></div>
            <div className="action-list">
              {selectedToday.map((lead, index) => (
                <article className="action-row" key={lead.lead_id}>
                  <span className="rank">{index + 1}</span>
                  <div><strong>{lead.business_name}</strong><p>{lead.generic_service_category} - {lead.contact_status}</p></div>
                  <Tag type={readyCheck(lead).ready ? "green" : "medium"}>{readyCheck(lead).ready ? "ready gate passed" : "safety check needed"}</Tag>
                  <button type="button" onClick={() => { setBriefLeadId(lead.lead_id); setTab("Leads"); }}>Open Company Brief</button>
                </article>
              ))}
            </div>
          </section>
          <section className="panel privacy-notice">
            <div className="section-title"><h2>Private Storage Notice</h2><Tag type="critical">local only</Tag></div>
            <p>Personalized email bodies, approvals, follow-up notes, replies, meetings, proposals, and revenue notes are not loaded from public CSV files. They exist only in this browser after you type or import them.</p>
          </section>
        </>
      )}

      {tab === "Email Queue" ? (
        <section className="panel sales-list">
          {!emails.length && <div className="empty-state">No private email drafts in this browser. Create a local draft from the Leads tab or import a private JSON backup.</div>}
          {emails.map((email) => (
            <article className="email-card" key={email.lead_id}>
              <div className="email-card-head"><div><strong>{email.company}</strong><span>{email.recipient_email || "Recipient needs verification"}</span></div><Tag type={email.approval_status === "Approved" ? "green" : "medium"}>{email.approval_status}</Tag></div>
              <input value={email.subject_a} placeholder="Private subject" onChange={(event) => updateEmail(email.lead_id, { subject_a: event.target.value })} />
              <textarea value={email.email_body} placeholder="Private email body. Do not store secrets." onChange={(event) => updateEmail(email.lead_id, { email_body: event.target.value })} />
              <div className="row-actions"><button onClick={() => updateEmail(email.lead_id, { approval_status: "Approved" })}>Approve</button><button onClick={() => updateEmail(email.lead_id, { approval_status: "Rejected" })}>Reject</button><button onClick={() => updateEmail(email.lead_id, { sent_status: "Sent", sent_date: new Date().toISOString().slice(0, 10) })}>Mark sent</button><button onClick={() => updateEmail(email.lead_id, { reply_status: "Positive reply" })}>Positive reply</button><button onClick={() => updateEmail(email.lead_id, { bounce_status: "Bounced" })}>Mark bounced</button></div>
            </article>
          ))}
        </section>
      ) : tab === "Industry Knowledge" ? (
        <section className="panel sales-knowledge">
          <pre>{industryKnowledge}</pre>
        </section>
      ) : tab !== "Today" && (
        <section className="panel sales-table-panel">
          {activeBrief && (
            <div className="company-brief">
              <div className="section-title"><h2>{activeBrief.company_name}</h2><Tag type="green">{activeBrief.freshness_status}</Tag></div>
              <p><strong>Verified:</strong> {activeBrief.verified_observation}</p>
              <p><strong>Public workflow:</strong> {activeBrief.public_workflow}</p>
              <p><strong>Generic service:</strong> {activeBrief.generic_service_category}</p>
              <p><strong>Public contact:</strong> {activeBrief.public_email || activeBrief.public_phone || "Needs public contact verification"}</p>
              <button type="button" onClick={() => setBriefLeadId("")}>Close brief</button>
            </div>
          )}
          <div className="sales-filters">
            <input placeholder="Search sales records" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} />
            <select value={filters.city} onChange={(event) => setFilters({ ...filters, city: event.target.value })}><option value="all">All cities</option>{cities.map((city) => <option key={city}>{city}</option>)}</select>
            <select value={filters.industry} onChange={(event) => setFilters({ ...filters, industry: event.target.value })}><option value="all">All industries</option>{industries.map((industry) => <option key={industry}>{industry}</option>)}</select>
            <select value={filters.contact} onChange={(event) => setFilters({ ...filters, contact: event.target.value })}><option value="all">All contact status</option><option>Verified</option><option>Needs manual verification</option></select>
            <label><input type="checkbox" checked={filters.due} onChange={(event) => setFilters({ ...filters, due: event.target.checked })} /> Due only</label>
          </div>
          <div className="table-wrap"><table><thead><tr><th>Lead</th><th>Public contact</th><th>Service category</th><th>Safety fields</th><th>Status / follow-up</th><th>Ready gate</th><th>Actions</th></tr></thead><tbody>
            {rowsForTab.map((lead) => { const gate = readyCheck(lead); return <tr key={lead.lead_id}><td><strong>{lead.business_name}</strong><small>{lead.city} - {lead.industry}<br />{lead.contact_status}</small></td><td><a href={lead.website}>{lead.website}</a><small>{lead.email || lead.phone || "Public contact needed"}</small><input value={lead.contact_source || ""} placeholder="Public contact source" onChange={(event) => updateLead(lead.lead_id, { contact_source: event.target.value })} /><input type="date" value={lead.contact_verified_date || ""} onChange={(event) => updateLead(lead.lead_id, { contact_verified_date: event.target.value, contact_status: event.target.value ? "Verified" : lead.contact_status })} /></td><td>{lead.generic_service_category}</td><td><label><input type="checkbox" checked={isYes(lead.do_not_contact)} onChange={(event) => updateLead(lead.lead_id, { do_not_contact: String(event.target.checked) })} /> do_not_contact</label><label><input type="checkbox" checked={isYes(lead.opt_out)} onChange={(event) => updateLead(lead.lead_id, { opt_out: String(event.target.checked) })} /> opt_out</label><select value={lead.bounce_status} onChange={(event) => updateLead(lead.lead_id, { bounce_status: event.target.value })}>{["Not checked", "No bounce", "Bounced"].map((item) => <option key={item}>{item}</option>)}</select></td><td><select value={lead.status} onChange={(event) => updateLead(lead.lead_id, { status: event.target.value })}>{["Not contacted", "Ready for manual review", "Contacted", "Replied", "Meeting booked", "Proposal sent", "Won", "Lost", "Research later"].map((item) => <option key={item}>{item}</option>)}</select><input type="date" value={lead.last_contacted} onChange={(event) => updateLead(lead.lead_id, { last_contacted: event.target.value })} /><input type="date" value={lead.next_follow_up} onChange={(event) => updateLead(lead.lead_id, { next_follow_up: event.target.value })} /></td><td><Tag type={gate.ready ? "green" : "critical"}>{gate.ready ? "ready" : "blocked"}</Tag><small>{!gate.sourceOk ? "Missing source. " : ""}{!gate.verifiedOk ? "Verify contact. " : ""}{!gate.consentOk ? "Suppressed. " : ""}{!gate.duplicateOk ? "Already contacted. " : ""}{!gate.bounceOk ? "Bounced. " : ""}</small></td><td><button disabled={!gate.ready} onClick={() => updateLead(lead.lead_id, { status: "Ready for manual review" })}>Mark ready</button><button onClick={() => createDraft(lead)}>Local draft</button><button onClick={() => { setBriefLeadId(lead.lead_id); }}>Brief</button></td></tr>; })}
          </tbody></table></div>
        </section>
      )}
    </div>
  );
}
function App() {
  const { data, error } = useDashboardData();
  const [activePage, setActivePage] = useState("Overview");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const deferredQuery = useDeferredValue(query);

  const content = useMemo(() => {
    if (!data) return null;
    const props = { data, query: deferredQuery, status };
    if (activePage === "Overview") return <Overview {...props} />;
    if (activePage === "Leads") return <Leads {...props} />;
    if (activePage === "Internships") return <Internships {...props} />;
    if (activePage === "AIC RAISE / Startup") return <Startup {...props} />;
    if (activePage === "PrintExpo") return <PrintExpo {...props} />;
    if (activePage === "Print ERP Demo") return <PrintErpDemo {...props} />;
    if (activePage === "Services") return <Services {...props} />;
    if (activePage === "SaaS Ideas") return <SaasIdeas {...props} />;
    if (activePage === "Outcomes") return <Outcomes {...props} />;
    if (activePage === "Business Intelligence") return <BusinessIntelligence {...props} />;
    if (activePage === "Global Education Strategy") return <GlobalEducationStrategy {...props} />;
    if (activePage === "Sales") return <Sales {...props} />;
    return <WeeklyPlan {...props} />;
  }, [activePage, data, deferredQuery, status]);

  if (error) {
    return <div className="loading"><div><strong>Dashboard data could not load.</strong><p>{error}</p><button type="button" onClick={() => window.location.reload()}>Retry loading</button></div></div>;
  }

  if (!data) {
    return <div className="loading">Loading career pipeline...</div>;
  }

  return (
    <Shell activePage={activePage} setActivePage={setActivePage} query={query} setQuery={setQuery} status={status} setStatus={setStatus}>
      {content}
    </Shell>
  );
}

createRoot(document.getElementById("root")).render(<App />);

