"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle,
  FileText,
  Briefcase,
  Users,
  Receipt,
  Sparkles,
  ShoppingCart,
  Star,
  MapPin,
  Play,
  Menu,
  X,
  MessageSquare,
  Clock,
  Calculator,
  Send,
  Palmtree,
} from "lucide-react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════
   FieldPro Landing Page — Professional Construction SaaS
   Theme: Modern Construction with Caribbean Warmth
   ═══════════════════════════════════════════════════════════════ */

// ── Design Tokens ─────────────────────────────────────────────
const THEME = {
  // Primary: Deep Teal (professional construction + Caribbean water)
  teal: {
    50: "#f0f9f8",
    100: "#d9f2ef",
    200: "#b3e4df",
    300: "#80cec6",
    400: "#4db0a6",
    500: "#289186", // Main brand
    600: "#1f736b",
    700: "#1a5c56",
    800: "#164a46",
    900: "#133d3a",
  },
  // Accent: Warm Amber/Orange (construction energy, safety)
  amber: {
    400: "#f59e42",
    500: "#e8603c", // Coral accent
    600: "#d4542b",
  },
  // Neutrals: Warm stone/concrete
  stone: {
    50: "#faf8f4", // Caliza background
    100: "#f5f1eb",
    200: "#e8e4dc",
    300: "#d6d0c4",
    400: "#b8b0a0",
    500: "#9a9180",
    600: "#7d7568",
    700: "#665f55",
    800: "#554f47",
    900: "#2d2a26",
  },
  fonts: {
    display: "var(--font-display, 'Playfair Display', Georgia, serif)",
    body: "var(--font-body, 'Space Grotesk', system-ui, sans-serif)",
  },
};

// ── Images ────────────────────────────────────────────────────
// High-quality Unsplash construction images
const IMAGES = {
  hero: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=80",
  workerTablet:
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
  constructionSite:
    "https://images.unsplash.com/photo-1590644365607-1c5a8e7b7999?w=1200&q=80",
  blueprint:
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80",
  team: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=1200&q=80",
  crane:
    "https://images.unsplash.com/photo-1541976590-713941681591?w=1200&q=80",
  architect:
    "https://images.unsplash.com/photo-1600607686527-6fb886090705?w=800&q=80",
};

