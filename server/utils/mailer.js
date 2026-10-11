import { Resend } from 'resend';

let resend = null;

function getResend() {
  if (resend) return resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn('[mailer] RESEND_API_KEY no configurada. Los mails se loguean a consola.');
    // Dev fallback: simula el envío
    resend = {
      emails: {
        send: async (opts) => {
          console.log('\n📧 [MAILER - DEV] ------------------------------');
          console.log('To:', opts.to);
          console.log('Subject:', opts.subject);
          console.log('---');
          console.log(opts.text || '(sin texto)');
          console.log('------------------------------------------------\n');
          return { data: { id: 'dev-mode' }, error: null };
        },
      },
    };
    return resend;
  }
  resend = new Resend(key);
  return resend;
}

const FROM = process.env.EMAIL_FROM || 'Monitor de Salud <onboarding@resend.dev>';

export async function sendVerificationEmail({ to, name, verifyUrl }) {
  const client = getResend();
  const { error } = await client.emails.send({
    from: FROM,
    to,
    subject: 'Verificá tu email — Monitor de Salud',
    text: `Hola ${name},\n\nGracias por registrarte. Para activar tu cuenta, abrí este link (válido 24 horas):\n${verifyUrl}\n\nSi no fuiste vos, ignorá este mensaje.`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0d9488;">Verificá tu email</h2>
        <p>Hola <strong>${name}</strong>,</p>
        <p>Gracias por registrarte en <strong>Monitor de Salud</strong>. Para activar tu cuenta, hacé click en el siguiente botón:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Verificar mi email
          </a>
        </p>
        <p style="color: #64748b; font-size: 13px;">O copiá este link en tu navegador:<br/>${verifyUrl}</p>
        <p style="color: #64748b; font-size: 13px;">El link expira en 24 horas. Si no creaste esta cuenta, ignorá este mensaje.</p>
      </div>
    `,
  });

  if (error) {
    console.error('[mailer] Error enviando verificación:', error);
    throw new Error('No se pudo enviar el email de verificación.');
  }
}

export async function sendPasswordResetEmail({ to, name, resetUrl }) {
  const client = getResend();
  const { error } = await client.emails.send({
    from: FROM,
    to,
    subject: 'Recuperación de contraseña — Monitor de Salud',
    text: `Hola ${name},\n\nRecibimos un pedido para restablecer tu contraseña.\n\nAbrí este link (válido 30 minutos):\n${resetUrl}\n\nSi no fuiste vos, ignorá este mensaje.`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0d9488;">Recuperar contraseña</h2>
        <p>Hola <strong>${name}</strong>,</p>
        <p>Recibimos un pedido para restablecer tu contraseña. Hacé click en el botón (válido 30 minutos):</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Restablecer contraseña
          </a>
        </p>
        <p style="color: #64748b; font-size: 13px;">Si no fuiste vos, ignorá este mensaje.</p>
      </div>
    `,
  });

  if (error) {
    console.error('[mailer] Error enviando reset:', error);
    throw new Error('No se pudo enviar el email.');
  }
}