# 🩺 Monitor de Salud

Aplicación web para el registro y monitoreo personal de glucemia, frecuencia cardíaca (BPM) y presión arterial. Con autenticación de usuarios, verificación de email, gráficos de tendencias y clasificación clínica de valores según guías médicas (ADA, AHA/ACC).

🌐 **Demo en vivo:** [monitorsalud.vercel.app](https://monitorsalud.vercel.app)

---

## ✨ Features

- **Autenticación completa** — registro, login, logout, recuperación de contraseña y verificación de email con tokens de un solo uso.
- **Aislamiento de datos por usuario** — cada cuenta ve únicamente sus propios registros.
- **Registro de mediciones** — glucemia, BPM, presión sistólica/diastólica, contexto (ayunas, postprandial, reposo, etc.) y notas.
- **Clasificación clínica automática** — evaluación en tiempo real según guías médicas:
  - Glucemia (ADA)
  - Frecuencia cardíaca en reposo
  - Presión arterial (AHA/ACC)
- **Gráficos interactivos** — tendencias temporales con filtros por rango y por métrica (Recharts).
- **Historial completo** — búsqueda, filtros, edición y eliminación de registros.
- **Exportación a CSV** — para compartir con profesionales de la salud.
- **Guía médica integrada** — rangos clínicos de referencia consultables desde la app.
- **Responsive** — experiencia optimizada en desktop, tablet y móvil.
- **Seguridad** — JWT en cookies httpOnly, Helmet, rate limiting, bcrypt para passwords.

---

## 🛠️ Stack técnico

### Frontend
- **React 19** + **Vite 8**
- **React Router 7** para routing SPA
- **Recharts 3** para gráficos
- **Lucide React** para iconografía
- **CSS Modules** para estilos encapsulados

### Backend
- **Node.js** + **Express 4**
- **MongoDB Atlas** + **Mongoose 9**
- **JWT** (jsonwebtoken) para sesiones
- **bcryptjs** para hash de contraseñas
- **Zod** para validación de payloads
- **Helmet** para headers de seguridad
- **express-rate-limit** para limitar intentos

### Emails
- **Resend** para envío de emails transaccionales (verificación + reset password)

### Deploy
- **Vercel** — frontend estático + backend serverless (funciones)
- **MongoDB Atlas** — base de datos en la nube

---

## 🚀 Instalación local

### Requisitos previos

- Node.js 20+
- Cuenta de [MongoDB Atlas](https://www.mongodb.com/atlas) (o MongoDB local)
- Cuenta de [Resend](https://resend.com) (opcional para desarrollo)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/TQuincenero/monitor-salud.git
cd monitor-salud

# 2. Instalar dependencias (workspaces)
npm install

# 3. Configurar variables de entorno
cp server/.env.example server/.env
# Editar server/.env con tus credenciales

# 4. Levantar backend y frontend en terminales separadas
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev

Abrí http://localhost:5173 en el navegador.

# Base de datos
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/monitor_salud

# JWT
JWT_SECRET=un_string_largo_y_aleatorio_de_32_o_mas_caracteres
JWT_EXPIRES_IN=7d

# Servidor
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Emails (opcional en desarrollo — sin esto los mails se loguean a consola)
RESEND_API_KEY=re_tu_api_key
EMAIL_FROM=Monitor de Salud <onboarding@resend.dev>

📁 Estructura del proyecto


monitor-salud/
├── api/                      # Entry point serverless para Vercel
│   └── index.js
├── client/                   # Frontend React + Vite
│   ├── public/
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   ├── context/          # AuthContext
│   │   ├── hooks/            # useAuth
│   │   ├── pages/            # Login, Register, Dashboard, etc.
│   │   ├── utils/            # api.js, healthEvaluations.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
├── server/                   # Backend Express
│   ├── middleware/           # auth, errors
│   ├── models/               # User, HealthRecord, PasswordResetToken
│   ├── routes/               # auth, records
│   ├── utils/                # jwt, mailer, verification, clientUrl
│   ├── app.js                # Configuración de Express
│   ├── index.js              # Entry para desarrollo local
│   └── db.js                 # Conexión a MongoDB
├── package.json              # Workspaces
├── vercel.json               # Configuración de deploy
└── README.md

📜 Scripts disponibles

cd client && npm run dev      # Solo frontend
cd server && npm run dev      # Solo backend (con --watch)

🔒 Seguridad

• Contraseñas hasheadas con bcrypt (12 rounds).
• JWT almacenado en cookie httpOnly + SameSite=Lax (no accesible desde JS).
• Verificación de email obligatoria antes del primer login.
• Rate limiting en /login, /forgot-password, /resend-verification.
• Helmet con CSP, HSTS, X-Frame-Options, etc.
• Tokens de verificación y reset hasheados en la base de datos (SHA-256).
• Aislamiento por usuario verificado en todas las queries.
• Cookies secure en producción (solo HTTPS).

🌐 Deploy
El proyecto está deployado en Vercel con la siguiente configuración:

• Frontend: build estático de Vite (client/dist).
• Backend: función serverless (api/index.js) que carga la app Express.
• Base de datos: MongoDB Atlas (cluster M0 gratuito).
• Routing: /api/* va a la función, todo lo demás sirve el SPA.

📝 Notas

• La app es de monitoreo personal y no reemplaza el diagnóstico ni el           tratamiento médico profesional.
• Los rangos clínicos están basados en guías oficiales (ADA, AHA/ACC) pero pueden variar según el contexto del paciente.

## 📄 Licencia

Este proyecto está bajo la licencia [MIT](./LICENSE). Podés usarlo, modificarlo y distribuirlo libremente con atribución.

 👤 Autor
Marco Espinoza

GitHub: @Quincenero