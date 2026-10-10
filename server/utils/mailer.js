import nodemailer from 'nodemailer';

let transporter = null;

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn('[mailer] SMTP no configurado. Los mails se van a loguear a consola.');
    transporter = {
      sendMail: async (opts) => {
        console.log('\n📧 [MAILER - DEV] ------------------------------');
        console.log('To:', opts.to);
        console.log('Subject:', opts.subject);
        console.log('---');
        console.log(opts.text);
        console.log('------------------------------------------------\n');
        return { messageId: 'dev-mode' };
      },
    };
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return transporter;
}

export async function sendPasswordResetEmail({ to, name, resetUrl }) {
  const t = getTransporter();
  await t.sendMail({
    from: process.env.SMTP_FROM || '"Monitor de Salud" <no-reply@salud.local>',
    to,
    subject: 'Recuperación de contraseña',
    text: `Hola ${name},\n\nRecibimos un pedido para restablecer tu contraseña.\n\nAbrí este link (válido 30 minutos):\n${resetUrl}\n\nSi no fuiste vos, ignorá este mensaje.`,
    html: `<p>Hola ${escapeHtml(name)},</p>
           <p>Recibimos un pedido para restablecer tu contraseña.</p>
           <p>Hacé click en el siguiente link (válido 30 minutos):</p>
           <p><a href="${resetUrl}">${resetUrl}</a></p>
           <p>Si no fuiste vos, ignorá este mensaje.</p>`,
  });
}