"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@fieldpro/ui/components/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@fieldpro/ui/components/card";
import {
    Briefcase,
    X,
    Loader2,
    Calendar,
    User,
    FileText,
} from "lucide-react";

interface CreateJobDialogProps {
    onClose: () => void;
    onCreated: (jobId: string) => void;
    /** Pre-fill from a quote */
    fromQuote?: {
        quoteId: string;
        clientId: string;
        clientName: string;
        title: string;
    };
}

export function CreateJobDialog({
    onClose,
    onCreated,
    fromQuote,
}: CreateJobDialogProps) {
    const [clientId, setClientId] = useState(fromQuote?.clientId ?? "");
    const [clientSearch, setClientSearch] = useState(fromQuote?.clientName ?? "");
    const [title, setTitle] = useState(fromQuote?.title ?? "");
    const [scheduledDate, setScheduledDate] = useState("");
    const [notes, setNotes] = useState("");
    const [showClientDropdown, setShowClientDropdown] = useState(false);

    // Search clients
    const { data: clientsData } = trpc.clients.list.useQuery(
        { page: 1, limit: 10, search: clientSearch || undefined },
        { enabled: !fromQuote && clientSearch.length > 0 }
    );

    const createJob = trpc.job.create.useMutation({
        onSuccess: (job) => {
            onCreated(job.id);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientId) return;

        createJob.mutate({
            clientId,
            title: title || undefined,
            scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
            notes: notes || undefined,
            quoteId: fromQuote?.quoteId,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-lg mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <Briefcase className="h-5 w-5 text-white" />
                        </div>
                        Nuevo Trabajo
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Client Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5 text-muted-foreground" />
                                Cliente *
                            </label>
                            {fromQuote ? (
                                <div className="flex items-center gap-2 p-2.5 rounded-md border border-input bg-muted/50">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">{fromQuote.clientName}</span>
                                    {fromQuote.quoteId && (
                                        <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                                            <FileText className="h-3 w-3" />
                                            Desde Cotización
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={clientSearch}
                                        onChange={(e) => {
                                            setClientSearch(e.target.value);
                                            setClientId("");
                                            setShowClientDropdown(true);
                                        }}
                                        onFocus={() => setShowClientDropdown(true)}
                                        placeholder="Buscar cliente..."
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    />
                                    {showClientDropdown && clientsData?.clients && clientsData.clients.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-md border border-border bg-background shadow-lg max-h-48 overflow-y-auto">
                                            {clientsData.clients.map((c) => (
                                                <button
                                                    key={c.id}
                                                    type="button"
                                                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                                                    onClick={() => {
                                                        setClientId(c.id);
                                                        setClientSearch(c.name);
                                                        setShowClientDropdown(false);
                                                    }}
                                                >
                                                    <span className="font-medium">{c.name}</span>
                                                    {c.email && (
                                                        <span className="text-muted-foreground ml-2">
                                                            {c.email}
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Title */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-1.5">
                                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                                Título del Trabajo
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="ej. Remodelación de Cocina, Reparación de Techo..."
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>

                        {/* Scheduled Date */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                Fecha Programada
                            </label>
                            <input
                                type="date"
                                value={scheduledDate}
                                onChange={(e) => setScheduledDate(e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Notas</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                placeholder="Instrucciones o detalles especiales..."
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                            <Button
                                type="submit"
                                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                                disabled={!clientId || createJob.isPending}
                            >
                                {createJob.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creando...
                                    </>
                                ) : (
                                    <>
                                        <Briefcase className="mr-2 h-4 w-4" />
                                        Crear Trabajo
                                    </>
                                )}
                            </Button>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                        </div>

                        {createJob.isError && (
                            <p className="text-sm text-destructive mt-2">
                                {createJob.error.message}
                            </p>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
