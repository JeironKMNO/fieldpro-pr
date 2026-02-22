"use client";

import { useState, Suspense } from "react";
import { QuoteForm } from "@/components/quotes/quote-form";
import { Sparkles, FileText, LayoutTemplate, ArrowLeft } from "lucide-react";
import { QUOTE_TEMPLATES } from "@/lib/quote-templates";
import { Button } from "@fieldpro/ui/components/button";

type Mode = "choose" | "manual" | "templates" | "template-form";

function QuoteCreationChoice() {
  const [mode, setMode] = useState<Mode>("choose");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  if (mode === "manual") {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMode("choose")}
            className="mb-2"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Volver
          </Button>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Nueva Cotización</h1>
          <p className="text-muted-foreground">
            Crea una cotización desde cero
          </p>
        </div>
        <Suspense>
          <QuoteForm />
        </Suspense>
      </div>
    );
  }

  if (mode === "template-form" && selectedTemplateId) {
    const template = QUOTE_TEMPLATES.find((t) => t.id === selectedTemplateId);
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setMode("templates"); setSelectedTemplateId(null); }}
            className="mb-2"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Volver a plantillas
          </Button>
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            {template?.icon} {template?.name}
          </h1>
          <p className="text-muted-foreground">
            Selecciona el cliente para crear la cotización con esta plantilla
          </p>
        </div>
        <Suspense>
          <QuoteForm templateId={selectedTemplateId} templateName={template?.name} />
        </Suspense>
      </div>
    );
  }

  if (mode === "templates") {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMode("choose")}
            className="mb-2"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Volver
          </Button>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Selecciona una Plantilla</h1>
          <p className="text-muted-foreground">
            Plantillas con precios del mercado de Puerto Rico. Puedes ajustar cantidades y precios después.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUOTE_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                setSelectedTemplateId(template.id);
                setMode("template-form");
              }}
              className="group relative rounded-xl border-2 border-border bg-card p-6 text-left transition-all hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                <span className="text-3xl">{template.icon}</span>
                <div>
                  <h3 className="font-bold">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {template.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {template.sections.map((s) => (
                    <span
                      key={s.category}
                      className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                    >
                      {s.category}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Default: choice screen
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="text-center space-y-2">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Nueva Cotización</h1>
        <p className="text-muted-foreground">
          Elige cómo quieres crear tu cotización
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {/* AI Option */}
        <button
          onClick={() => setMode("manual")}
          className="group relative overflow-hidden rounded-xl border-2 border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 p-6 text-left transition-all hover:border-violet-400 dark:hover:border-violet-600 hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-0.5"
        >
          <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-violet-400/20 to-indigo-400/20 blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <div className="relative space-y-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Con Asistente IA</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Describe el proyecto por texto, voz o fotos. La IA genera la cotización automáticamente.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center rounded-full bg-violet-100 dark:bg-violet-900/40 px-2 py-0.5 text-[10px] font-medium text-violet-700 dark:text-violet-300">
                Texto / Voz / Fotos
              </span>
              <span className="inline-flex items-center rounded-full bg-violet-100 dark:bg-violet-900/40 px-2 py-0.5 text-[10px] font-medium text-violet-700 dark:text-violet-300">
                Precios reales PR
              </span>
            </div>
          </div>
        </button>

        {/* Templates Option */}
        <button
          onClick={() => setMode("templates")}
          className="group relative overflow-hidden rounded-xl border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-6 text-left transition-all hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-0.5"
        >
          <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-400/20 blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <div className="relative space-y-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <LayoutTemplate className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Usar Plantilla</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Selecciona un tipo de trabajo común. La cotización se crea con items y precios de PR.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300">
                8 plantillas
              </span>
              <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300">
                Precios mercado PR
              </span>
            </div>
          </div>
        </button>

        {/* Manual Option */}
        <button
          onClick={() => setMode("manual")}
          className="group relative overflow-hidden rounded-xl border-2 border-border bg-card p-6 text-left transition-all hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5"
        >
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Cotización Manual</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Crea la cotización paso a paso con tus propios precios y categorías.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                Control total
              </span>
              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                Precios propios
              </span>
            </div>
          </div>
        </button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Las plantillas y la IA usan precios actualizados del mercado de Puerto Rico. Siempre puedes ajustar después.
      </p>
    </div>
  );
}

export default function NewQuotePage() {
  return <QuoteCreationChoice />;
}
