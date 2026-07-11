import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./dashboard.css";

const portfolioUrl = "./index.html";
const dataVersion = "20260711-sales-safety";
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
  salesIndustryKnowledge: "./data/sales_industry_knowledge.md"
};

const pages = [
  "Overview",
  "Leads",
  "Internships",
  "AIC RAISE / Startup",
  "PrintExpo",
  "Print ERP Demo",
  "Services",
  "SaaS Ideas",
  "Outcomes",
  "Sales",
  "Weekly Plan"
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
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="./dashboard.html" aria-label="Dragon OS Mission Control">
          <span className="brand-mark">DO</span>
          <span>
            <strong>Dragon OS</strong>
            <small>Founder mission control</small>
          </span>
        </a>
        <nav className="nav-list" aria-label="Dashboard pages">
          {pages.map((page) => (
            <button
              key={page}
              className={activePage === page ? "nav-item active" : "nav-item"}
              onClick={() => setActivePage(page)}
              type="button"
            >
              <span className="nav-dot" />
              {page}
            </button>
          ))}
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
  const actions = applyFilters(data.actions, query, status);
  const topActions = [...actions].sort((a, b) => numberFrom(a.priority) - numberFrom(b.priority)).slice(0, 8);
  const hotLeads = data.leads.filter((lead) => scoreOf(lead) >= 82).length;
  const serviceFloor = data.services.reduce((sum, row) => sum + numberFrom(row.standard_price_inr), 0);
  const internshipCount = data.internships.length;
  const outcomeCount = data.outcomes.length;
  const publicSalesLeads = data.salesLeads || [];
  const privateSales = readPrivateSalesState();
  const privateLeads = privateSales.leads || [];
  const privateEmails = privateSales.emails || [];
  const freshFive = publicSalesLeads.filter((lead) => lead.daily_batch === "2026-07-11-industrial");
  const selectedThree = freshFive.filter((lead) => lead.today_pick === "Yes");
  const draftsAwaitingReview = privateEmails.filter((email) => email.approval_status !== "Approved" && email.sent_status !== "Sent").length;
  const followUpsDue = privateLeads.filter((lead) => dateIsDue(lead.next_follow_up)).length;
  const repliesWaiting = privateEmails.filter((email) => email.reply_status && email.reply_status !== "No reply").length;
  const exactNextAction = "Buy and configure a professional sender email, then manually approve at most one outreach draft.";

  return (
    <div className="page-grid">
      <section className="panel hero-panel">
        <div>
          <p className="eyebrow">Founder command center</p>
          <h2>Turn Dragon OS research into daily founder moves.</h2>
          <p>
            One place for career actions, local leads, startup channels, PrintExpo prep, service pricing, SaaS ideas, knowledge, and follow-ups.
          </p>
        </div>
        <div className="hero-metrics">
          <Metric label="Hot local leads" value={hotLeads} />
          <Metric label="Tracked actions" value={data.actions.length} tone="pink" />
          <Metric label="Internship channels" value={internshipCount} tone="green" />
          <Metric label="Logged outcomes" value={outcomeCount} tone="violet" />
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
          <Metric label="Fresh-5 status" value={`${freshFive.length}/5`} />
          <Metric label="Selected best 3" value={`${selectedThree.length}/3`} tone="green" />
          <Metric label="Drafts awaiting review" value={draftsAwaitingReview} tone="violet" />
          <Metric label="Follow-ups due" value={followUpsDue} tone="pink" />
          <Metric label="Replies waiting" value={repliesWaiting} tone="green" />
          <Metric label="Last backup status" value={backupLabel(privateSales.meta)} tone="cyan" />
        </div>
        <div className="selected-strip">
          {selectedThree.map((lead) => (
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
          {topActions.map((item) => (
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
          rows={topActions.slice(0, 6)}
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
        <p className="panel-note">Current service-market potential in standard packages: INR {serviceFloor.toLocaleString("en-IN")} across tracked offers.</p>
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

  const content = useMemo(() => {
    if (!data) return null;
    const props = { data, query, status };
    if (activePage === "Overview") return <Overview {...props} />;
    if (activePage === "Leads") return <Leads {...props} />;
    if (activePage === "Internships") return <Internships {...props} />;
    if (activePage === "AIC RAISE / Startup") return <Startup {...props} />;
    if (activePage === "PrintExpo") return <PrintExpo {...props} />;
    if (activePage === "Print ERP Demo") return <PrintErpDemo {...props} />;
    if (activePage === "Services") return <Services {...props} />;
    if (activePage === "SaaS Ideas") return <SaasIdeas {...props} />;
    if (activePage === "Outcomes") return <Outcomes {...props} />;
    if (activePage === "Sales") return <Sales {...props} />;
    return <WeeklyPlan {...props} />;
  }, [activePage, data, query, status]);

  if (error) {
    return <div className="loading">Data load failed: {error}</div>;
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

