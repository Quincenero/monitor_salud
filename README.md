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
│   ├── db.js
│   ├── server.js
│   └── .env.example
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

## Producción

```bash
npm run build
npm start
```

Express servirá la aplicación compilada de Vite desde `client/dist`.

## Cambios realizados

- Eliminado TypeScript: `.ts` y `.tsx` pasaron a `.js` y `.jsx`.
- Eliminado Tailwind CSS.
- Eliminada la dependencia de Google Gemini.
- Eliminada Motion porque no se utilizaba.
- Eliminado el servidor híbrido que mezclaba Vite y Express.
- Separados frontend y backend.
- Vite queda como servidor de desarrollo del frontend.
- Express queda como API y servidor de producción.
- MongoDB/Mongoose queda como persistencia principal, sin almacenamiento JSON de respaldo.
- Eliminados `tsconfig.json`, `bun.lock`, `index.css`, `metadata.json` y archivos del proyecto anterior que ya no son necesarios.
- CSS de la interfaz permanece organizado mediante CSS Modules.
