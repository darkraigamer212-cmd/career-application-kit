import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./dashboard.css";

const portfolioUrl = "./index.html";

const files = {
  master: "./data/money_opportunity_master_report.md",
  actions: "./data/master_action_tracker.csv",
  leads: "./data/agent_1_local_client_leads.csv",
  internships: "./data/agent_5_internship_opportunities.csv",
  startups: "./data/agent_4_startup_incubator_database.csv",
  services: "./data/agent_3_service_pricing_table.csv",
  saas: "./data/agent_6_saas_ideas.csv",
  erp: "./data/agent_7_reusable_erp_framework.md",
  crm: "./data/agent_8_personal_crm_spec.md"
};

const pages = [
  "Overview",
  "Leads",
  "Internships",
  "AIC RAISE / Startup",
  "PrintExpo",
  "Services",
  "SaaS Ideas",
  "Weekly Plan"
];

const statusOptions = ["all", "ready", "researched", "planned", "not contacted", "ongoing"];

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
            const response = await fetch(url);
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
        <a className="brand" href="./dashboard.html" aria-label="Career Pipeline Dashboard">
          <span className="brand-mark">CP</span>
          <span>
            <strong>Career Pipeline</strong>
            <small>Money + opportunity system</small>
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
          <p>Ship one focused demo, track follow-ups, and only act through manual review.</p>
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

function Overview({ data, query, status }) {
  const actions = applyFilters(data.actions, query, status);
  const topActions = [...actions].sort((a, b) => numberFrom(a.priority) - numberFrom(b.priority)).slice(0, 8);
  const hotLeads = data.leads.filter((lead) => scoreOf(lead) >= 82).length;
  const serviceFloor = data.services.reduce((sum, row) => sum + numberFrom(row.standard_price_inr), 0);
  const internshipCount = data.internships.length;
  const saasTop = data.saas.filter((row) => Number(row.rank) <= 10).length;

  return (
    <div className="page-grid">
      <section className="panel hero-panel">
        <div>
          <p className="eyebrow">Founder command center</p>
          <h2>Turn research into daily revenue moves.</h2>
          <p>
            One place for local leads, internships, startup channels, PrintExpo prep, service pricing, SaaS ideas, and follow-ups.
          </p>
        </div>
        <div className="hero-metrics">
          <Metric label="Hot local leads" value={hotLeads} />
          <Metric label="Tracked actions" value={data.actions.length} tone="pink" />
          <Metric label="Internship channels" value={internshipCount} tone="green" />
          <Metric label="Top SaaS ideas" value={saasTop} tone="violet" />
        </div>
      </section>

      <section className="panel today-panel">
        <div className="section-title">
          <h2>Today's Actions</h2>
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
          <div><strong>Evening</strong><span>Update status, next follow-up, and expected value.</span></div>
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
    if (activePage === "Services") return <Services {...props} />;
    if (activePage === "SaaS Ideas") return <SaasIdeas {...props} />;
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
