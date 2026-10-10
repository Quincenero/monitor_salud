# Monitor de Salud

Aplicación web para registrar y visualizar glucemia, frecuencia cardíaca y presión arterial.

## Stack

- React + Vite
- JavaScript (JS/JSX)
- CSS Modules
- Express + Node.js
- MongoDB + Mongoose
- Recharts
- Lucide React

## Estructura

```text
monitor-de-salud/
├── client/
│   ├── src/
│   │   ├── components/
│   │   └── utils/
│   ├── index.html
│   └── vite.config.js
├── server/
│   ├── app.js
│   ├── index.js
│   ├── db.js
│   ├── routes/
│   └── .env.example
├── api/
│   └── index.js
├── package.json
└── README.md
```

## Requisitos

- Node.js 20+
- MongoDB local o MongoDB Atlas

## Instalación

```bash
npm install
```

Configura MongoDB:

```bash
copy server\.env.example server\.env
```

Edita `server/.env` y coloca tu `MONGODB_URI`.

Ejemplo para MongoDB local:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/monitor_salud
```

## Desarrollo

Ejecuta frontend y backend juntos:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- API Express: http://localhost:5000
- API de salud: http://localhost:5000/api/health

Vite redirige `/api/*` al servidor Express mediante proxy.

## Despliegue en Vercel

El repo ya está preparado: el frontend (Vite) se sirve como estático y la API Express corre como una única función serverless (`api/index.js`) que carga `server/app.js`.

1. Importá el repo en Vercel (Root Directory: la raíz del repo; el resto lo toma de `vercel.json`).
2. En **Settings → Environment Variables** cargá:

| Variable | Valor |
| --- | --- |
| `MONGODB_URI` | cadena de conexión de MongoDB Atlas |
| `JWT_SECRET` | secreto largo (`openssl rand -hex 32`) |
| `CLIENT_URL` | URL pública, ej. `https://tu-app.vercel.app` (se usa en CORS y en el link del mail de recuperación) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | opcionales; sin SMTP el mail solo se loguea |

3. En MongoDB Atlas → **Network Access**, permití conexiones desde `0.0.0.0/0` (las IPs de Vercel no son fijas).
4. Deploy. Verificá con `https://tu-app.vercel.app/api/health`.

Notas:

- `NODE_ENV` lo define Vercel (`production`); no lo cargues a mano.
- Los rate limiters usan memoria, así que el límite es por instancia serverless. Para un límite global habría que usar un store externo (Redis/Upstash).
- Nunca subas `server/.env` a git (ya está en `.gitignore`).

## Producción local (sin Vercel)

```bash
npm run build
npm start
```

`npm start` levanta solo la API; para servir `client/dist` habría que agregar `express.static` en `server/index.js`.
