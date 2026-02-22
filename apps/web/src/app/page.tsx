import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import {
  FileText, Briefcase, Users, Receipt, ArrowRight,
  Sparkles, ShoppingCart, CheckCircle, Star, MapPin, ChevronRight,
} from "lucide-react";

/* ── Shared design tokens (mirror del sidebar/app) ─────────── */
const T = {
  teal:       "#289186",
  tealDark:   "#1d6b63",
  tealLight:  "#3ab5a9",
  coral:      "#E8603C",
  stone:      "#FAF8F4",
  text:       "#1A1F2E",
  textMuted:  "#6B7280",
  textFaint:  "#9CA3AF",
  border:     "#E8E4DC",
  df: "var(--font-display,'Playfair Display',Georgia,serif)",
  bf: "var(--font-body,'Space Grotesk',system-ui,sans-serif)",
};

/* ── House / logo mark (same as sidebar) ───────────────────── */
function LogoMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 20h20M4 20V10l8-6 8 6v10" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

const FEATURES = [
  { icon: Sparkles,     title: "IA para Cotizaciones",  desc: "Genera cotizaciones profesionales en segundos. Describe el proyecto por voz, texto o fotos y la IA hace el resto.", color: "teal"  },
  { icon: FileText,     title: "PDFs Profesionales",     desc: "Propuestas y cotizaciones con tu logo y marca. Compártelas directamente con el cliente desde la plataforma.",     color: "coral" },
  { icon: Briefcase,    title: "Gestión de Trabajos",    desc: "Convierte cotizaciones en trabajos activos. Asigna tareas, rastrea progreso y maneja change orders fácilmente.",  color: "teal"  },
  { icon: Receipt,      title: "Facturación Rápida",     desc: "Genera facturas desde los trabajos completados. Rastrea pagos y vencimientos en tiempo real.",                     color: "coral" },
  { icon: ShoppingCart, title: "Lista de Materiales",    desc: "Precios de Home Depot PR actualizados al momento. La IA calcula cantidades directo desde la cotización.",          color: "teal"  },
  { icon: Users,        title: "CRM de Clientes",        desc: "Gestiona residenciales y comerciales. Notas, etiquetas, historial de proyectos y contactos en un solo lugar.",     color: "coral" },
];

