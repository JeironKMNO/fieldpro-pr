import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "FieldPro <noreply@fieldpro.app>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function quoteUrl(quoteId: string): string {
  return `${APP_URL}/quotes/${quoteId}`;
}

export async function sendQuoteViewedNotification(
  to: string,
  quoteNumber: string,
  clientName: string,
  quoteId: string
) {
  if (!process.env.RESEND_API_KEY) return;

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${clientName} vio tu cotización ${quoteNumber}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">FieldPro</h2>
        <p><strong>${clientName}</strong> acaba de ver tu cotización <strong>${quoteNumber}</strong>.</p>
        <p>Este es un buen momento para hacer follow-up si no recibes respuesta pronto.</p>
        <a href="${quoteUrl(quoteId)}" style="display: inline-block; background: #7c3aed; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; margin-top: 12px;">
          Ver Cotización
        </a>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
          Este email fue enviado por FieldPro. Si no esperabas este email, puedes ignorarlo.
        </p>
      </div>
    `,
  });
}

export async function sendQuoteResponseNotification(
  to: string,
  quoteNumber: string,
  clientName: string,
  response: "ACCEPTED" | "REJECTED",
  quoteId: string
) {
  if (!process.env.RESEND_API_KEY) return;

  const isAccepted = response === "ACCEPTED";
  const emoji = isAccepted ? "✅" : "❌";
  const action = isAccepted ? "aceptó" : "rechazó";
  const color = isAccepted ? "#16a34a" : "#dc2626";

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${emoji} ${clientName} ${action} tu cotización ${quoteNumber}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">FieldPro</h2>
        <div style="background: ${color}15; border-left: 4px solid ${color}; padding: 12px 16px; border-radius: 4px;">
          <p style="margin: 0; color: ${color}; font-weight: 600;">
            ${emoji} ${clientName} ${action} la cotización ${quoteNumber}
          </p>
        </div>
        ${isAccepted ? "<p>¡Felicidades! Tu cliente aceptó la cotización. Es hora de programar el trabajo.</p>" : "<p>Tu cliente rechazó la cotización. Considera hacer un follow-up para entender sus razones.</p>"}
        <a href="${quoteUrl(quoteId)}" style="display: inline-block; background: #7c3aed; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; margin-top: 12px;">
          Ver Cotización
        </a>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
          Este email fue enviado por FieldPro.
        </p>
      </div>
    `,
  });
}

export async function sendFollowUpToClient(
  to: string,
  clientName: string,
  quoteNumber: string,
  orgName: string,
  shareUrl: string
) {
  if (!process.env.RESEND_API_KEY) return;

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Recordatorio: Tu cotización ${quoteNumber} de ${orgName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">${orgName}</h2>
        <p>Hola ${clientName},</p>
        <p>Te recordamos que tienes una cotización pendiente de revisión. Nos encantaría saber si estás interesado en proceder.</p>
        <a href="${shareUrl}" style="display: inline-block; background: #7c3aed; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; margin-top: 12px;">
          Ver Cotización
        </a>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
          Cotización ${quoteNumber} de ${orgName}.
        </p>
      </div>
    `,
  });
}

export async function sendExpiryReminderToClient(
  to: string,
  clientName: string,
  quoteNumber: string,
  orgName: string,
  shareUrl: string,
  daysLeft: number
) {
  if (!process.env.RESEND_API_KEY) return;

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `⚠️ Tu cotización ${quoteNumber} expira en ${daysLeft} día${daysLeft !== 1 ? "s" : ""}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">${orgName}</h2>
        <p>Hola ${clientName},</p>
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px;">
          <p style="margin: 0; color: #8b6d0c; font-weight: 600;">
            Tu cotización expira en ${daysLeft} día${daysLeft !== 1 ? "s" : ""}
          </p>
        </div>
        <p>Revisa tu cotización antes de que expire. Después de la fecha de vencimiento, necesitarás solicitar una nueva.</p>
        <a href="${shareUrl}" style="display: inline-block; background: #7c3aed; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; margin-top: 12px;">
          Ver Cotización
        </a>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
          Cotización ${quoteNumber} de ${orgName}.
        </p>
      </div>
    `,
  });
}

/* ─────────────────────────────────────────────
   INVOICE EMAILS
   ───────────────────────────────────────────── */

export async function sendInvoiceToClient(
  to: string,
  clientName: string,
  invoiceNumber: string,
  orgName: string,
  total: string,
  dueDate: string,
  shareUrl: string,
  message?: string
) {
  if (!process.env.RESEND_API_KEY) return;

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Factura ${invoiceNumber} de ${orgName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">${orgName}</h2>
        <p>Hola ${clientName},</p>
        ${message ? `<p>${message}</p>` : `<p>Adjunto encontrarás tu factura <strong>${invoiceNumber}</strong> por un total de <strong>${total}</strong>.</p>`}
        <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px 16px; border-radius: 4px; margin: 16px 0;">
          <p style="margin: 0 0 4px 0; font-weight: 600; color: #15803d;">Resumen de Factura</p>
          <p style="margin: 0; color: #166534;">Total: ${total}</p>
          <p style="margin: 0; color: #166534;">Fecha de vencimiento: ${dueDate}</p>
        </div>
        <a href="${shareUrl}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
          Ver Factura
        </a>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
          Factura ${invoiceNumber} de ${orgName}. Si tienes preguntas, contacta a ${orgName}.
        </p>
      </div>
    `,
  });
}

export async function sendPaymentConfirmation(
  to: string,
  clientName: string,
  invoiceNumber: string,
  orgName: string,
  total: string
) {
  if (!process.env.RESEND_API_KEY) return;

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `✅ Pago recibido — Factura ${invoiceNumber}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">${orgName}</h2>
        <p>Hola ${clientName},</p>
        <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px 16px; border-radius: 4px;">
          <p style="margin: 0; color: #15803d; font-weight: 600;">
            ✅ Hemos recibido tu pago de ${total} para la factura ${invoiceNumber}.
          </p>
        </div>
        <p>¡Gracias por tu pago! Tu factura ha sido marcada como pagada.</p>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
          Este email fue enviado por FieldPro en nombre de ${orgName}.
        </p>
      </div>
    `,
  });
}

