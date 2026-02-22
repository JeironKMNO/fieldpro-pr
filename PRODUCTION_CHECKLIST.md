# 🚀 FieldPro PR - Checklist de Producción

## Pre-Deploy Checklist

### ✅ 1. Variables de Entorno Configuradas

#### Clerk Authentication (Obligatorio)

- [ ] Crear cuenta en [Clerk Dashboard](https://dashboard.clerk.com)
- [ ] Crear nueva aplicación
- [ ] Configurar URLs permitidas:
  - Production: `https://tu-dominio.com`
  - Development: `http://localhost:3000`
- [ ] Copiar Publishable Key (pk*live*...)
- [ ] Copiar Secret Key (sk*live*...)
- [ ] Agregar a Vercel Environment Variables

#### Database - Supabase (Obligatorio)

- [ ] Crear proyecto en [Supabase](https://app.supabase.com)
- [ ] Ir a Settings > Database
- [ ] Copiar Connection String (Transaction Pooler)
- [ ] Agregar a Vercel como `DATABASE_URL`
- [ ] Copiar Connection String (Session Mode)
- [ ] Agregar a Vercel como `DIRECT_URL`
- [ ] Ejecutar migraciones de Prisma en producción

#### AI Services (Obligatorio - al menos uno)

- [ ] **OpenAI**: Crear API key en [OpenAI Platform](https://platform.openai.com)
- [ ] **Google Gemini**: Crear API key en [Google AI Studio](https://aistudio.google.com)
- [ ] Configurar `AI_PROVIDER=openai` o `gemini`
- [ ] Agregar API keys a Vercel

#### Email - Resend (Obligatorio)

- [ ] Crear cuenta en [Resend](https://resend.com)
- [ ] Verificar dominio (o usar resend.dev para testing)
- [ ] Crear API key
- [ ] Agregar a Vercel como `RESEND_API_KEY`

### ✅ 2. Base de Datos Lista

```bash
# Ejecutar en producción después del primer deploy
cd packages/db

# Generar cliente Prisma
pnpm db:generate

# Deploy migraciones
pnpm db:deploy
# o
npx prisma migrate deploy

# Verificar conexión
npx prisma db pull
```

### ✅ 3. Configuración de Build

- [ ] Verificar que `next.config.ts` tenga configuración correcta
- [ ] Ejecutar build local sin errores:
  ```bash
  pnpm build
  ```
- [ ] Verificar que no hay errores de TypeScript:
  ```bash
  pnpm type-check
  ```

### ✅ 4. Preparar Vercel

- [ ] Crear cuenta en [Vercel](https://vercel.com)
- [ ] Conectar con GitHub
- [ ] Importar repositorio
- [ ] Configurar Root Directory: `./`
- [ ] Agregar todas las Environment Variables
- [ ] Deploy!

### ✅ 5. Post-Deploy Verificación

- [ ] Landing page carga correctamente
- [ ] Sign up funciona
- [ ] Login funciona
- [ ] Dashboard carga datos
- [ ] Crear cliente funciona
- [ ] Crear cotización funciona
- [ ] AI Assistant responde
- [ ] Emails se envían (si están configurados)

### ✅ 6. Dominio Personalizado (Opcional)

- [ ] Comprar dominio (Namecheap, GoDaddy, etc.)
- [ ] Configurar en Vercel: Settings > Domains
- [ ] Actualizar DNS del dominio
- [ ] Configurar SSL (automático en Vercel)
- [ ] Actualizar Clerk URLs permitidas con nuevo dominio

### ✅ 7. Monitoreo (Opcional pero recomendado)

- [ ] Configurar Sentry para error tracking
- [ ] Configurar analytics (PostHog, Mixpanel, o Google Analytics)
- [ ] Verificar logs en Vercel Dashboard

## Costos Mensuales Estimados

| Servicio  | Free Tier            | Costo Real    |
| --------- | -------------------- | ------------- |
| Vercel    | 100GB bandwidth      | $0            |
| Supabase  | 500MB + 2GB transfer | $0            |
| Clerk     | 10,000 MAU           | $0            |
| Resend    | 100 emails/day       | $0            |
| OpenAI    | Variable             | ~$5-20        |
| Dominio   | -                    | ~$10/año      |
| **TOTAL** |                      | **$0-25/mes** |

## Scripts Útiles

```bash
# Verificar configuración antes de deployar
node scripts/pre-deploy-check.js

# Build local
pnpm build

# Type checking
pnpm type-check

# Deploy a Vercel (si tienes CLI)
vercel --prod
```

## Troubleshooting Común

### Error: "Database connection failed"

- Verificar que `DATABASE_URL` usa Transaction Pooler (port 6543)
- Verificar que `DIRECT_URL` usa Session Mode (port 5432)

### Error: "Clerk keys invalid"

- Asegurar que usas `pk_live_` y `sk_live_` (no `pk_test_`)
- Verificar URLs permitidas en Clerk Dashboard

### Error: "Build failed"

- Ejecutar `pnpm install` para refrescar dependencias
- Verificar que no hay errores de TypeScript

## Contacto y Soporte

- Vercel: [vercel.com/support](https://vercel.com/support)
- Clerk: [clerk.com/support](https://clerk.com/support)
- Supabase: [supabase.com/support](https://supabase.com/support)
