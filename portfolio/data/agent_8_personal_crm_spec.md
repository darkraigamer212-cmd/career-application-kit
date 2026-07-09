# Agent 8: Personal CRM Spec

Do not build yet. This is the design.

## Purpose

Track every money opportunity without losing follow-ups:

- local business leads;
- AIC RAISE contacts;
- senior referrals;
- PrintExpo contacts;
- internships;
- freelance leads;
- proposals;
- expected revenue.

## Core views

### 1. Today

- Follow-ups due today.
- Overdue follow-ups.
- Hot leads.
- Applications to verify.
- Expected revenue this month.

### 2. Leads

Fields:
- name;
- type: business, person, incubator, internship, platform;
- city;
- channel;
- priority;
- expected value;
- status;
- next follow-up;
- notes.

### 3. Opportunities

Fields:
- opportunity title;
- linked lead;
- category: freelance, internship, incubator, SaaS, event;
- value/stipend;
- deadline;
- match score;
- stage;
- next action.

### 4. Contacts

Fields:
- name;
- organization;
- role;
- contact path;
- relationship source;
- permission/comfort level;
- notes.

### 5. Proposals

Fields:
- client;
- offer;
- amount;
- sent date;
- status;
- follow-up date;
- scope;
- risks.

### 6. Revenue forecast

- expected value by month;
- weighted value by probability;
- won/lost count;
- source/channel performance.

## Status values

- idea;
- researched;
- warm path found;
- ready to approach;
- contacted manually by user;
- meeting scheduled;
- proposal drafted;
- proposal sent;
- won;
- lost;
- paused.

## Rules

- No automatic outreach.
- No storing private data that is not needed.
- Public contact path only until the user manually adds a real contact.
- Every lead must have a next action or be archived.
- Review Today view every morning.

## MVP screens

1. Dashboard.
2. Leads table.
3. Lead detail.
4. Opportunities table.
5. Follow-up calendar/list.
6. Proposal tracker.
7. Revenue forecast.

## Suggested first build

A Supabase-backed React app with dense tables, filters, quick add, CSV import/export, and PDF export for proposal summaries.
