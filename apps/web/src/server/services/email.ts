import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "FieldPro <noreply@fieldpro.app>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Brand Colors
const COLORS = {
  primary: "#d4af37", // Gold
  primaryDark: "#b8962e",
  secondary: "#1e293b", // Slate 800
  accent: "#f97316", // Orange 500
  success: "#22c55e", // Green
  warning: "#f59e0b", // Amber
  error: "#ef4444", // Red
  gray: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  },
};

function quoteUrl(quoteId: string): string {
  return `${APP_URL}/quotes/${quoteId}`;
}

// Base email template with professional styling
function baseEmailTemplate(content: string, orgName?: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FieldPro</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: ${COLORS.gray[50]};">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; border-bottom: 3px solid ${COLORS.primary};">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: ${COLORS.gray[900]}; letter-spacing: -0.5px;">
                      Field<span style="color: ${COLORS.primary};">Pro</span>
                    </h1>
                    <p style="margin: 4px 0 0; font-size: 12px; color: ${COLORS.gray[500]}; text-transform: uppercase; letter-spacing: 1px;">
                      Gestión Profesional de Proyectos
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: ${COLORS.gray[50]}; border-radius: 0 0 12px 12px; border-top: 1px solid ${COLORS.gray[200]};">
              <p style="margin: 0 0 8px; font-size: 13px; color: ${COLORS.gray[500]}; text-align: center;">
                ${orgName ? `Este email fue enviado por <strong>${orgName}</strong> a través de ` : "Enviado por "}
                <a href="${APP_URL}" style="color: ${COLORS.primary}; text-decoration: none;">FieldPro</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: ${COLORS.gray[400]}; text-align: center;">
                Si no esperabas este email, puedes ignorarlo de forma segura.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/* ─────────────────────────────────────────────
   QUOTE EMAILS
   ───────────────────────────────────────────── */

export async function sendQuoteToClient(
  to: string,
  clientName: string,
  quoteNumber: string,
  orgName: string,
  total: string,
  shareUrl: string,
  message?: string
) {
  if (!process.env.RESEND_API_KEY) return;

  const content = `
    <p style="margin: 0 0 16px; font-size: 16px; color: ${COLORS.gray[700]};">Hola <strong>${clientName}</strong>,</p>
    
    ${
      message
        ? `<p style="margin: 0 0 24px; font-size: 15px; color: ${COLORS.gray[600]}; line-height: 1.6;">${message}</p>`
        : `<p style="margin: 0 0 24px; font-size: 15px; color: ${COLORS.gray[600]}; line-height: 1.6;">
         Adjunto encontrarás tu cotización <strong style="color: ${COLORS.gray[800]};">${quoteNumber}</strong> 
         por un total de <strong style="color: ${COLORS.primaryDark}; font-size: 18px;">${total}</strong>.
         Revisa los detalles y acepta o rechaza la propuesta directamente desde el enlace.
       </p>`
    }
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0; background-color: ${COLORS.gray[50]}; border-radius: 8px; border-left: 4px solid ${COLORS.primary};">
      <tr>
        <td style="padding: 20px;">
          <p style="margin: 0 0 8px; font-size: 12px; color: ${COLORS.gray[500]}; text-transform: uppercase; letter-spacing: 0.5px;">Resumen de Cotización</p>
          <p style="margin: 0 0 4px; font-size: 18px; font-weight: 700; color: ${COLORS.gray[800]};">${total}</p>
          <p style="margin: 0; font-size: 13px; color: ${COLORS.gray[500]};">${quoteNumber}</p>
        </td>
      </tr>
    </table>
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 32px 0;">
      <tr>
        <td align="center">
          <a href="${shareUrl}" 
             style="display: inline-block; background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%); 
                    color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;
                    box-shadow: 0 4px 14px rgba(212, 175, 55, 0.3);">
            Ver Cotización Completa
          </a>
        </td>
      </tr>
    </table>
    
    <p style="margin: 24px 0 0; font-size: 13px; color: ${COLORS.gray[500]}; text-align: center;">
      O copia y pega este enlace en tu navegador:<br>
      <span style="color: ${COLORS.gray[400]}; word-break: break-all;">${shareUrl}</span>
    </p>
  `;

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Cotización ${quoteNumber} de ${orgName}`,
    html: baseEmailTemplate(content, orgName),
  });
}

export async function sendQuoteViewedNotification(
  to: string,
  quoteNumber: string,
  clientName: string,
  quoteId: string
) {
  if (!process.env.RESEND_API_KEY) return;

  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 64px; height: 64px; background-color: ${COLORS.primary}15; border-radius: 50%; text-align: center; line-height: 64px; font-size: 28px;">
        👁️
      </div>
    </div>
    
    <h2 style="margin: 0 0 16px; font-size: 22px; font-weight: 600; color: ${COLORS.gray[800]}; text-align: center;">
      Tu cotización fue vista
    </h2>
    
    <p style="margin: 0 0 24px; font-size: 15px; color: ${COLORS.gray[600]}; text-align: center; line-height: 1.6;">
      <strong style="color: ${COLORS.gray[800]};">${clientName}</strong> acaba de ver tu cotización 
      <strong style="color: ${COLORS.primaryDark};">${quoteNumber}</strong>.
    </p>
    
    <div style="background-color: ${COLORS.gray[50]}; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
      <p style="margin: 0 0 12px; font-size: 14px; color: ${COLORS.gray[600]};">
        💡 <strong>Consejo:</strong> Este es un buen momento para hacer follow-up si no recibes respuesta pronto.
      </p>
    </div>
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 32px 0;">
      <tr>
        <td align="center">
          <a href="${quoteUrl(quoteId)}" 
             style="display: inline-block; background-color: ${COLORS.gray[800]}; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 14px;">
            Ver Cotización
          </a>
        </td>
      </tr>
    </table>
  `;

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${clientName} vio tu cotización ${quoteNumber}`,
    html: baseEmailTemplate(content),
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
  const color = isAccepted ? COLORS.success : COLORS.error;
  const bgColor = isAccepted ? "#f0fdf4" : "#fef2f2";

  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 80px; height: 80px; background-color: ${bgColor}; border-radius: 50%; text-align: center; line-height: 80px; font-size: 36px;">
        ${emoji}
      </div>
    </div>
    
    <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: ${COLORS.gray[800]}; text-align: center;">
      Cotización ${action}
    </h2>
    
    <div style="background-color: ${bgColor}; border-left: 4px solid ${color}; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0; font-size: 16px; color: ${color}; font-weight: 600; text-align: center;">
        ${clientName} ${action} la cotización ${quoteNumber}
      </p>
    </div>
    
    <p style="margin: 24px 0; font-size: 15px; color: ${COLORS.gray[600]}; text-align: center; line-height: 1.6;">
      ${
        isAccepted
          ? "¡Excelente noticia! Tu cliente aceptó la propuesta. Es momento de programar el trabajo y convertir esta cotización en un proyecto."
          : "Tu cliente decidió no proceder con esta cotización. Considera hacer un follow-up para entender sus razones y explorar alternativas."
      }
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 32px 0;">
      <tr>
        <td align="center">
          <a href="${quoteUrl(quoteId)}" 
             style="display: inline-block; background: ${
               isAccepted
                 ? `linear-gradient(135deg, ${COLORS.success} 0%, #16a34a 100%)`
                 : `linear-gradient(135deg, ${COLORS.gray[600]} 0%, ${COLORS.gray[700]} 100%)`
             }; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
            ${isAccepted ? "Gestionar Trabajo →" : "Ver Detalles"}
          </a>
        </td>
      </tr>
    </table>
  `;

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${emoji} ${clientName} ${action} tu cotización ${quoteNumber}`,
    html: baseEmailTemplate(content),
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

  const content = `
    <p style="margin: 0 0 16px; font-size: 16px; color: ${COLORS.gray[700]};">Hola <strong>${clientName}</strong>,</p>
    
    <p style="margin: 0 0 24px; font-size: 15px; color: ${COLORS.gray[600]}; line-height: 1.6;">
      Te escribimos de parte de <strong>${orgName}</strong> para recordarte que tienes una cotización pendiente de revisión.
      Nos encantaría saber si estás interesado en proceder con el proyecto.
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0; background-color: ${COLORS.warning}10; border-radius: 8px; border: 1px solid ${COLORS.warning}30;">
      <tr>
        <td style="padding: 20px; text-align: center;">
          <p style="margin: 0 0 8px; font-size: 13px; color: ${COLORS.warning}; font-weight: 600;">⏰ COTIZACIÓN PENDIENTE</p>
          <p style="margin: 0; font-size: 16px; color: ${COLORS.gray[800]}; font-weight: 600;">${quoteNumber}</p>
        </td>
      </tr>
    </table>
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 32px 0;">
      <tr>
        <td align="center">
          <a href="${shareUrl}" 
             style="display: inline-block; background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%); 
                    color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;
                    box-shadow: 0 4px 14px rgba(212, 175, 55, 0.3);">
            Revisar Cotización
          </a>
        </td>
      </tr>
    </table>
    
    <p style="margin: 24px 0 0; font-size: 13px; color: ${COLORS.gray[500]}; text-align: center;">
      ¿Tienes preguntas? Responde a este email y te ayudaremos con gusto.
    </p>
  `;

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Recordatorio: Tu cotización ${quoteNumber} de ${orgName}`,
    html: baseEmailTemplate(content, orgName),
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

  const isUrgent = daysLeft <= 3;
  const color = isUrgent ? COLORS.error : COLORS.warning;
  const bgColor = isUrgent ? "#fef2f2" : "#fffbeb";

  const content = `
    <p style="margin: 0 0 16px; font-size: 16px; color: ${COLORS.gray[700]};">Hola <strong>${clientName}</strong>,</p>
    
    <div style="background-color: ${bgColor}; border: 1px solid ${color}40; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 24px;">⚠️</span>
        <div>
          <p style="margin: 0 0 4px; font-size: 14px; color: ${color}; font-weight: 600;">
            TU COTIZACIÓN EXPIRA PRONTO
          </p>
          <p style="margin: 0; font-size: 18px; color: ${COLORS.gray[800]}; font-weight: 700;">
            ${daysLeft} día${daysLeft !== 1 ? "s" : ""} restante${daysLeft !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>
    
    <p style="margin: 0 0 24px; font-size: 15px; color: ${COLORS.gray[600]}; line-height: 1.6;">
      Tu cotización <strong>${quoteNumber}</strong> de <strong>${orgName}</strong> está por expirar. 
      Después de la fecha de vencimiento, necesitarás solicitar una actualización de precios.
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 32px 0;">
      <tr>
        <td align="center">
          <a href="${shareUrl}" 
             style="display: inline-block; background: ${
               isUrgent
                 ? `linear-gradient(135deg, ${COLORS.error} 0%, #dc2626 100%)`
                 : `linear-gradient(135deg, ${COLORS.warning} 0%, #d97706 100%)`
             }; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
            ${isUrgent ? "Responder Urgentemente →" : "Revisar Cotización"}
          </a>
        </td>
      </tr>
    </table>
  `;

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `⚠️ Tu cotización ${quoteNumber} expira en ${daysLeft} día${daysLeft !== 1 ? "s" : ""}`,
    html: baseEmailTemplate(content, orgName),
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

  const content = `
    <p style="margin: 0 0 16px; font-size: 16px; color: ${COLORS.gray[700]};">Hola <strong>${clientName}</strong>,</p>
    
    ${
      message
        ? `<p style="margin: 0 0 24px; font-size: 15px; color: ${COLORS.gray[600]}; line-height: 1.6;">${message}</p>`
        : `<p style="margin: 0 0 24px; font-size: 15px; color: ${COLORS.gray[600]}; line-height: 1.6;">
         Adjunto encontrarás tu factura <strong style="color: ${COLORS.gray[800]};">${invoiceNumber}</strong>.
         Agradecemos tu pronta atención al pago.
       </p>`
    }
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 8px; border-left: 4px solid ${COLORS.success};">
      <tr>
        <td style="padding: 24px;">
          <p style="margin: 0 0 12px; font-size: 12px; color: ${COLORS.gray[500]}; text-transform: uppercase; letter-spacing: 0.5px;">Resumen de Factura</p>
          <p style="margin: 0 0 8px; font-size: 28px; font-weight: 700; color: ${COLORS.success};">${total}</p>
          <p style="margin: 0; font-size: 14px; color: ${COLORS.gray[600]};">
            <span style="color: ${COLORS.gray[400]};">Vence:</span> <strong>${dueDate}</strong>
          </p>
          <p style="margin: 8px 0 0; font-size: 13px; color: ${COLORS.gray[500]};">${invoiceNumber}</p>
        </td>
      </tr>
    </table>
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 32px 0;">
      <tr>
        <td align="center">
          <a href="${shareUrl}" 
             style="display: inline-block; background: linear-gradient(135deg, ${COLORS.success} 0%, #16a34a 100%); 
                    color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;
                    box-shadow: 0 4px 14px rgba(34, 197, 94, 0.3);">
            Ver Factura y Pagar
          </a>
        </td>
      </tr>
    </table>
    
    <p style="margin: 24px 0 0; font-size: 13px; color: ${COLORS.gray[500]}; text-align: center;">
      O copia y pega este enlace en tu navegador:<br>
      <span style="color: ${COLORS.gray[400]}; word-break: break-all;">${shareUrl}</span>
    </p>
  `;

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Factura ${invoiceNumber} de ${orgName}`,
    html: baseEmailTemplate(content, orgName),
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

  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 50%; text-align: center; line-height: 80px; font-size: 36px;">
        ✓
      </div>
    </div>
    
    <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: ${COLORS.gray[800]}; text-align: center;">
      ¡Pago Recibido!
    </h2>
    
    <p style="margin: 0 0 24px; font-size: 15px; color: ${COLORS.gray[600]}; text-align: center; line-height: 1.6;">
      Hola <strong>${clientName}</strong>, hemos recibido tu pago exitosamente.
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 8px; border: 2px solid ${COLORS.success}40;">
      <tr>
        <td style="padding: 32px; text-align: center;">
          <p style="margin: 0 0 8px; font-size: 14px; color: ${COLORS.success}; font-weight: 600;">PAGO CONFIRMADO</p>
          <p style="margin: 0; font-size: 32px; font-weight: 700; color: ${COLORS.success};">${total}</p>
          <p style="margin: 12px 0 0; font-size: 14px; color: ${COLORS.gray[500]};">Factura ${invoiceNumber}</p>
        </td>
      </tr>
    </table>
    
    <p style="margin: 24px 0; font-size: 15px; color: ${COLORS.gray[600]}; text-align: center; line-height: 1.6;">
      ¡Gracias por tu pago! Tu factura ha sido marcada como <strong style="color: ${COLORS.success};">PAGADA</strong>.<br>
      Ha sido un placer trabajar contigo.
    </p>
    
    <p style="margin: 32px 0 0; font-size: 13px; color: ${COLORS.gray[500]}; text-align: center;">
      Si tienes alguna pregunta, no dudes en contactarnos.
    </p>
  `;

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `✅ Pago recibido — Factura ${invoiceNumber}`,
    html: baseEmailTemplate(content, orgName),
  });
}

export async function sendInvoiceOverdueReminder(
  to: string,
  clientName: string,
  invoiceNumber: string,
  orgName: string,
  total: string,
  shareUrl: string,
  daysOverdue: number
) {
  if (!process.env.RESEND_API_KEY) return;

  const content = `
    <p style="margin: 0 0 16px; font-size: 16px; color: ${COLORS.gray[700]};">Hola <strong>${clientName}</strong>,</p>
    
    <div style="background-color: #fef2f2; border: 1px solid ${COLORS.error}40; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <p style="margin: 0 0 8px; font-size: 14px; color: ${COLORS.error}; font-weight: 600;">
        ⚠️ FACTURA VENCIDA
      </p>
      <p style="margin: 0; font-size: 16px; color: ${COLORS.gray[800]};">
        Tu factura lleva <strong>${daysOverdue} día${daysOverdue !== 1 ? "s" : ""}</strong> vencida
      </p>
    </div>
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0; background-color: ${COLORS.gray[50]}; border-radius: 8px;">
      <tr>
        <td style="padding: 20px;">
          <p style="margin: 0 0 8px; font-size: 12px; color: ${COLORS.gray[500]};">MONTO PENDIENTE</p>
          <p style="margin: 0; font-size: 24px; font-weight: 700; color: ${COLORS.error};">${total}</p>
          <p style="margin: 8px 0 0; font-size: 13px; color: ${COLORS.gray[500]};">${invoiceNumber}</p>
        </td>
      </tr>
    </table>
    
    <p style="margin: 0 0 24px; font-size: 15px; color: ${COLORS.gray[600]}; line-height: 1.6;">
      Por favor, realiza el pago lo antes posible para evitar cargos adicionales por mora.
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 32px 0;">
      <tr>
        <td align="center">
          <a href="${shareUrl}" 
             style="display: inline-block; background: linear-gradient(135deg, ${COLORS.error} 0%, #dc2626 100%); 
                    color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
            Pagar Ahora
          </a>
        </td>
      </tr>
    </table>
  `;

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `⚠️ Factura vencida — ${invoiceNumber} (${daysOverdue} día${daysOverdue !== 1 ? "s" : ""})`,
    html: baseEmailTemplate(content, orgName),
  });
}
