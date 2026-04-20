# Guía de despliegue — Ayudafema

Esta guía te lleva del repositorio a una aplicación en línea, sin tener
que saber programar. Todo se hace con cuentas gratuitas y dos comandos.

Si en algún paso algo no funciona, consulta `docs/RUNBOOK.md` (en inglés)
para ver qué revisar primero.

---

## 1. Cuentas que necesitas

Crea cuenta gratis en cada servicio antes de empezar. Anótalas en un
gestor de contraseñas — vas a copiar valores entre pestañas.

1. **GitHub** — https://github.com
   Aquí vive el código.

2. **Supabase** — https://supabase.com
   La base de datos, el almacenamiento de archivos y las funciones del
   backend. Plan gratuito alcanza para los primeros meses.

3. **Cloudflare** — https://dash.cloudflare.com/sign-up
   Aloja la interfaz web de Ayudafema. Gratis para tráfico bajo.

4. **OpenRouter** — https://openrouter.ai
   Ruta las llamadas a los modelos de IA (Haiku, Sonnet, Opus). Se paga
   solo por uso, sin mínimo mensual. Carga $5 para empezar.

5. **OpenAI** — https://platform.openai.com
   Solo para generar los *embeddings* de la base regulatoria una vez.
   Costo aproximado: $0.01 por la semilla inicial.

6. **Twilio** — https://www.twilio.com/try-twilio
   SMS para los recordatorios de plazo. Verifica la cuenta con tu
   celular y solicita un número de Puerto Rico (+1 787 o +1 939).

7. **Sentry** (opcional) — https://sentry.io
   Captura errores. Puedes dejarlo en blanco al principio.

---

## 2. Herramientas en tu computadora

Solo dos programas hacen falta. Instala ambos antes de seguir.

**Node 20 o más nuevo**
https://nodejs.org — escoge la versión "LTS". Abre una terminal y
verifica con `node -v`; debe decir `v20.x.x` o superior.

**Supabase CLI**
https://supabase.com/docs/guides/cli/getting-started — la página
muestra el comando según tu sistema operativo (macOS: `brew install
supabase/tap/supabase`; Windows con Scoop: `scoop install supabase`;
Linux: `npm install -g supabase`).

Verifica con `supabase --version`.

---

## 3. Clona el repositorio

```
git clone https://github.com/buildinsilencedev/ayudafema.git
cd ayudafema
npm install
```

---

## 4. Llena `.env.local`

Copia el archivo de plantilla:

```
cp .env.example .env.local
```

Abre `.env.local` en un editor de texto. Cada variable tiene al lado la
ruta exacta del panel donde la encuentras. Por ejemplo:

- `VITE_SUPABASE_URL` — Supabase → Project Settings → API → Project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase → Project Settings → API → anon
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase → Project Settings → API →
  service_role (trátala como una contraseña; nunca la compartas)
- `OPENROUTER_API_KEY` — OpenRouter → Keys → Create Key
- `OPENAI_API_KEY` — OpenAI → API keys → Create new secret key
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`,
  `TWILIO_MESSAGING_SERVICE_SID` — Twilio Console

Guarda el archivo. Nunca lo subas a GitHub — ya está en `.gitignore`.

---

## 5. Un solo comando despliega todo el backend

Desde la terminal, dentro del repositorio:

```
npm run bootstrap
```

Este comando hace por ti:

1. Verifica que Node y Supabase CLI estén instalados.
2. Te pregunta el *project-ref* de tu proyecto Supabase la primera vez
   (Project Settings → General → Reference ID).
3. Aplica las migraciones de base de datos.
4. Sube los secretos (`OPENROUTER_API_KEY`, `OPENAI_API_KEY`, Twilio…)
   a las funciones de Supabase.
5. Despliega las funciones (`parseDenialLetter`, `draftAppeal`,
   `sendSMS`, `scheduleReminders`, `smsWebhook`, `purgeOldCases`).
6. Siembra la base regulatoria en `knowledge_base`.
7. Corre las pruebas de verificación.

Si algo falla, puedes volver a correr `npm run bootstrap`. Los pasos
que ya se hicieron no se repiten.

---

## 6. Despliega el frontend en Cloudflare Pages

En Cloudflare: **Workers & Pages → Create application → Pages → Connect
to Git**.

Selecciona tu fork del repositorio y usa estos valores:

- **Framework preset:** Vite
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Variables de entorno del build** (copia de `.env.local`, solo las
  que empiezan con `VITE_`):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_SITE_URL` (la URL que te dará Cloudflare Pages)
  - `VITE_SENTRY_DSN` (opcional)

Cloudflare construye y publica. Copia la URL final y pégala en dos
lugares:

1. Supabase → Authentication → URL Configuration → **Site URL** y
   **Redirect URLs** (para que funcionen los enlaces mágicos por
   correo).
2. Twilio → Messaging → tu Messaging Service → **Inbound Settings** →
   Webhook URL: `https://tu-url.pages.dev/functions/v1/smsWebhook`.

---

## 7. Agrega tu primera abogada o abogado

Ayudafema no envía una apelación hasta que una persona con rol
`attorney` la aprueba en `/admin/queue`.

Después de que esa persona entre a la aplicación una vez (con su
correo), corre esto en Supabase → SQL Editor, cambiando el correo:

```sql
update auth.users
set raw_user_meta_data =
  coalesce(raw_user_meta_data, '{}'::jsonb)
  || '{"role":"attorney"}'::jsonb
where email = 'abogada@ayudalegalpr.org';
```

Si preferiste poner `BOOTSTRAP_ATTORNEY_EMAIL=` en `.env.local`,
`npm run bootstrap` te imprime este mismo SQL listo para copiar.

---

## 8. Activa el recordatorio de actividad

Supabase gratuito pausa el proyecto después de 7 días sin tráfico. El
flujo de trabajo `.github/workflows/keepalive.yml` ya está en el
repositorio y se activa solo cuando empujas código a GitHub. Para que
corra los lunes y jueves:

1. En tu fork de GitHub: **Settings → Secrets and variables →
   Actions**.
2. Agrega dos secretos con los mismos valores de `.env.local`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Abre la pestaña **Actions**, escoge *Supabase keepalive* y corre
   una vez con *Run workflow* para confirmar que funciona.

---

## 9. Prueba con la carta de ejemplo

En `content/samples/fiona-ownership-denial.txt` hay una carta de
negación falsa, realista, para Huracán Fiona (DR-4671-PR, código 120).

1. Entra a tu URL de Cloudflare Pages.
2. En la pantalla de subida, toca *"Escribir los datos a mano"*.
3. Llena los datos con los de esa carta.
4. Sigue hasta *Revisión del abogado*.
5. Entra con la cuenta de abogada a `/admin/queue` y aprueba el
   borrador.
6. Confirma que la carta final cita: 44 CFR § 206.111, IAPPG v1.1,
   DRRA § 1212 y 86 Fed. Reg. 31,553.

---

## 10. Lee la lista antes de lanzar

No publiques la herramienta sin revisar todos los puntos de
`docs/ANTES-DE-LANZAR.md`. Son las pruebas mínimas de calidad antes
de que una persona real confíe su apelación a este tool.

---

## ¿Problemas?

- Errores en `npm run bootstrap` → relee el mensaje, corre otra vez.
- Error HTTP desde Supabase → revisa `docs/RUNBOOK.md`.
- Error legal o de lenguaje → abre un issue en GitHub marcado
  `legal-review` o `language-review`.