// ── Logo Mark Component ───────────────────────────────────────
function LogoMark({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
    >
      <rect
        width="32"
        height="32"
        rx="8"
        fill={`url(#logo-gradient-${size})`}
      />
      <path
        d="M8 24h16M10 24V14l8-6 8 6v10"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 24v-8h6v8"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id={`logo-gradient-${size}`}
          x1="0"
          y1="0"
          x2="32"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={THEME.teal[400]} />
          <stop offset="1" stopColor={THEME.teal[600]} />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ── Navigation ────────────────────────────────────────────────
function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Características", href: "#features" },
    { label: "Cómo funciona", href: "#how-it-works" },
    { label: "Precios", href: "#pricing" },
    { label: "Contacto", href: "#contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/90 backdrop-blur-xl shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <LogoMark size={36} />
              <div className="absolute inset-0 bg-teal-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span
              className="text-xl font-bold tracking-tight"
              style={{
                fontFamily: THEME.fonts.display,
                color: THEME.stone[900],
              }}
            >
              Field<span style={{ color: THEME.teal[500] }}>Pro</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium transition-colors hover:text-teal-600"
                style={{ color: isScrolled ? THEME.stone[600] : "white" }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/sign-in"
              className="px-4 py-2 text-sm font-medium transition-colors rounded-lg"
              style={{ color: isScrolled ? THEME.stone[700] : "white" }}
            >
              Iniciar sesión
            </Link>
            <Link
              href="/sign-up"
              className="px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-all hover:scale-105 hover:shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${THEME.teal[400]}, ${THEME.teal[600]})`,
              }}
            >
              Comenzar gratis
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ color: isScrolled ? THEME.stone[700] : "white" }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden bg-white border-t"
          style={{ borderColor: THEME.stone[200] }}
        >
          <div className="px-6 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block py-2 text-sm font-medium"
                style={{ color: THEME.stone[700] }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <hr style={{ borderColor: THEME.stone[200] }} />
            <Link
              href="/sign-in"
              className="block w-full py-2 text-sm font-medium"
              style={{ color: THEME.stone[700] }}
            >
              Iniciar sesión
            </Link>
            <Link
              href="/sign-up"
              className="block w-full py-2.5 text-sm font-semibold text-white rounded-lg text-center"
              style={{
                background: `linear-gradient(135deg, ${THEME.teal[400]}, ${THEME.teal[600]})`,
              }}
            >
              Comenzar gratis
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

// ── Hero Section ──────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={IMAGES.hero}
          alt="Construction background"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${THEME.teal[900]}ee 0%, ${THEME.teal[800]}cc 50%, ${THEME.teal[900]}99 100%)`,
          }}
        />
        {/* Blueprint Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column - Text */}
          <div className="text-white space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <Palmtree size={16} className="text-amber-400" />
              <span className="text-sm font-medium">
                Diseñado para Puerto Rico
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight"
                style={{ fontFamily: THEME.fonts.display }}
              >
                La mala administración
                <br />
                te está haciendo{" "}
                <span className="relative">
                  perder dinero
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 300 12"
                    fill="none"
                  >
                    <path
                      d="M2 10C50 4 100 4 298 6"
                      stroke={THEME.amber[400]}
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-white/80 max-w-xl leading-relaxed">
                Cotizar al paso y organizar tus proyectos en libretas está
                destruyendo tus ganancias. Únete a FieldPro y empieza a cobrar
                por todo lo que trabajas.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/sign-up"
                className="group flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-xl transition-all hover:scale-105 hover:shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, ${THEME.amber[400]}, ${THEME.amber[500]})`,
                  color: "white",
                }}
              >
                Empezar gratis
                <ArrowRight
                  size={20}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white/20 bg-gradient-to-br from-teal-400 to-teal-600"
                    />
                  ))}
                </div>
                <span className="text-sm text-white/70">
                  +500 contratistas activos
                </span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={16}
                    className="fill-amber-400 text-amber-400"
                  />
                ))}
                <span className="text-sm text-white/70 ml-1">4.9/5</span>
              </div>
            </div>
          </div>

          {/* Right Column - Dashboard Preview */}
          <div className="relative hidden lg:block">
            <div className="relative">
              {/* Glow Effect */}
              <div
                className="absolute -inset-4 rounded-3xl blur-2xl opacity-30"
                style={{
                  background: `linear-gradient(135deg, ${THEME.amber[400]}, ${THEME.teal[400]})`,
                }}
              />
              {/* Dashboard Card */}
              <div
                className="relative rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  background: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(20px)",
                }}
              >
                {/* Dashboard Header */}
                <div
                  className="flex items-center justify-between px-6 py-4 border-b"
                  style={{ borderColor: THEME.stone[200] }}
                >
                  <div className="flex items-center gap-3">
                    <LogoMark size={28} />
                    <span
                      className="font-bold text-lg"
                      style={{
                        fontFamily: THEME.fonts.display,
                        color: THEME.stone[900],
                      }}
                    >
                      FieldPro
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: THEME.stone[300] }}
                    />
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: THEME.stone[300] }}
                    />
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: THEME.stone[300] }}
                    />
                  </div>
                </div>
                {/* Dashboard Content */}
                <div className="p-6 space-y-4">
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Cotizaciones", value: "$128K", change: "+12%" },
                      { label: "Trabajos", value: "24", change: "+5" },
                      { label: "Facturado", value: "$89K", change: "+8%" },
                    ].map((stat, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl"
                        style={{ background: THEME.stone[50] }}
                      >
                        <p
                          className="text-xs font-medium mb-1"
                          style={{ color: THEME.stone[500] }}
                        >
                          {stat.label}
                        </p>
                        <p
                          className="text-xl font-bold"
                          style={{ color: THEME.stone[900] }}
                        >
                          {stat.value}
                        </p>
                        <p
                          className="text-xs font-medium mt-1"
                          style={{ color: THEME.teal[500] }}
                        >
                          {stat.change}
                        </p>
                      </div>
                    ))}
                  </div>
                  {/* Recent Quotes */}
                  <div
                    className="rounded-xl border p-4"
                    style={{
                      background: "white",
                      borderColor: THEME.stone[200],
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: THEME.stone[900] }}
                      >
                        Cotizaciones recientes
                      </span>
                      <Sparkles size={16} style={{ color: THEME.amber[500] }} />
                    </div>
                    {[
                      { name: "Residencia Ocean View", amount: "$45,000" },
                      { name: "Remodelación Comercial", amount: "$28,500" },
                    ].map((quote, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                        style={{ borderColor: THEME.stone[100] }}
                      >
                        <span
                          className="text-sm"
                          style={{ color: THEME.stone[700] }}
                        >
                          {quote.name}
                        </span>
                        <span
                          className="text-sm font-semibold"
                          style={{ color: THEME.teal[600] }}
                        >
                          {quote.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Floating Elements */}
              <div
                className="absolute -bottom-6 -left-6 p-4 rounded-xl shadow-xl"
                style={{ background: "white" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: THEME.teal[50] }}
                  >
                    <CheckCircle size={20} style={{ color: THEME.teal[500] }} />
                  </div>
                  <div>
                    <p
                      className="text-xs font-medium"
                      style={{ color: THEME.stone[500] }}
                    >
                      Cotización aprobada
                    </p>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: THEME.stone[900] }}
                    >
                      $32,400
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          className="w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill={THEME.stone[50]}
          />
        </svg>
      </div>
    </section>
  );
}

