"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@fieldpro/ui/lib/utils";
import { Card } from "@fieldpro/ui/components/card";
import { Button } from "@fieldpro/ui/components/button";
import {
  Search,
  MapPin,
  Mail,
  Phone,
  SlidersHorizontal,
  ArrowUpDown,
  Navigation,
  ExternalLink,
} from "lucide-react";

type ClientType = "RESIDENTIAL" | "COMMERCIAL";
type ClientStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";
type SortBy = "name" | "createdAt" | "updatedAt";
type SortOrder = "asc" | "desc";

export function ClientList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ClientType | "">("");
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "">("");
  const [tagFilter, setTagFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [showFilters, setShowFilters] = useState(false);

  const tags = trpc.tag.list.useQuery();

  const { data, isLoading } = trpc.clients.list.useQuery({
    page,
    limit: 20,
    search: search || undefined,
    type: typeFilter || undefined,
    status: statusFilter || undefined,
    tagId: tagFilter || undefined,
    sortBy,
    sortOrder,
  });

  const toggleSort = (field: SortBy) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6">
              <div className="space-y-3">
                <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search + Filter Toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar clientes..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <Button
          variant={showFilters ? "secondary" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filtros
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 rounded-lg border p-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Tipo
            </label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as ClientType | "");
                setPage(1);
              }}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            >
              <option value="">Todos</option>
              <option value="RESIDENTIAL">Residencial</option>
              <option value="COMMERCIAL">Comercial</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as ClientStatus | "");
                setPage(1);
              }}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            >
              <option value="">Todos</option>
              <option value="ACTIVE">Activo</option>
              <option value="INACTIVE">Inactivo</option>
              <option value="ARCHIVED">Archivado</option>
            </select>
          </div>

          {tags.data && tags.data.length > 0 && (
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Etiqueta
              </label>
              <select
                value={tagFilter}
                onChange={(e) => {
                  setTagFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
              >
                <option value="">Todas</option>
                {tags.data.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name} ({tag._count.clients})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Ordenar
            </label>
            <div className="flex gap-1">
              {(
                [
                  ["name", "Name"],
                  ["createdAt", "Created"],
                  ["updatedAt", "Updated"],
                ] as const
              ).map(([field, label]) => {
                const labelMap = {
                  name: "Nombre",
                  createdAt: "Creado",
                  updatedAt: "Actualizado",
                } as const;
                const displayLabel = labelMap[field as keyof typeof labelMap];
                return (
                  <button
                    key={field}
                    onClick={() => toggleSort(field)}
                    className={cn(
                      "flex items-center gap-1 rounded-md px-2 py-1.5 text-xs transition-colors",
                      sortBy === field
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                  >
                    {displayLabel}
                    {sortBy === field && (
                      <ArrowUpDown className="h-3 w-3" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {(typeFilter || statusFilter || tagFilter) && (
            <div className="flex items-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTypeFilter("");
                  setStatusFilter("");
                  setTagFilter("");
                  setPage(1);
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Results count */}
      {data && (
        <p className="text-sm text-muted-foreground">
          {data.pagination.total} cliente{data.pagination.total !== 1 ? "s" : ""}
          {search && ` encontrados "${search}"`}
        </p>
      )}

      {/* Client Grid */}
      {!data?.clients.length ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            {search || typeFilter || statusFilter || tagFilter
              ? "Ningún cliente coincide con los filtros."
              : "Sin clientes aún. Agrega tu primer cliente para comenzar."}
          </p>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.clients.map((client) => {
              const primaryAddress = client.addresses[0];
              return (
                <Link key={client.id} href={`/clients/${client.id}`}>
                  <Card className="cursor-pointer p-6 transition-shadow hover:shadow-md">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-heading font-semibold text-base leading-tight">{client.name}</h3>
                          <span
                            className={cn(
                              "text-xs font-medium",
                              client.type === "COMMERCIAL"
                                ? "text-gold-600"
                                : "text-steel-500"
                            )}
                          >
                            {client.type === "COMMERCIAL" ? "Comercial" : "Residencial"}
                          </span>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                            client.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700"
                              : client.status === "INACTIVE"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-muted text-muted-foreground"
                          )}
                        >
                          {client.status === "ACTIVE" ? "Activo" : client.status === "INACTIVE" ? "Inactivo" : "Archivado"}
                        </span>
                      </div>

                      {/* Tags */}
                      {client.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {client.tags.map(({ tag, tagId }) => (
                            <span
                              key={tagId}
                              className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                              style={{ backgroundColor: tag.color }}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {primaryAddress && (() => {
                        const addr = `${primaryAddress.street}, ${primaryAddress.city}, PR`;
                        const encoded = encodeURIComponent(addr);
                        return (
                          <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            <span className="flex-1">
                              {primaryAddress.street}, {primaryAddress.city}
                            </span>
                            <span className="flex gap-1" onClick={(e) => e.preventDefault()}>
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encoded}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Google Maps"
                                className="rounded p-0.5 text-blue-600 transition-colors hover:bg-blue-100"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                              <a
                                href={`https://waze.com/ul?q=${encoded}&navigate=yes`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Waze"
                                className="rounded p-0.5 text-cyan-600 transition-colors hover:bg-cyan-100"
                              >
                                <Navigation className="h-3.5 w-3.5" />
                              </a>
                            </span>
                          </div>
                        );
                      })()}

                      {client.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{client.email}</span>
                        </div>
                      )}

                      {client.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span>{client.phone}</span>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        {client._count.notes} notas
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Página {page} de {data.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.pagination.totalPages}
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
