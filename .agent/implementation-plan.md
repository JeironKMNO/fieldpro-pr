# FieldPro PR - Plan de Implementación: 3 Fases de Prioridad Alta

## Fase 1: Fix Audio Duplication + Polish AI Assistant

**Estado:** El fix de `sentRef` / `stoppedRef` ya está implementado. Revisar edge cases restantes.

### Tareas:

- [x] Implementar guards `sentRef` y `stoppedRef` en voice-recorder.tsx
- [ ] Agregar debounce adicional en `handleVoiceTranscription` para evitar doble envío
- [ ] Agregar flag `isSending` para bloquear envíos concurrentes en sendMessage

---

## Fase 2: Jobs Module - Completar CRUD (~60% → 95%)

**Estado actual:** Tiene list, detail, create, update, updateStatus en router. UI: JobList + JobDetail + StatusBadge.

### Lo que falta:

- [ ] **Botón "Create Job"** en el header de la página de Jobs (crear job manualmente)
- [ ] **Create Job Dialog/Form** con campos: client, title, scheduled date, notes
- [ ] **Botón "Create Job" desde Quote** cuando se acepta una cotización
- [ ] **Create Invoice from Job** - Botón en job detail cuando status = COMPLETED
- [ ] **Progress tracking** adicional en job detail (estimado vs actual)
- [ ] **Botón "Schedule"** con date picker para fecha programada

---

## Fase 3: Invoices Module - Completar (~40% → 90%)

**Estado actual:** Tiene list, byId, createFromJob, addItem, updateItem, removeItem, updateStatus, markPaid en router. UI: Solo InvoiceList + StatusBadge.

### Lo que falta:

- [ ] **InvoiceDetail component** - Vista detallada de factura con items editables
- [ ] **InvoicePDF component** - Generación de PDF profesional de factura
- [ ] **Send Invoice by Email** - Integración con Resend (ya existe email service)
- [ ] **Mark as Paid** - Botón en invoice detail
- [ ] **Create Invoice standalone** - Sin necesidad de un Job
- [ ] **Invoice activity timeline** - Similar a QuoteActivityTimeline