// ── Logo Strip ────────────────────────────────────────────────
function LogoStrip() {
  const partners = [
    "Home Depot PR",
    "Clerk",
    "OpenAI",
    "Supabase",
    "Vercel",
    "Resend",
  ];

  return (
    <section
      className="py-12 border-b"
      style={{ background: THEME.stone[50], borderColor: THEME.stone[200] }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <p
          className="text-center text-sm font-medium mb-8"
          style={{ color: THEME.stone[500] }}
        >
          Tecnología respaldada por líderes de la industria
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16">
          {partners.map((partner, i) => (
            <div
              key={i}
              className="text-lg font-bold tracking-tight opacity-40 hover:opacity-70 transition-opacity"
              style={{ color: THEME.stone[700] }}
            >
              {partner}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Features Section ──────────────────────────────────────────
function FeaturesSection() {
  const features = [
    {
      icon: Sparkles,
      title: "Cotiza Exacto, Sin Regalar Trabajo",
      description:
        "Deja que la IA calcule con base a precios reales. Nunca más pierdas dinero por olvidar cobrar clavos, pintura o detalles del alcance.",
      color: THEME.teal[500],
      bgColor: THEME.teal[50],
    },
    {
      icon: FileText,
      title: "Propuestas que Justifican tu Precio",
      description:
        "Genera contratos en PDF con tu logo que separan a los profesionales de los 'chiveros'. Cierra más ventas a los precios correctos.",
      color: THEME.amber[500],
      bgColor: "#fff7ed",
    },
    {
      icon: Briefcase,
      title: "Control Total, Cero Desorganización",
      description:
        "No más libretas perdidas. Administra tus proyectos y asume la responsabilidad que exigen los buenos clientes comerciales o residenciales.",
      color: THEME.teal[500],
      bgColor: THEME.teal[50],
    },
    {
      icon: Receipt,
      title: "Asegura tu Flujo de Efectivo",
      description:
        "El trabajo no termina hasta que cobras. Genera facturas profesionales en segundos y elimina la incomodidad de 'cobrar por WhatsApp'.",
      color: THEME.amber[500],
      bgColor: "#fff7ed",
    },
    {
      icon: ShoppingCart,
      title: "Materiales Reales (Home Depot PR)",
      description:
        "Se acabó el adivinar o cotizar por debajo del costo real del patio. Extraemos los precios de Home Depot PR directamente a tu cotización.",
      color: THEME.teal[500],
      bgColor: THEME.teal[50],
    },
    {
      icon: Users,
      title: "Retén a los Mejores Clientes",
      description:
        "Un cliente que experimenta tu organización y transparencia con FieldPro, no buscará a nadie más. Guarda todo su historial en un solo lugar.",
      color: THEME.amber[500],
      bgColor: "#fff7ed",
    },
  ];

  return (
    <section
      id="features"
      className="py-24 lg:py-32"
      style={{ background: THEME.stone[50] }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <span
            className="inline-block text-sm font-bold tracking-widest uppercase mb-4"
            style={{ color: THEME.teal[600] }}
          >
            Todo en uno
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
            style={{ fontFamily: THEME.fonts.display, color: THEME.stone[900] }}
          >
            Cada herramienta que necesitas
          </h2>
          <p className="text-lg" style={{ color: THEME.stone[600] }}>
            Desde la primera cotización hasta la factura final, FieldPro tiene
            todo cubierto.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{
                background: "white",
                border: `1px solid ${THEME.stone[200]}`,
              }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                style={{ background: feature.bgColor }}
              >
                <feature.icon size={28} style={{ color: feature.color }} />
              </div>
              <h3
                className="text-xl font-bold mb-3"
                style={{ color: THEME.stone[900] }}
              >
                {feature.title}
              </h3>
              <p
                className="leading-relaxed"
                style={{ color: THEME.stone[600] }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How It Works Section ─────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      icon: MessageSquare,
      title: "Organiza el desorden",
      description:
        "Usa voz o fotos y deja que la IA arme el alcance. No volverás a olvidar cobrar por clavos o pintura.",
    },
    {
      number: "02",
      icon: Calculator,
      title: "Cotiza con precisión",
      description:
        "En segundos, obtienes el costo real con precios exactos de Home Depot PR. Se acabó el cotizar al 'ojo'.",
    },
    {
      number: "03",
      icon: Send,
      title: "Proyecta profesionalismo",
      description:
        "Envía contratos formales en PDF. Sepárate de los 'chiveros' y cobra lo que realmente vale tu trabajo.",
    },
    {
      number: "04",
      icon: CheckCircle,
      title: "Elimina el cobro informal",
      description:
        "Se acabó el 'cobrar por WhatsApp'. Convierte aprobaciones en facturas formales y asegura tu dinero.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-24 lg:py-32 relative overflow-hidden"
      style={{ background: "white" }}
    >
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${THEME.stone[300]} 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <span
            className="inline-block text-sm font-bold tracking-widest uppercase mb-4"
            style={{ color: THEME.teal[600] }}
          >
            Cómo funciona
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
            style={{ fontFamily: THEME.fonts.display, color: THEME.stone[900] }}
          >
            Del desorden a la rentabilidad total
          </h2>
          <p className="text-lg" style={{ color: THEME.stone[600] }}>
            Nuestro proceso te obliga a ser organizado, calcular los precios
            exactos y cobrar como el profesional que eres.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              {/* Connector Line */}
              {i < steps.length - 1 && (
                <div
                  className="hidden lg:block absolute top-12 left-full w-full h-px -translate-x-8"
                  style={{
                    background: `linear-gradient(90deg, ${THEME.teal[200]}, transparent)`,
                  }}
                />
              )}

              <div className="relative">
                {/* Number Badge */}
                <div
                  className="absolute -top-3 -left-3 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    background: THEME.teal[500],
                    color: "white",
                  }}
                >
                  {step.number}
                </div>

                {/* Card */}
                <div
                  className="pt-12 pb-8 px-6 rounded-2xl h-full"
                  style={{
                    background: THEME.stone[50],
                    border: `1px solid ${THEME.stone[200]}`,
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: "white" }}
                  >
                    <step.icon size={24} style={{ color: THEME.teal[600] }} />
                  </div>
                  <h3
                    className="text-xl font-bold mb-3"
                    style={{ color: THEME.stone[900] }}
                  >
                    {step.title}
                  </h3>
                  <p style={{ color: THEME.stone[600] }}>{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Showcase Section ──────────────────────────────────────────
function ShowcaseSection() {
  return (
    <section className="py-24 lg:py-32" style={{ background: THEME.teal[900] }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Image */}
          <div className="relative">
            <div
              className="absolute -inset-4 rounded-3xl blur-3xl opacity-20"
              style={{
                background: `linear-gradient(135deg, ${THEME.amber[400]}, ${THEME.teal[400]})`,
              }}
            />
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src={IMAGES.workerTablet}
                alt="Constructor usando tablet"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>

            {/* Floating Stat Card */}
            <div
              className="absolute -bottom-6 -right-6 p-6 rounded-2xl shadow-2xl hidden lg:block"
              style={{ background: "white" }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ background: THEME.teal[50] }}
                >
                  <Clock size={28} style={{ color: THEME.teal[600] }} />
                </div>
                <div>
                  <p
                    className="text-3xl font-bold"
                    style={{ color: THEME.teal[600] }}
                  >
                    5x
                  </p>
                  <p className="text-sm" style={{ color: THEME.stone[600] }}>
                    Más rápido cotizar
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Content */}
          <div className="text-white space-y-8">
            <div className="space-y-4">
              <span
                className="inline-block text-sm font-bold tracking-widest uppercase"
                style={{ color: THEME.teal[300] }}
              >
                Diseñado para el campo
              </span>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight"
                style={{ fontFamily: THEME.fonts.display }}
              >
                Rescata tus márgenes de ganancia hoy
              </h2>
              <p className="text-lg text-white/70 leading-relaxed">
                Cada detalle que olvidas cobrar es dinero que sale de tu
                bolsillo. FieldPro te obliga a ser organizado, calcular los
                precios reales y dejar de subsidiar proyectos.
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-4">
              {[
                "Cotizaciones Profesionales en Segundos",
                "Sincronización automática de precios",
                "Comparte fotos del proyecto",
                "Notificaciones en tiempo real",
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle size={20} style={{ color: THEME.amber[400] }} />
                  <span className="text-white/90">{benefit}</span>
                </div>
              ))}
            </div>

            <Link
              href="/sign-up"
              className="flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-xl transition-all hover:scale-105"
              style={{ background: "white", color: THEME.teal[900] }}
            >
              Probar gratis
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Testimonials Section ─────────────────────────────────────
function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "Antes perdía dinero porque se me olvidaba cobrar pintura y clavos. Ahora la IA no deja que se me escape ni un centavo en materiales.",
      author: "Carlos Rodríguez",
      role: "Contratista General",
      company: "CR Construcciones",
      avatar: "CR",
    },
    {
      quote:
        "Cotizar al 'ojo' casi quiebra mi negocio. Con los precios de Home Depot PR reales en la plataforma, por fin sé exactamente cuánto voy a ganar.",
      author: "María Santos",
      role: "CEO",
      company: "Santos Remodeling",
      avatar: "MS",
    },
    {
      quote:
        "Enviar PDFs profesionales eliminó a los clientes malos que solo buscan precio barato. Ahora los clientes serios nos respetan como empresa.",
      author: "José Martínez",
      role: "Propietario",
      company: "Martínez Electric",
      avatar: "JM",
    },
  ];

  return (
    <section
      className="py-24 lg:py-32"
      style={{
        background: `linear-gradient(180deg, ${THEME.stone[50]} 0%, white 100%)`,
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span
            className="inline-block text-sm font-bold tracking-widest uppercase mb-4"
            style={{ color: THEME.teal[600] }}
          >
            Testimonios
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
            style={{ fontFamily: THEME.fonts.display, color: THEME.stone[900] }}
          >
            Lo que dicen nuestros clientes
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <div
              key={i}
              className="p-8 rounded-2xl"
              style={{
                background: "white",
                border: `1px solid ${THEME.stone[200]}`,
              }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    className="fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <p
                className="text-lg mb-8 leading-relaxed"
                style={{ color: THEME.stone[700] }}
              >
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold"
                  style={{
                    background: THEME.teal[100],
                    color: THEME.teal[700],
                  }}
                >
                  {testimonial.avatar}
                </div>
                <div>
                  <p
                    className="font-semibold"
                    style={{ color: THEME.stone[900] }}
                  >
                    {testimonial.author}
                  </p>
                  <p className="text-sm" style={{ color: THEME.stone[500] }}>
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pricing Section ───────────────────────────────────────────
function PricingSection() {
  const plans = [
    {
      name: "Prueba Gratis",
      description: "Prueba todas las funciones por 7 días",
      price: "$0",
      period: "7 días",
      features: [
        "Cotizaciones ilimitadas",
        "Trabajos ilimitados",
        "PDFs profesionales",
        "Precios Home Depot PR",
        "Facturación completa",
        "Soporte por email",
      ],
      cta: "Iniciar prueba",
      popular: false,
    },
    {
      name: "Professional",
      description: "Para contratistas serios",
      price: "$49",
      period: "/mes",
      features: [
        "Todo ilimitado",
        "PDFs personalizados con tu logo",
        "Precios Home Depot PR en tiempo real",
        "Facturación y seguimiento de pagos",
        "Lista de materiales automática",
        "Soporte prioritario",
      ],
      cta: "Suscribirme ahora",
      popular: true,
    },
  ];

  return (
    <section
      id="pricing"
      className="py-24 lg:py-32"
      style={{ background: THEME.stone[50] }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span
            className="inline-block text-sm font-bold tracking-widest uppercase mb-4"
            style={{ color: THEME.teal[600] }}
          >
            Inversión
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
            style={{ fontFamily: THEME.fonts.display, color: THEME.stone[900] }}
          >
            Cuesta menos que los materiales que olvidas cobrar
          </h2>
          <p className="text-lg" style={{ color: THEME.stone[600] }}>
            El precio de no usar FieldPro es todo el dinero que estás perdiendo
            en proyectos mal cotizados.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative p-8 rounded-2xl ${
                plan.popular ? "ring-2" : "border"
              }`}
              style={{
                background: "white",
                borderColor: plan.popular ? THEME.teal[500] : THEME.stone[200],
              }}
            >
              {plan.popular && (
                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-semibold"
                  style={{ background: THEME.teal[500], color: "white" }}
                >
                  Más popular
                </div>
              )}

              <div className="mb-6">
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ color: THEME.stone[900] }}
                >
                  {plan.name}
                </h3>
                <p className="text-sm" style={{ color: THEME.stone[500] }}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <span
                  className="text-4xl font-bold"
                  style={{ color: THEME.stone[900] }}
                >
                  {plan.price}
                </span>
                <span style={{ color: THEME.stone[500] }}>{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, fi) => (
                  <li key={fi} className="flex items-center gap-3">
                    <CheckCircle size={18} style={{ color: THEME.teal[500] }} />
                    <span
                      className="text-sm"
                      style={{ color: THEME.stone[700] }}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/sign-up"
                className={`block w-full py-3 rounded-xl font-semibold text-center transition-all ${
                  plan.popular ? "hover:opacity-90" : "border hover:bg-stone-50"
                }`}
                style={{
                  background: plan.popular ? THEME.teal[500] : "transparent",
                  color: plan.popular ? "white" : THEME.stone[700],
                  borderColor: plan.popular ? undefined : THEME.stone[300],
                }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA Section ───────────────────────────────────────────────
function CTASection() {
  return (
    <section
      className="py-24 lg:py-32 relative overflow-hidden"
      style={{ background: THEME.teal[600] }}
    >
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative">
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
          style={{ fontFamily: THEME.fonts.display }}
        >
          ¿Listo para dejar de regalar tu trabajo?
        </h2>
        <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
          Únete a +500 contratistas en Puerto Rico que ya dejaron de perder
          dinero por malas cotizaciones y desorden administrativo.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/sign-up"
            className="flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-xl transition-all hover:scale-105"
            style={{ background: "white", color: THEME.teal[600] }}
          >
            Comenzar gratis ahora
            <ArrowRight size={20} />
          </Link>
        </div>

        <p className="mt-6 text-sm text-white/60">
          Sin tarjeta de crédito · Setup en 5 minutos · Cancela cuando quieras
        </p>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────
function Footer() {
  const footerLinks = {
    Producto: ["Características", "Precios", "Integraciones", "Changelog"],
    Compañía: ["Sobre nosotros", "Blog", "Carreras", "Prensa"],
    Recursos: ["Documentación", "Guías", "API Reference", "Soporte"],
    Legal: ["Privacidad", "Términos", "Cookies"],
  };

  return (
    <footer style={{ background: THEME.stone[900] }} className="text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <LogoMark size={36} />
              <span
                className="text-xl font-bold"
                style={{ fontFamily: THEME.fonts.display }}
              >
                Field<span style={{ color: THEME.teal[400] }}>Pro</span>
              </span>
            </Link>
            <p className="text-stone-400 mb-6 max-w-sm">
              La plataforma profesional de gestión para contratistas y
              constructores en Puerto Rico.
            </p>
            <div className="flex items-center gap-2 text-stone-400">
              <MapPin size={16} />
              <span className="text-sm">Hecho en Puerto Rico 🇵🇷</span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-stone-400 hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderTop: `1px solid ${THEME.stone[800]}` }}
        >
          <p className="text-sm text-stone-500">
            © {new Date().getFullYear()} FieldPro. Todos los derechos
            reservados.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-stone-400 hover:text-white transition-colors"
            >
              <span className="sr-only">Twitter</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a
              href="#"
              className="text-stone-400 hover:text-white transition-colors"
            >
              <span className="sr-only">LinkedIn</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Main Page Component ───────────────────────────────────────
export default function LandingPage() {
  return (
    <main className="min-h-screen" style={{ fontFamily: THEME.fonts.body }}>
      <Navigation />
      <HeroSection />
      <LogoStrip />
      <FeaturesSection />
      <HowItWorksSection />
      <ShowcaseSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  );
}
