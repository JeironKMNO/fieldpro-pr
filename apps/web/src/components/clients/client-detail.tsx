"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@fieldpro/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@fieldpro/ui/components/card";
import { Badge } from "@fieldpro/ui/components/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@fieldpro/ui/components/dialog";
import {
  ArrowLeft,
  Edit,
  Archive,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Navigation,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { ClientNotes } from "./client-notes";
import { ClientTags } from "./client-tags";
import { ClientQuotes } from "./client-quotes";

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isPrimary: boolean;
}

interface NoteUser {
  firstName: string | null;
  lastName: string | null;
}

interface Note {
  id: string;
  content: string;
  type: string;
  createdAt: Date;
  user: NoteUser;
}

interface TagRelation {
  tagId: string;
  tag: {
    id: string;
    name: string;
    color: string;
  };
}

interface ClientData {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  type: string;
  status: string;
  addresses: Address[];
  notes: Note[];
  tags: TagRelation[];
}

export function ClientDetail({ client }: { client: ClientData }) {
  const router = useRouter();
  const primaryAddress = client.addresses.find((a) => a.isPrimary);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const archiveClient = trpc.clients.archive.useMutation({
    onSuccess: () => {
      router.push("/clients");
      router.refresh();
    },
  });

  const deleteClient = trpc.clients.delete.useMutation({
    onSuccess: () => {
      router.push("/clients");
      router.refresh();
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/clients" className="shrink-0">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-heading text-2xl sm:text-3xl font-bold truncate">
                {client.name}
              </h1>
              <Badge
                variant={client.status === "ACTIVE" ? "default" : "secondary"}
              >
                {client.status}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              {client.type === "COMMERCIAL"
                ? "Cliente Comercial"
                : "Cliente Residencial"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:shrink-0">
          <Link href={`/clients/${client.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </Link>
          {client.status !== "ARCHIVED" && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => archiveClient.mutate({ id: client.id })}
              disabled={archiveClient.isPending}
            >
              <Archive className="mr-2 h-4 w-4" />
              {archiveClient.isPending ? "Archivando..." : "Archivar"}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {client.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Correo</p>
                    <p className="font-medium">{client.email}</p>
                  </div>
                </div>
              )}

              {client.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <p className="font-medium">{client.phone}</p>
                  </div>
                </div>
              )}

              {primaryAddress &&
                (() => {
                  const fullAddress = `${primaryAddress.street}, ${primaryAddress.city}, ${primaryAddress.state} ${primaryAddress.zipCode}`;
                  const encoded = encodeURIComponent(fullAddress);
                  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
                  const wazeUrl = `https://waze.com/ul?q=${encoded}&navigate=yes`;

                  return (
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-1 h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Dirección
                        </p>
                        <p className="font-medium">
                          {primaryAddress.street}
                          <br />
                          {primaryAddress.city}, {primaryAddress.state}{" "}
                          {primaryAddress.zipCode}
                        </p>
                        <div className="mt-2 flex gap-2">
                          <a
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Google Maps
                          </a>
                          <a
                            href={wazeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-md bg-cyan-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-cyan-600"
                          >
                            <Navigation className="h-3 w-3" />
                            Waze
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })()}

              {!client.email && !client.phone && !primaryAddress && (
                <p className="text-sm text-muted-foreground">
                  Aún no se ha agregado información de contacto.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          <ClientTags clientId={client.id} initialTags={client.tags} />

          {/* Quotes */}
          <ClientQuotes clientId={client.id} />
        </div>

        {/* Notes */}
        <div>
          <ClientNotes clientId={client.id} initialNotes={client.notes} />
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Eliminar cliente permanentemente
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-sm text-muted-foreground">
            <p>
              Estás a punto de eliminar a{" "}
              <span className="font-semibold text-foreground">
                {client.name}
              </span>{" "}
              de forma permanente. Esta acción no se puede deshacer.
            </p>
            <p>Se eliminarán también todos los datos asociados:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Trabajos (jobs) y sus gastos, tareas y fotos</li>
              <li>Facturas e historial de facturación</li>
              <li>Cotizaciones y propuestas</li>
              <li>Notas y etiquetas</li>
            </ul>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleteClient.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteClient.mutate({ id: client.id })}
              disabled={deleteClient.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleteClient.isPending
                ? "Eliminando..."
                : "Sí, eliminar cliente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