const BENEFITS = [
  "Diseñado para Puerto Rico",
  "Precios reales de Home Depot PR",
  "Sin contratos ni tarjeta de crédito",
  "Multi-empresa con roles y permisos",
  "Disponible en celular y escritorio",
  "Interfaz y soporte en español",
];

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div style={{ minHeight: "100vh", fontFamily: T.bf, backgroundColor: T.stone,
      backgroundImage: `radial-gradient(ellipse 60% 40% at 5% 10%,rgba(40,145,134,.05) 0%,transparent 70%),radial-gradient(ellipse 50% 40% at 95% 90%,rgba(232,96,60,.04) 0%,transparent 70%)` }}>

      {/* ━━ Navigation ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 40px",
        background: "rgba(250,248,244,.90)",
        backdropFilter: "blur(18px) saturate(180%)",
        WebkitBackdropFilter: "blur(18px) saturate(180%)",
        borderBottom: `1px solid rgba(232,228,220,.7)` }}>

        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
            width: 36, height: 36, borderRadius: 10,
            background: `linear-gradient(135deg,${T.tealLight},${T.teal},${T.tealDark})`,
            color: "#fff", boxShadow: `0 2px 10px rgba(40,145,134,.30)` }}>
            <LogoMark size={18} />
          </div>
          <span style={{ fontFamily: T.df, fontSize: 20, fontWeight: 700,
            color: T.text, letterSpacing: "-0.02em" }}>
            Field<span style={{ color: T.teal }}>PR</span>o
          </span>
        </div>

        {/* Auth */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
            <button style={{ fontSize: 14, fontWeight: 500, color: "#4B5563",
              padding: "8px 16px", borderRadius: 8, background: "transparent",
              border: "none", cursor: "pointer" }}>
              Iniciar Sesión
            </button>
          </SignInButton>
          <SignUpButton mode="redirect" forceRedirectUrl="/dashboard">
            <button style={{ display: "flex", alignItems: "center", gap: 6,
              fontSize: 14, fontWeight: 600, color: "#fff",
              padding: "9px 20px", borderRadius: 10,
              background: `linear-gradient(135deg,${T.tealLight},${T.teal},${T.tealDark})`,
              border: "none", cursor: "pointer",
              boxShadow: "0 2px 12px rgba(40,145,134,.28)" }}>
              Comenzar Gratis
              <ArrowRight style={{ width: 14, height: 14 }} />
            </button>
          </SignUpButton>
        </div>
      </nav>

      {/* ━━ Hero ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ position: "relative", overflow: "hidden", padding: "80px 24px 96px" }}>
        {/* Blueprint grid */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `linear-gradient(rgba(40,145,134,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(40,145,134,.035) 1px,transparent 1px)`,
          backgroundSize: "28px 28px" }} />

        <div style={{ position: "relative", maxWidth: 840, margin: "0 auto", textAlign: "center" }}>
          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7,
            padding: "6px 16px", borderRadius: 999,
            background: "rgba(40,145,134,.08)",
            border: `1px solid rgba(40,145,134,.22)`,
            color: T.teal, fontSize: 12, fontWeight: 600, marginBottom: 28 }}>
            <Star style={{ width: 12, height: 12 }} />
            Diseñado exclusivamente para contratistas en Puerto Rico
          </div>

          {/* Headline */}
          <h1 style={{ fontFamily: T.df,
            fontSize: "clamp(40px,6vw,72px)",
            fontWeight: 700, lineHeight: 1.07,
            letterSpacing: "-0.025em", color: T.text, marginBottom: 22 }}>
            Gestiona tu negocio<br />
            <em style={{ color: T.teal, fontStyle: "italic" }}>como un profesional.</em>
          </h1>

          <p style={{ fontSize: 18, lineHeight: 1.7, color: T.textMuted,
            maxWidth: 540, margin: "0 auto 40px" }}>
            Cotizaciones con IA, seguimiento de trabajos, facturas y lista de materiales
            — todo en una plataforma construida para PR.
          </p>

          {/* CTA buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center",
            justifyContent: "center", gap: 14 }}>
            <SignUpButton mode="redirect" forceRedirectUrl="/dashboard">
              <button style={{ display: "flex", alignItems: "center", gap: 8,
                padding: "14px 32px", borderRadius: 14,
                background: `linear-gradient(135deg,${T.tealLight},${T.teal},${T.tealDark})`,
                color: "#fff", fontSize: 16, fontWeight: 600,
                border: "none", cursor: "pointer",
                boxShadow: "0 4px 24px rgba(40,145,134,.32)" }}>
                Empezar Gratis
                <ArrowRight style={{ width: 16, height: 16 }} />
              </button>
            </SignUpButton>
            <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
              <button style={{ display: "flex", alignItems: "center", gap: 8,
                padding: "14px 32px", borderRadius: 14,
                border: `1.5px solid ${T.border}`,
                background: "rgba(255,255,255,.75)",
                color: "#374151", fontSize: 16, fontWeight: 500, cursor: "pointer" }}>
                Ya tengo cuenta
                <ChevronRight style={{ width: 16, height: 16 }} />
              </button>
            </SignInButton>
          </div>

          <p style={{ marginTop: 22, fontSize: 13, color: T.textFaint }}>
            Sin tarjeta de crédito · Configuración en 5 minutos · Cancela cuando quieras
          </p>
        </div>
      </section>

      {/* ━━ Stats strip ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div style={{ borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`,
        background: "rgba(255,255,255,.55)", padding: "28px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "24px 32px",
          textAlign: "center" }}>
          {[
            { v: "IA Generativa",  l: "Cotizaciones inteligentes" },
            { v: "PDFs",           l: "Propuestas profesionales" },
            { v: "Home Depot PR",  l: "Precios en tiempo real" },
            { v: "100% Español",   l: "Plataforma nativa" },
          ].map(({ v, l }) => (
            <div key={l}>
              <div style={{ fontFamily: T.df, fontSize: 20, fontWeight: 700,
                color: T.teal, marginBottom: 4 }}>{v}</div>
              <div style={{ fontSize: 12, color: T.textFaint, fontWeight: 500 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ━━ Features ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ padding: "96px 24px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em",
              textTransform: "uppercase", color: T.teal, marginBottom: 12 }}>
              Todo en uno
            </p>
            <h2 style={{ fontFamily: T.df, fontSize: "clamp(28px,4vw,44px)",
              fontWeight: 700, color: T.text, letterSpacing: "-0.02em" }}>
              Cada herramienta que necesitas
            </h2>
          </div>

          <div style={{ display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 18 }}>
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} style={{ background: "#fff",
                border: `1px solid ${T.border}`, borderRadius: 20,
                padding: "26px 26px 22px",
                boxShadow: "0 1px 8px rgba(26,31,46,.04)",
                transition: "box-shadow .25s ease, transform .25s ease" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 14,
                  background: color === "teal" ? "rgba(40,145,134,.10)" : "rgba(232,96,60,.10)",
                  color: color === "teal" ? T.teal : T.coral }}>
                  <Icon style={{ width: 20, height: 20 }} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 8 }}>
                  {title}
                </h3>
                <p style={{ fontSize: 14, lineHeight: 1.65, color: T.textMuted }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ Benefits CTA strip ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{
        background: `linear-gradient(135deg,${T.tealDark} 0%,${T.teal} 50%,${T.tealLight} 100%)`,
        padding: "72px 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: T.df, fontSize: "clamp(26px,3.5vw,40px)",
            fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", marginBottom: 40 }}>
            Creado para el mercado de PR
          </h2>

          <div style={{ display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))",
            gap: 14, marginBottom: 48, textAlign: "left" }}>
            {BENEFITS.map((b) => (
              <div key={b} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <CheckCircle style={{ width: 16, height: 16,
                  color: "rgba(255,255,255,.7)", flexShrink: 0 }} />
                <span style={{ fontSize: 14, fontWeight: 500,
                  color: "rgba(255,255,255,.88)" }}>{b}</span>
              </div>
            ))}
          </div>

          <SignUpButton mode="redirect" forceRedirectUrl="/dashboard">
            <button style={{ padding: "15px 40px", borderRadius: 14,
              background: "#fff", color: T.teal,
              fontSize: 16, fontWeight: 700, fontFamily: T.df,
              border: "none", cursor: "pointer",
              boxShadow: "0 4px 24px rgba(0,0,0,.14)" }}>
              Crea tu cuenta gratis →
            </button>
          </SignUpButton>
        </div>
      </section>

      {/* ━━ Footer ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer style={{ borderTop: `1px solid ${T.border}`,
        background: "rgba(255,255,255,.5)", padding: "28px 40px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto",
          display: "flex", flexWrap: "wrap", alignItems: "center",
          justifyContent: "space-between", gap: 16 }}>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
              width: 30, height: 30, borderRadius: 8,
              background: T.teal, color: "#fff" }}>
              <LogoMark size={15} />
            </div>
            <span style={{ fontFamily: T.df, fontSize: 16,
              fontWeight: 700, color: T.text }}>FieldPRo</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6,
            fontSize: 13, color: T.textFaint }}>
            <MapPin style={{ width: 14, height: 14 }} />
            Hecho en Puerto Rico 🇵🇷
          </div>

          <p style={{ fontSize: 12, color: T.textFaint }}>
            © {new Date().getFullYear()} FieldPRo. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
