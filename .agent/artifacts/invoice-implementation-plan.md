# Invoice Module — Implementation Plan

## Status Overview

| Item                            | Status  | Notes                                                                                    |
| ------------------------------- | ------- | ---------------------------------------------------------------------------------------- |
| Schema (Prisma)                 | ✅ Done | Invoice, InvoiceItem, InvoiceCounter, InvoiceActivity + all relations                    |
| Invoice Router (tRPC)           | ✅ Done | list, byId, createFromJob, update, addItem/updateItem/removeItem, updateStatus, markPaid |
| Email service                   | ⬜ TODO | sendInvoiceToClient, sendPaymentNotification                                             |
| Invoice PDF template            | ⬜ TODO | Professional PDF with jsPDF (matching proposal-pdf.ts style)                             |
| Invoice Status Badge            | ✅ Done | `invoice-status-badge.tsx` exists                                                        |
| Invoice List page + component   | ✅ Done | `invoice-list.tsx` + `(dashboard)/invoices/page.tsx`                                     |
| Invoice Detail page + component | ⬜ TODO | Full detail view with editable items, status actions, timeline                           |
| Send Invoice Dialog             | ⬜ TODO | Email-to-client dialog with preview                                                      |
| Public Invoice Share page       | ⬜ TODO | `/invoices/share/[token]/page.tsx` — client-facing invoice view                          |
| Sidebar + Dashboard integration | ⬜ TODO | KPI updates, invoice counts, revenue tracking                                            |
| Job Detail → Invoice link       | ✅ Done | Just added: "Create Invoice" on COMPLETED, "View Invoice" if exists                      |
| TypeScript verification         | ⬜ TODO | `tsc --noEmit` after all changes                                                         |

---

## Task Breakdown (in execution order)

### Task 1: Invoice Detail Component

**File:** `src/components/invoices/invoice-detail.tsx`  
**Depends on:** Invoice router (done)

Features:

- Header: Invoice number + status badge + action buttons
- Client info sidebar (name, email, phone, address)
- Related Job/Quote links
- **Editable line items table** (add, edit, remove items — only in DRAFT status)
- Totals section: subtotal, tax (11.5% IVU), total
- Notes section (editable in DRAFT)
- Activity timeline (similar to QuoteActivityTimeline)
- **Status action buttons:**
  - DRAFT → "Send Invoice" (→ SENT)
  - SENT → "Mark as Paid" (→ PAID), "Cancel" (→ CANCELLED)
  - VIEWED → "Mark as Paid" (→ PAID)
- Due date display with overdue warning

### Task 2: Invoice Detail Page

**File:** `src/app/(dashboard)/invoices/[id]/page.tsx`  
**Depends on:** Task 1

Simple server page that renders `<InvoiceDetail initialInvoice={{ id: params.id }} />`

### Task 3: Invoice PDF Template

**File:** `src/components/invoices/invoice-pdf.tsx`  
**Depends on:** None (standalone)

Professional PDF using jsPDF (consistent with proposal-pdf.ts):

- Company header (logo, name, license, phone)
- "FACTURA / INVOICE" title with invoice number
- Client info block
- Line items table: Description | Qty | Unit Price | Total
- Subtotal, IVU 11.5%, Grand Total
- Payment terms / due date
- Notes section
- Footer with company info

### Task 4: Email Service — Invoice Functions

**File:** `src/server/services/email.ts` (extend existing)  
**Depends on:** None

Add two functions to existing email service:

1. `sendInvoiceToClient(invoice, org)` — Sends HTML email with invoice summary + pay/view link
2. `sendPaymentNotification(invoice, org)` — Confirmation email when marked as paid

### Task 5: Send Invoice Dialog

**File:** `src/components/invoices/send-invoice-dialog.tsx`  
**Depends on:** Task 4

Dialog with:

- To: client email (pre-filled, editable)
- Subject: pre-filled "Factura {INV-XXX} — {Company Name}"
- Optional message textarea
- Preview of what will be sent
- Send button → calls updateStatus(SENT) + sends email

### Task 6: Invoice Router Updates

**File:** `src/server/routers/invoice.ts` (extend existing)  
**Depends on:** Task 4

Add:

- `sendToClient` mutation — updates status to SENT + sends email via Resend
- Consider: `createStandalone` mutation — create invoice without a job (select client + add items manually)

### Task 7: Public Invoice Share Page

**File:** `src/app/invoices/share/[token]/page.tsx`  
**Depends on:** Task 3

Public (no auth required) page:

- Look up invoice by `shareToken`
- Track `viewedAt` (update status to VIEWED if currently SENT)
- Show professional invoice view (read-only)
- Download PDF button
- "Pay" button placeholder (future payment integration)

Router addition needed:

- `invoice.byShareToken` — public query (no auth) to fetch invoice by token

### Task 8: Sidebar + Dashboard Integration

**Files:**

- `src/components/layout/sidebar.tsx` — verify invoice link is present
- `src/components/dashboard/dashboard-content.tsx` — add invoice KPIs

Dashboard additions:

- Total outstanding invoices (SENT + VIEWED + OVERDUE)
- Total revenue collected (PAID sum)
- Overdue invoices count/alert in "Needs Attention" widget

### Task 9: Create Invoice Standalone (from Invoices page)

**File:** `src/components/invoices/create-invoice-dialog.tsx`  
**Depends on:** Task 6

Dialog to create an invoice without a job:

- Client picker
- Add line items manually
- Set due date, tax rate, notes
- Creates DRAFT invoice

Update invoices page to include "Create Invoice" button.

### Task 10: TypeScript Verification

Run `pnpm type-check` or `npx tsc --noEmit` to catch any type errors across all changes.

---

## Execution Priority

**Critical path (must-have):**
Tasks 1 → 2 → 3 → 5 → 10

**Important (should-have):**
Tasks 4 → 6 → 7 → 8

**Nice-to-have:**
Task 9

---

## Technical Notes

- **PDF approach:** Use jsPDF (already in deps) for consistency with `proposal-pdf.ts`
- **Email:** Resend is already configured (`src/server/services/email.ts`)
- **Public pages:** Follow same pattern as `src/app/quotes/share/[token]/page.tsx`
- **Status transitions:** DRAFT → SENT → VIEWED → PAID (or CANCELLED from any state)
- **Currency:** USD, Puerto Rico context (IVU 11.5%)
