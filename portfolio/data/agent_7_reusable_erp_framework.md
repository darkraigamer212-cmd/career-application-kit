# Agent 7: Reusable ERP Framework Architect

## Goal

Turn repeated project patterns into a reusable local-business ERP starter so future client projects start from 60-70 percent complete instead of from zero.

## Reusable modules

- Auth and roles: owner, manager, staff, viewer.
- Client management: customers, contacts, addresses, notes.
- Product/service catalog: items, rates, units, categories.
- Order workflow: enquiry, quote, approved, production, ready, dispatched, paid.
- Inventory logs: stock in, stock out, adjustment, low-stock alert.
- PDF export: quotation, invoice, job card, delivery note, report.
- Dashboard cards: revenue, pending orders, overdue, low stock, receivables.
- Follow-up tracker: next follow-up, status, expected value.
- Audit logs: who changed what and when.
- Billing support: invoice status, payment received, balance.
- WhatsApp helper: copyable message templates first; API later.
- Deployment template: Supabase project, env vars, seed data, role setup.

## Suggested stack

- Frontend: React + TypeScript when possible.
- Backend/data: Supabase Postgres + Row Level Security.
- Styling: existing preferred UI stack; keep admin screens dense and simple.
- PDF: browser print/PDF for starter, server-side generation later.
- Hosting: Vercel/Netlify for frontend, Supabase for database.

## Folder structure

```text
src/
  app/
    dashboard/
    orders/
    customers/
    inventory/
    reports/
    settings/
  components/
    data-table/
    forms/
    layout/
    pdf/
    status/
  modules/
    auth/
    customers/
    orders/
    inventory/
    billing/
    followups/
    audit/
  lib/
    supabase/
    validation/
    currency/
    dates/
    permissions/
  templates/
    printing/
    interiors/
    wholesale/
    education/
```

## Database schema patterns

Core tables:

- profiles: user_id, name, role, business_id.
- businesses: name, city, sector, settings.
- customers: business_id, name, phone, email, address, notes.
- items: business_id, name, unit, base_price, category, active.
- orders: business_id, customer_id, order_no, status, due_date, total, balance.
- order_items: order_id, item_id, description, quantity, rate, amount.
- status_events: order_id, from_status, to_status, note, created_by, created_at.
- inventory_items: business_id, name, sku, unit, min_qty.
- inventory_movements: item_id, movement_type, quantity, reason, order_id.
- payments: order_id, amount, mode, paid_at, note.
- followups: business_id, related_type, related_id, due_date, status, note.
- audit_logs: business_id, actor_id, entity, entity_id, action, diff, created_at.

## Pricing model

- Starter module: INR 8k-25k.
- Niche mini ERP: INR 25k-75k.
- Multi-module ERP: INR 75k-2L.
- Monthly maintenance: INR 2k-15k depending on support and hosting.
- Custom report/PDF add-on: INR 2k-10k each.

## How this reduces build time

- Auth, roles, layout, dashboard, tables, and PDF export become reusable.
- New client work becomes configuration plus 1-2 custom modules.
- You can demo quickly using seeded data.
- Sales improves because clients can see screens before paying.
- Maintenance is easier because all clients share the same core.

## First framework milestone

Build a Printing ERP Starter with:

- login;
- customers;
- quote/order form;
- job status board;
- PDF quotation;
- dashboard cards;
- basic follow-ups.

Then fork labels/templates for interiors and wholesale demos.
