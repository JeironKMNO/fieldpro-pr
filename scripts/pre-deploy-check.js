#!/usr/bin/env node
/**
 * Pre-deploy Check Script
 * Verifica que todo esté configurado correctamente antes de deployar
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'DATABASE_URL',
  'DIRECT_URL',
  'OPENAI_API_KEY',
  'RESEND_API_KEY',
];

const OPTIONAL_ENV_VARS = [
  'GEMINI_API_KEY',
  'SERPAPI_API_KEY',
  'NEXT_PUBLIC_APP_URL',
];

console.log('🔍 FieldPro PR - Pre-deploy Check\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '../apps/web/.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local no encontrado');
  console.log('   Crear archivo .env.local basado en .env.example\n');
  process.exit(1);
}

// Read env file
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([A-Z_]+)=(.+)$/);
  if (match) {
    envVars[match[1]] = match[2].replace(/^["'](.+)["']$/, '$1');
  }
});

let hasErrors = false;
let hasWarnings = false;

// Check required vars
console.log('📋 Variables Requeridas:');
REQUIRED_ENV_VARS.forEach(varName => {
  const value = envVars[varName];
  if (!value || value.includes('...') || value.includes('XXXX')) {
    console.log(`   ❌ ${varName} - No configurada`);
    hasErrors = true;
  } else {
    const masked = value.length > 20 
      ? `${value.substring(0, 10)}...${value.substring(value.length - 5)}`
      : '***';
    console.log(`   ✅ ${varName} - ${masked}`);
  }
});

console.log('\n📋 Variables Opcionales:');
OPTIONAL_ENV_VARS.forEach(varName => {
  const value = envVars[varName];
  if (!value || value.includes('XXXX')) {
    console.log(`   ⚠️  ${varName} - No configurada (opcional)`);
    hasWarnings = true;
  } else {
    console.log(`   ✅ ${varName} - Configurada`);
  }
});

// Check specific configurations
console.log('\n🔐 Verificaciones de Seguridad:');

// Check Clerk keys are production
const clerkKey = envVars['NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'] || '';
if (clerkKey.includes('pk_test_')) {
  console.log('   ⚠️  CLERK: Usando keys de TEST (cambiar a LIVE para producción)');
  hasWarnings = true;
} else if (clerkKey.includes('pk_live_')) {
  console.log('   ✅ CLERK: Usando keys de PRODUCCIÓN');
}

// Check database is Supabase
const dbUrl = envVars['DATABASE_URL'] || '';
if (dbUrl.includes('supabase.co')) {
  console.log('   ✅ DATABASE: Configurada con Supabase');
} else if (!dbUrl) {
  console.log('   ❌ DATABASE: No configurada');
  hasErrors = true;
} else {
  console.log('   ⚠️  DATABASE: Usando provider diferente a Supabase');
}

// Check app URL
const appUrl = envVars['NEXT_PUBLIC_APP_URL'] || '';
if (!appUrl || appUrl.includes('localhost')) {
  console.log('   ⚠️  APP_URL: Usando localhost (cambiar para producción)');
  hasWarnings = true;
} else {
  console.log(`   ✅ APP_URL: ${appUrl}`);
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ VERIFICACIÓN FALLIDA - Corregir errores antes de deployar');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  VERIFICACIÓN CON ADVERTENCIAS - Puedes deployar pero revisar warnings');
  process.exit(0);
} else {
  console.log('✅ TODO LISTO PARA PRODUCCIÓN');
  process.exit(0);
}
