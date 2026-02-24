# Configuración de Resend para FieldPro

Esta guía te ayudará a configurar Resend para enviar emails desde FieldPro.

## 1. Crear cuenta en Resend

1. Ve a [resend.com](https://resend.com) y regístrate
2. Es gratis hasta 3,000 emails/mes

## 2. Obtener API Key

1. En el dashboard de Resend, ve a **API Keys**
2. Haz clic en **Create API Key**
3. Nombre: `FieldPro Production` (o el que prefieras)
4. Permission: `Sending access`
5. Copia la API key (empieza con `re_`)

## 3. Configurar Dominio (Obligatorio para producción)

Para que los emails no vayan a spam, necesitas verificar tu dominio:

### Opción A: Usar tu dominio propio (Recomendado)

1. En Resend, ve a **Domains** → **Add Domain**
2. Ingresa tu dominio: `tudominio.com`
3. Resend te dará 3 registros DNS:
   - **DKIM**: Firma digital de tus emails
   - **SPF**: Autoriza a Resend a enviar por tu dominio
   - **DMARC**: Política de seguridad

4. Agrega estos registros en tu proveedor DNS (Cloudflare, GoDaddy, etc.)
5. Espera 5-10 minutos y verifica en Resend

### Opción B: Usar dominio de Resend (Para pruebas rápidas)

Si solo quieres probar sin configurar DNS:

1. Resend te da un dominio como `resend.dev`
2. Solo puedes enviar a emails que verifiques previamente
3. No recomendado para producción

## 4. Configurar "From" Email

En `apps/web/src/server/services/email.ts`, actualiza:

```typescript
const FROM_EMAIL = "FieldPro <noreply@tudominio.com>";
```

Reemplaza `tudominio.com` con tu dominio verificado.

## 5. Environment Variables

Agrega estas variables en tu archivo `.env.local` y en Vercel:

```bash
# Resend API Key
RESEND_API_KEY=re_tu_api_key_aqui

# URL de la app (necesaria para links)
NEXT_PUBLIC_APP_URL=https://tudominio.com
```

## 6. Probar el envío de emails

### Test desde la UI:

1. Ve a una cotización
2. Haz clic en **Enviar**
3. Elige enviar por email
4. Verifica que llegue correctamente

### Test desde API (opcional):

```bash
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "FieldPro <noreply@tudominio.com>",
    "to": ["test@email.com"],
    "subject": "Test FieldPro",
    "html": "<p>¡Funciona!</p>"
  }'
```

## 7. Emails Disponibles

### Cotizaciones:

- ✅ Enviar cotización al cliente
- ✅ Notificación cuando cliente ve la cotización
- ✅ Notificación de aceptación/rechazo
- ✅ Recordatorio de seguimiento
- ✅ Recordatorio de expiración

### Facturas:

- ✅ Enviar factura al cliente
- ✅ Confirmación de pago recibido
- ✅ Recordatorio de factura vencida

## 8. Troubleshooting

### Emails van a Spam:

- Verifica que tu dominio esté configurado correctamente
- Configura DKIM, SPF y DMARC
- No uses lenguaje spammy en los emails

### "Domain not verified":

- Asegúrate de completar la verificación DNS
- Los cambios DNS pueden tardar hasta 24 horas

### Error "From address not verified":

- El email "from" debe coincidir exactamente con tu dominio verificado

### Límites de envío:

- Gratis: 3,000 emails/mes
- Pro: $20/mes por 50,000 emails

## 9. Configuración en Vercel

1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. **Settings** → **Environment Variables**
3. Agrega:
   - `RESEND_API_KEY` = `re_tu_api_key`
   - `NEXT_PUBLIC_APP_URL` = `https://tudominio.com`
4. Haz **Redeploy**

## Soporte

¿Problemas? Contacta a soporte de Resend o revisa su [documentación](https://resend.com/docs).
