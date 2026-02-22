/* eslint-disable @next/next/no-img-element */
"use client";

import { Bot, Sparkles, DollarSign, CheckCircle, AlertCircle } from "lucide-react";

interface ChatMessageProps {
    role: "user" | "assistant";
    content: string;
    images?: string[];
    isAudio?: boolean;
    timestamp?: Date;
    isStreaming?: boolean;
}

interface MaterialPrice {
    name: string;
    price: number;
    unit: string;
    store: string;
    quantity: number;
    subtotal: number;
    source: "homedepot" | "database" | "estimated";
    url?: string;
    thumbnail?: string;
}

interface PriceResultsCardProps {
    prices: MaterialPrice[];
}

export function PriceResultsCard({ prices }: PriceResultsCardProps) {
    const total = prices.reduce((sum, p) => sum + p.subtotal, 0);
    const fromHD = prices.filter((p) => p.source === "homedepot").length;
    const fromDb = prices.filter((p) => p.source === "database").length;
    const estimated = prices.filter((p) => p.source === "estimated").length;

    return (
        <div className="animate-in slide-in-from-bottom-2 duration-300 ml-11">
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/30 dark:to-teal-950/30 p-4 space-y-3 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h4 className="font-semibold text-sm text-emerald-900 dark:text-emerald-100">
                        Precios Encontrados
                    </h4>
                    <div className="flex gap-1.5 ml-auto">
                        {fromHD > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 dark:bg-orange-900/50 px-2 py-0.5 text-[10px] font-medium text-orange-700 dark:text-orange-300">
                                <CheckCircle className="h-3 w-3" />
                                {fromHD} Home Depot
                            </span>
                        )}
                        {fromDb > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                                <CheckCircle className="h-3 w-3" />
                                {fromDb} base de datos
                            </span>
                        )}
                        {estimated > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300">
                                <AlertCircle className="h-3 w-3" />
                                {estimated} estimados
                            </span>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-emerald-200 dark:border-emerald-800/50">
                                <th className="text-left py-1.5 px-2 font-medium text-emerald-700 dark:text-emerald-300">Material</th>
                                <th className="text-right py-1.5 px-2 font-medium text-emerald-700 dark:text-emerald-300">Precio</th>
                                <th className="text-right py-1.5 px-2 font-medium text-emerald-700 dark:text-emerald-300">Cant.</th>
                                <th className="text-right py-1.5 px-2 font-medium text-emerald-700 dark:text-emerald-300">Subtotal</th>
                                <th className="text-left py-1.5 px-2 font-medium text-emerald-700 dark:text-emerald-300">Tienda</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prices.map((p, idx) => (
                                <tr
                                    key={idx}
                                    className="border-b border-emerald-100 dark:border-emerald-900/30 last:border-0 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors"
                                >
                                    <td className="py-1.5 px-2 font-medium text-foreground">
                                        <div className="flex items-center gap-2">
                                            {p.thumbnail ? (
                                                <a
                                                    href={p.url || "#"}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-shrink-0"
                                                >
                                                    <img
                                                        src={`/api/image-proxy?url=${encodeURIComponent(p.thumbnail)}`}
                                                        alt={p.name}
                                                        className="h-10 w-10 rounded border border-border object-contain bg-white"
                                                    />
                                                </a>
                                            ) : p.source === "homedepot" ? (
                                                <CheckCircle className="h-3 w-3 text-orange-500 flex-shrink-0" />
                                            ) : p.source === "database" ? (
                                                <CheckCircle className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                                            ) : (
                                                <AlertCircle className="h-3 w-3 text-amber-500 flex-shrink-0" />
                                            )}
                                            <div className="flex flex-col">
                                                {p.url ? (
                                                    <a
                                                        href={p.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-dotted underline-offset-2 hover:decoration-solid transition-colors line-clamp-2"
                                                        title={`Ver en ${p.store}`}
                                                    >
                                                        {p.name}
                                                    </a>
                                                ) : (
                                                    <span className="line-clamp-2">{p.name}</span>
                                                )}
                                                {p.source === "homedepot" && !p.thumbnail && (
                                                    <span className="text-[9px] text-orange-500">Home Depot</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-1.5 px-2 text-right font-mono">
                                        ${p.price.toFixed(2)}/{p.unit}
                                    </td>
                                    <td className="py-1.5 px-2 text-right">{p.quantity}</td>
                                    <td className="py-1.5 px-2 text-right font-semibold font-mono">
                                        ${p.subtotal.toFixed(2)}
                                    </td>
                                    <td className="py-1.5 px-2 text-muted-foreground">{p.store}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-emerald-300 dark:border-emerald-700">
                                <td colSpan={3} className="py-2 px-2 font-bold text-sm text-emerald-800 dark:text-emerald-200">
                                    Total Materiales
                                </td>
                                <td className="py-2 px-2 text-right font-bold text-sm font-mono text-emerald-700 dark:text-emerald-300">
                                    ${total.toFixed(2)}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}

export function StatusMessage({ message }: { message: string }) {
    return (
        <div className="flex gap-3 animate-in fade-in duration-200 ml-11">
            <div className="text-xs text-muted-foreground flex items-center gap-2 py-1">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                {message}
            </div>
        </div>
    );
}

export function ChatMessage({ role, content, images, isAudio, timestamp, isStreaming }: ChatMessageProps) {
    const isUser = role === "user";

    return (
        <div
            className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} animate-in slide-in-from-bottom-2 duration-300`}
        >
            {/* Avatar */}
            <div
                className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${isUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-gradient-to-br from-violet-500 to-indigo-600 text-white"
                    }`}
            >
                {isUser ? (
                    <span className="text-xs font-bold">TÚ</span>
                ) : (
                    <Bot className="h-4 w-4" />
                )}
            </div>

            {/* Message Content */}
            <div
                className={`max-w-[80%] space-y-2 ${isUser ? "items-end" : "items-start"}`}
            >
                {/* Images if any */}
                {images && images.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                        {images.map((img, idx) => (
                            <img
                                key={idx}
                                src={img}
                                alt={`Imagen ${idx + 1}`}
                                className="h-32 w-32 object-cover rounded-lg border border-border"
                            />
                        ))}
                    </div>
                )}

                {/* Audio indicator */}
                {isAudio && (
                    <div className={`flex items-center gap-2 text-xs text-muted-foreground ${isUser ? "justify-end" : ""}`}>
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                <line x1="12" x2="12" y1="19" y2="22" />
                            </svg>
                            Mensaje de voz
                        </span>
                    </div>
                )}

                {/* Text bubble */}
                {content && (
                    <div
                        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted rounded-bl-md"
                            }`}
                    >
                        <div
                            className="prose prose-sm max-w-none dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                            dangerouslySetInnerHTML={{ __html: formatMarkdown(content) }}
                        />
                        {isStreaming && (
                            <span className="inline-block w-2 h-4 bg-current animate-pulse ml-0.5 rounded-sm opacity-70" />
                        )}
                    </div>
                )}

                {/* Streaming cursor without text */}
                {isStreaming && !content && (
                    <div className="rounded-2xl px-4 py-3 text-sm bg-muted rounded-bl-md">
                        <span className="inline-block w-2 h-4 bg-foreground/50 animate-pulse rounded-sm" />
                    </div>
                )}

                {/* Timestamp */}
                {timestamp && !isStreaming && (
                    <p className={`text-[10px] text-muted-foreground px-1 ${isUser ? "text-right" : "text-left"}`}>
                        {timestamp.toLocaleTimeString("es-PR", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </p>
                )}
            </div>
        </div>
    );
}

export function ThinkingIndicator() {
    return (
        <div className="flex gap-3 animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
                <Sparkles className="h-4 w-4 animate-pulse" />
            </div>
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                    </div>
                    <span className="text-xs text-muted-foreground ml-1">
                        Analizando y buscando precios...
                    </span>
                </div>
            </div>
        </div>
    );
}

/** Enhanced markdown-to-HTML converter for chat messages with table support */
function formatMarkdown(text: string): string {
    // First, extract and process tables to protect them from other transformations
    const tables: string[] = [];
    let processedText = text;

    // Extract markdown tables
    const tableRegex = /(?:^|\n)((?:\|.*\|[ \t]*\n){2,})/g;
    processedText = processedText.replace(tableRegex, (match, tableBlock: string) => {
        const rows = tableBlock.trim().split("\n").filter((r: string) => r.trim());
        if (rows.length < 2) return match;

        let tableHtml = '<div class="overflow-x-auto my-3"><table class="w-full text-xs border-collapse">';

        rows.forEach((row: string, rowIdx: number) => {
            // Skip separator row (e.g., |---|---|)
            if (/^\|[\s\-:]+\|/.test(row.trim())) return;

            const cells = row
                .split("|")
                .slice(1, -1) // Remove first and last empty strings from split
                .map((c: string) => c.trim());

            const isHeader = rowIdx === 0;
            const tag = isHeader ? "th" : "td";
            const headerClass = isHeader
                ? 'class="text-left py-1.5 px-2 font-medium text-muted-foreground border-b border-border bg-muted/50"'
                : 'class="py-1.5 px-2 border-b border-border/50"';

            tableHtml += `<tr${!isHeader ? ' class="hover:bg-muted/30 transition-colors"' : ""}>`;
            cells.forEach((cell: string) => {
                // Apply bold/italic inside cells
                const cellContent = cell
                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                    .replace(/\*(.*?)\*/g, "<em>$1</em>");
                tableHtml += `<${tag} ${headerClass}>${cellContent}</${tag}>`;
            });
            tableHtml += "</tr>";
        });

        tableHtml += "</table></div>";
        const placeholder = `__TABLE_${tables.length}__`;
        tables.push(tableHtml);
        return `\n${placeholder}\n`;
    });

    let html = processedText
        // Escape HTML first
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        // Bold
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        // Italic
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        // Code inline
        .replace(/`(.*?)`/g, '<code class="bg-background/50 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
        // Headers
        .replace(/^### (.*$)/gm, '<h4 class="font-semibold text-sm mt-3 mb-1">$1</h4>')
        .replace(/^## (.*$)/gm, '<h3 class="font-semibold mt-3 mb-1">$1</h3>')
        .replace(/^# (.*$)/gm, '<h2 class="font-bold mt-3 mb-1">$1</h2>')
        // Unordered lists
        .replace(/^[\-\*] (.*$)/gm, '<li class="ml-4 list-disc">$1</li>')
        // Ordered lists
        .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')
        // Line breaks
        .replace(/\n\n/g, "</p><p class='mt-2'>")
        .replace(/\n/g, "<br/>");

    // Wrap in paragraph
    html = `<p>${html}</p>`;

    // Clean up list items
    html = html.replace(
        /(<li[^>]*>.*?<\/li>)\s*(<li)/g,
        "$1$2"
    );

    // Restore tables
    tables.forEach((table, idx) => {
        html = html.replace(`__TABLE_${idx}__`, table);
    });

    return html;
}
