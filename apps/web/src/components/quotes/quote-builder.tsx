"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@fieldpro/ui/components/button";
import { Card } from "@fieldpro/ui/components/card";
import { ArrowLeft, Plus, Send, Eye, Copy, Sparkles, Briefcase } from "lucide-react";
import { QuoteStatusBadge } from "./quote-status-badge";
import { QuoteSectionCard } from "./quote-section-card";
import { QuoteSummary } from "./quote-summary";
import { CategoryPickerDialog } from "./category-picker-dialog";
import { SendQuoteDialog } from "./send-quote-dialog";
import { DownloadPdfButton } from "./download-pdf-button";
import { AIChatPanel } from "./ai-assistant/ai-chat-panel";
import { ShareLinkButton } from "./share-link-button";
import { QuoteActivityTimeline } from "./quote-activity-timeline";

interface QuoteData {
  title: string;
  sections: Array<{
    category: string;
    items: Array<{
      description: string;
      unitType: string;
      quantity: number;
      unitPrice: number;
      markupPct: number;
      length?: number;
      width?: number;
      height?: number;
    }>;
  }>;
  notes?: string;
}

export function QuoteBuilder({ initialQuote }: { initialQuote: { id: string } }) {
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [isApplyingAi, setIsApplyingAi] = useState(false);
  const utils = trpc.useUtils();

  const { data: quote, isLoading } = trpc.quote.byId.useQuery({
    id: initialQuote.id,
  });

  const duplicate = trpc.quote.duplicate.useMutation({
    onSuccess: (newQuote) => {
      window.location.href = `/quotes/${newQuote.id}`;
    },
  });

  const updateQuote = trpc.quote.update.useMutation();
  const addSection = trpc.quote.addSection.useMutation();
  const addItem = trpc.quote.addItem.useMutation();
  const { data: categories } = trpc.quote.categories.list.useQuery();

  if (isLoading || !quote) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
        <div className="h-64 w-full animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  const isDraft = quote.status === "DRAFT";
  const usedCategoryIds = quote.sections.map((s) => s.category.id);

  const invalidateQuote = () => {
    utils.quote.byId.invalidate({ id: quote.id });
  };

  const handleAiQuoteGenerated = async (quoteData: QuoteData) => {
    setIsApplyingAi(true);
    try {
      // Update quote title if provided
      if (quoteData.title) {
        await updateQuote.mutateAsync({
          id: quote.id,
          title: quoteData.title,
          notes: quoteData.notes || undefined,
        });
      }

      // Add sections and items
      for (const section of quoteData.sections) {
        // Find matching category
        const category = categories?.find(
          (c) => c.name.toLowerCase() === section.category.toLowerCase()
        );

        if (!category) continue;

        // Check if section already exists for this category
        const existingSection = quote.sections.find(
          (s) => s.category.name.toLowerCase() === section.category.toLowerCase()
        );

        let sectionId: string;

        if (existingSection) {
          sectionId = existingSection.id;
        } else {
          // Create new section
          const newSection = await addSection.mutateAsync({
            quoteId: quote.id,
            categoryId: category.id,
          });
          sectionId = newSection.id;
        }

        // Add items to section
        for (const item of section.items) {
          await addItem.mutateAsync({
            sectionId,
            description: item.description,
            unitType: item.unitType as
              | "SQ_FT"
              | "LINEAR_FT"
              | "CUBIC_YD"
              | "UNIT"
              | "HOUR"
              | "LUMP_SUM",
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            markupPct: item.markupPct,
            length: item.length ?? null,
            width: item.width ?? null,
            height: item.height ?? null,
          });
        }
      }

      // Refresh quote data
      invalidateQuote();
      setShowAiAssistant(false);
    } catch (error) {
      console.error("Error applying AI quote:", error);
      alert("Error creando la cotización. Por favor intenta de nuevo.");
    } finally {
      setIsApplyingAi(false);
    }
  };

  return (
    <div className="relative">
      {/* AI Overlay / Side Panel */}
      {showAiAssistant && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAiAssistant(false)}
          />
          {/* AI Panel - right side */}
          <div className="relative ml-auto w-full max-w-lg h-full animate-in slide-in-from-right duration-300">
            <AIChatPanel
              clientId={quote.clientId}
              clientName={quote.client.name}
              organizationName={quote.organization.name}
              organizationLogo={quote.organization.logoUrl}
              organizationPhone={quote.organization.phone}
              organizationLicense={quote.organization.license}
              onQuoteGenerated={handleAiQuoteGenerated}
              onClose={() => setShowAiAssistant(false)}
            />
          </div>
        </div>
      )}

      {/* Applying AI Overlay */}
      {isApplyingAi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background rounded-xl p-8 shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in duration-300">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white animate-pulse" />
            </div>
            <h3 className="font-semibold text-lg">Creando cotización...</h3>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Aplicando las secciones y items generados por la IA a tu cotización
            </p>
            <div className="flex gap-1 mt-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
              <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
              <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Link href="/quotes">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-heading text-3xl font-bold">{quote.quoteNumber}</h1>
                <QuoteStatusBadge status={quote.status} />
              </div>
              <p className="text-muted-foreground">
                {quote.client.name}
                {quote.title && ` — ${quote.title}`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {/* AI Assistant Button */}
            {isDraft && (
              <Button
                size="sm"
                variant="outline"
                className="relative overflow-hidden border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/30 group"
                onClick={() => setShowAiAssistant(true)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Sparkles className="mr-2 h-4 w-4" />
                Asistente IA
              </Button>
            )}
            <DownloadPdfButton quote={quote} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => duplicate.mutate({ id: quote.id })}
              disabled={duplicate.isPending}
            >
              <Copy className="mr-2 h-4 w-4" />
              Duplicar
            </Button>
            <Link href={`/quotes/${quote.id}/preview`}>
              <Button variant="outline" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                Vista Previa
              </Button>
            </Link>
            {!isDraft && (quote.status === "SENT" || quote.status === "VIEWED") && (
              <ShareLinkButton
                shareToken={quote.shareToken}
                clientPhone={quote.client.phone}
                clientEmail={quote.client.email}
              />
            )}
            {isDraft && (
              <Button size="sm" onClick={() => setShowSendDialog(true)}>
                <Send className="mr-2 h-4 w-4" />
                Enviar
              </Button>
            )}
          </div>
        </div>

        {/* Job Link Banner */}
        {quote.status === "ACCEPTED" && quote.job && (
          <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium">
                    Trabajo creado: {quote.job.jobNumber}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Esta cotización ha sido convertida a un trabajo activo
                  </p>
                </div>
              </div>
              <Link href={`/jobs/${quote.job.id}`}>
                <Button variant="outline" size="sm">
                  Ver Trabajo
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Empty State with AI Prompt */}
        {isDraft && quote.sections.length === 0 && (
          <Card className="p-8 text-center space-y-4 border-dashed">
            <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-violet-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                ¿Quieres que la IA te ayude?
              </h3>
              <p className="text-muted-foreground text-sm mt-1 max-w-md mx-auto">
                Describe el proyecto por texto, voz o imágenes y la IA generará
                una cotización completa con precios de materiales en Puerto Rico.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/25"
                onClick={() => setShowAiAssistant(true)}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Usar Asistente IA
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCategoryPicker(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Manual
              </Button>
            </div>
          </Card>
        )}

        {/* Sections */}
        {quote.sections
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((section) => (
            <QuoteSectionCard
              key={section.id}
              section={section}
              quoteId={quote.id}
              isDraft={isDraft}
              onUpdate={invalidateQuote}
            />
          ))}

        {/* Add Section */}
        {isDraft && quote.sections.length > 0 && (
          <Card
            className="flex cursor-pointer items-center justify-center border-dashed p-8 transition-colors hover:bg-accent/50"
            onClick={() => setShowCategoryPicker(true)}
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <Plus className="h-5 w-5" />
              <span className="font-medium">Agregar Sección</span>
            </div>
          </Card>
        )}

        {/* Summary */}
        <QuoteSummary
          subtotal={Number(quote.subtotal)}
          taxRate={Number(quote.taxRate)}
          taxAmount={Number(quote.taxAmount)}
          total={Number(quote.total)}
        />

        {/* Activity Timeline */}
        {quote.activities && quote.activities.length > 0 && (
          <QuoteActivityTimeline activities={quote.activities} />
        )}

        {/* Category Picker Dialog */}
        <CategoryPickerDialog
          open={showCategoryPicker}
          onOpenChange={setShowCategoryPicker}
          quoteId={quote.id}
          excludeCategoryIds={usedCategoryIds}
          onAdded={invalidateQuote}
        />

        {/* Send Dialog */}
        <SendQuoteDialog
          open={showSendDialog}
          onOpenChange={setShowSendDialog}
          quoteId={quote.id}
          shareToken={quote.shareToken}
          clientPhone={quote.client.phone}
          clientEmail={quote.client.email}
          onSent={invalidateQuote}
        />
      </div>
    </div>
  );
}
