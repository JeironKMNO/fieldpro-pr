"use client";

import { useState, useRef } from "react";
import { useUser, useOrganization } from "@clerk/nextjs";
import { trpc } from "@/lib/trpc/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@fieldpro/ui/components/card";
import { Badge } from "@fieldpro/ui/components/badge";
import { Button } from "@fieldpro/ui/components/button";
import { Input } from "@fieldpro/ui/components/input";
import {
  User,
  Building2,
  Users,
  Shield,
  Upload,
  Save,
  Loader2,
  X,
  ImageIcon,
  Bell,
} from "lucide-react";

function FollowUpSettingsCard() {
  const { data: settings, isLoading } =
    trpc.organization.followUpSettings.useQuery();
  const utils = trpc.useUtils();

  const [followUpDays, setFollowUpDays] = useState(2);
  const [expiryReminderDays, setExpiryReminderDays] = useState(3);
  const [autoFollowUp, setAutoFollowUp] = useState(true);
  const [saved, setSaved] = useState(false);
  const settingsInit = useRef(false);

  if (settings && !settingsInit.current) {
    settingsInit.current = true;
    setFollowUpDays(settings.followUpDays);
    setExpiryReminderDays(settings.expiryReminderDays);
    setAutoFollowUp(settings.autoFollowUp);
  }

  const updateSettings = trpc.organization.updateFollowUpSettings.useMutation({
    onSuccess: () => {
      utils.organization.followUpSettings.invalidate();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const handleSaveFollowUp = () => {
    updateSettings.mutate({ followUpDays, expiryReminderDays, autoFollowUp });
  };

  if (isLoading) {
    return (
      <Card className="md:col-span-2">
        <CardHeader>
          <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="h-20 w-full animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Follow-up Automático</CardTitle>
        </div>
        <CardDescription>
          Configura los recordatorios automáticos para cotizaciones pendientes.
          El sistema enviará emails de follow-up a clientes que no han
          respondido.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-3">
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={autoFollowUp}
              onChange={(e) => setAutoFollowUp(e.target.checked)}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 dark:bg-gray-700" />
          </label>
          <div>
            <p className="text-sm font-medium">Follow-ups automáticos</p>
            <p className="text-xs text-muted-foreground">
              Enviar recordatorios automáticos por email a clientes con
              cotizaciones pendientes
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Días para follow-up
            </label>
            <Input
              type="number"
              min={1}
              max={14}
              value={followUpDays}
              onChange={(e) => setFollowUpDays(Number(e.target.value))}
              disabled={!autoFollowUp}
            />
            <p className="text-xs text-muted-foreground">
              Enviar follow-up si el cliente no ha visto la cotización después
              de estos días
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Días para recordatorio de vencimiento
            </label>
            <Input
              type="number"
              min={1}
              max={14}
              value={expiryReminderDays}
              onChange={(e) => setExpiryReminderDays(Number(e.target.value))}
              disabled={!autoFollowUp}
            />
            <p className="text-xs text-muted-foreground">
              Enviar recordatorio al cliente cuando falten estos días para
              que la cotización expire
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleSaveFollowUp}
            disabled={updateSettings.isPending}
          >
            {updateSettings.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Guardar
          </Button>
          {saved && (
            <span className="text-sm text-green-600 animate-in fade-in">
              Guardado
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const { user } = useUser();
  const { organization, membership } = useOrganization();
  const { data: orgData } = trpc.organization.current.useQuery();
  const utils = trpc.useUtils();

  const updateOrg = trpc.organization.update.useMutation({
    onSuccess: () => {
      utils.organization.current.invalidate();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  const [phone, setPhone] = useState<string>("");
  const [license, setLicense] = useState<string>("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const initialized = useRef(false);

  // Sync form state when orgData loads
  if (orgData && !initialized.current) {
    initialized.current = true;
    setPhone(orgData.phone ?? "");
    setLicense(orgData.license ?? "");
    setLogoPreview(orgData.logoUrl ?? null);
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Logo demasiado grande. Máximo 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateOrg.mutate({
      logoUrl: logoPreview,
      phone: phone || null,
      license: license || null,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">
          Administra tu cuenta y configuración de la organización
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Perfil</CardTitle>
            </div>
            <CardDescription>Tu información personal de cuenta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {user?.imageUrl && (
                <img
                  src={user.imageUrl}
                  alt="Profile"
                  className="h-16 w-16 rounded-full"
                />
              )}
              <div>
                <p className="font-semibold">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              <div>
                <p className="text-sm text-muted-foreground">ID de Usuario</p>
                <p className="text-sm font-mono">{user?.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Registrado</p>
                <p className="text-sm">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Organización</CardTitle>
            </div>
            <CardDescription>Tu organización actual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {organization?.imageUrl && (
                <img
                  src={organization.imageUrl}
                  alt="Organization"
                  className="h-16 w-16 rounded-lg"
                />
              )}
              <div>
                <p className="font-semibold">
                  {organization?.name ?? "Sin organización"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {organization?.slug}
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Tu Rol</p>
                <Badge variant="secondary">
                  {membership?.role ?? "member"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Miembros</p>
                <p className="text-sm">
                  {organization?.membersCount ?? 0} miembros
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Branding & Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Marca de Empresa</CardTitle>
            </div>
            <CardDescription>
              Logo, teléfono e información de licencia. El logo aparece en todas las cotizaciones y facturas PDF.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Logo Upload */}
              <div className="space-y-3">
                <p className="text-sm font-medium">Logo de Empresa</p>
                <div className="flex items-center gap-4">
                  {logoPreview ? (
                    <div className="relative group">
                      <img
                        src={logoPreview}
                        alt="Company Logo"
                        className="h-20 w-20 rounded-lg border object-contain bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setLogoPreview(null)}
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="h-20 w-20 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-colors"
                      onClick={() => logoInputRef.current?.click()}
                    >
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <div className="space-y-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => logoInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {logoPreview ? "Cambiar Logo" : "Subir Logo"}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG o WebP. Máx 2MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Phone & License */}
              <div className="flex-1 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Teléfono</label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(787) 555-0123"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Licencia #</label>
                  <Input
                    value={license}
                    onChange={(e) => setLicense(e.target.value)}
                    placeholder="OGPE-12345"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={handleSave} disabled={updateOrg.isPending}>
                {updateOrg.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Guardar Cambios
              </Button>
              {saveSuccess && (
                <span className="text-sm text-green-600 animate-in fade-in">
                  Guardado exitosamente
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Follow-up Settings */}
        <FollowUpSettingsCard />

        {/* Team Members */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Gestión de Equipo</CardTitle>
            </div>
            <CardDescription>
              Invita miembros del equipo y administra roles. Usa el selector de organización
              en la barra superior para gestionar tu equipo a través de Clerk.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Shield className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">
                La gestión de equipo se maneja a través de la configuración de tu organización.
                Haz clic en el selector de organización en la barra superior para invitar miembros,
                administrar roles (Admin, Gerente, Cuadrilla) y configurar tu equipo.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
