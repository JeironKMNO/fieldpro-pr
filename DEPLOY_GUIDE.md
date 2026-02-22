# 🚀 Guía de Deploy Rápido - FieldPro PR

## Opción 1: Deploy Automático con Vercel (Recomendado)

### Paso 1: Preparar tu código

```bash
# Asegurar que todo está commiteado en Git
git add .
git commit -m "Listo para producción"
git push origin main
```

### Paso 2: Configurar Vercel

1. Ve a [vercel.com](https://vercel.com) y login con GitHub
2. Click "Add New Project"
3. Importa tu repositorio de GitHub
4. Configurar:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (o `apps/web` si tienes monorepo)
   - **Build Command**: `pnpm build` o `cd apps/web && pnpm build`

### Paso 3: Variables de Entorno

En el dashboard de Vercel, agrega estas variables:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_XXX
CLERK_SECRET_KEY=sk_live_XXX
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
OPENAI_API_KEY=sk-proj-XXX
RESEND_API_KEY=re_XXX
NEXT_PUBLIC_APP_URL=https://tu-app.vercel.app
AI_PROVIDER=openai
```

### Paso 4: Deploy

Click "Deploy" y espera ~2-3 minutos.

Tu app estará en: `https://tu-app.vercel.app`

---

## Opción 2: Deploy con Vercel CLI

```bash
# Instalar CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## Configuración Post-Deploy

### 1. Base de Datos (Primera vez)

```bash
# Ir a tu proyecto Vercel > Settings > Environment Variables
# Agregar DATABASE_URL y DIRECT_URL

# Luego ejecutar migraciones:
npx prisma migrate deploy
# o
npx prisma db push
```

### 2. Clerk (Autenticación)

1. Ve a [Clerk Dashboard](https://dashboard.clerk.com)
2. Selecciona tu app
3. Ve a Settings > URLs
4. Agrega tu dominio de Vercel:
   - `https://tu-app.vercel.app`
   - `https://*.vercel.app` (para previews)

### 3. Dominio Personalizado (Opcional)

1. Compra dominio en Namecheap/GoDaddy
2. En Vercel: Settings > Domains
3. Agrega tu dominio
4. Copia los DNS records que te da Vercel
5. Pega en tu proveedor de dominio
6. Espera 24-48 horas (usualmente es inmediato)

---

## Costos

| Servicio     | Gratis          | Cuándo pagar      |
| ------------ | --------------- | ----------------- |
| Vercel       | 100GB/mes       | +100GB: $20/mes   |
| Supabase DB  | 500MB           | +500MB: $25/mes   |
| Clerk Auth   | 10,000 usuarios | +10k: $25/mes     |
| Resend Email | 100/día         | +100/día: $20/mes |
| OpenAI       | $5 crédito      | Por uso           |
| Dominio      | -               | ~$10/año          |

**Para empezar: $0/mes**

---

## Troubleshooting

### Build falla

```bash
# Limpiar cache local
rm -rf .next
rm -rf node_modules
pnpm install
pnpm build
```

### Error de base de datos

- Verificar que `DATABASE_URL` usa el puerto 6543 (Transaction Pooler)
- Verificar que `DIRECT_URL` usa el puerto 5432 (Session Mode)

### Error de Clerk

- Asegurar que usas `pk_live_` (no `pk_test_`)
- Verificar que el dominio está en la lista de allowed URLs

---

## Comandos útiles

```bash
# Verificar configuración
node scripts/pre-deploy-check.js

# Build local
pnpm build

# Ver logs en Vercel
vercel logs

# Abrir deploy en browser
vercel open
```

## Soporte

- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Next.js Deploy: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- Clerk + Vercel: [clerk.com/docs/deployments/overview](https://clerk.com/docs/deployments/overview)
