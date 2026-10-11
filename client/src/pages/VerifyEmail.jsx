import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import styles from './AuthPages.module.css';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Mail,
  RotateCw,
} from 'lucide-react';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';

  const [status, setStatus] = useState('loading'); // loading | success | error | resent
  const [message, setMessage] = useState('');
  const [emailForResend, setEmailForResend] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('El link no contiene un token de verificación.');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const data = await api('/api/auth/verify-email', {
          method: 'POST',
          body: { token },
        });
        if (!cancelled) {
          setStatus('success');
          setMessage(data.message || 'Email verificado correctamente.');
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('error');
          setMessage(err.message || 'Link inválido o expirado.');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleResend() {
    if (!emailForResend) return;
    setResending(true);
    try {
      await api('/api/auth/resend-verification', {
        method: 'POST',
        body: { email: emailForResend },
      });
      setStatus('resent');
      setMessage('Si la cuenta existe y no está verificada, te enviamos un nuevo link.');
    } catch (err) {
      setMessage(err.message || 'No se pudo reenviar el email.');
    } finally {
      setResending(false);
    }
  }

  // ---- Cargando ----
  if (status === 'loading') {
    return (
      <div className={styles.authWrapper}>
        <div className={styles.authCard}>
          <div className={styles.brandRow}>
            <div className={styles.brandIcon}>
              <Activity size={22} />
            </div>
          </div>
          <h1 className={styles.title}>Verificando tu email...</h1>
          <p className={styles.subtitle}>Un momento por favor</p>
        </div>
      </div>
    );
  }

  // ---- Éxito ----
  if (status === 'success') {
    return (
      <div className={styles.authWrapper}>
        <div className={styles.authCard}>
          <div className={styles.brandRow}>
            <div className={styles.successIcon}>
              <CheckCircle2 size={22} />
            </div>
          </div>
          <h1 className={styles.title}>¡Email verificado!</h1>
          <p className={styles.subtitle}>{message}</p>
          <Link to="/login" className={styles.submitBtn} style={{ textAlign: 'center', textDecoration: 'none', display: 'block', marginTop: '1rem' }}>
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  // ---- Reenviado ----
  if (status === 'resent') {
    return (
      <div className={styles.authWrapper}>
        <div className={styles.authCard}>
          <div className={styles.brandRow}>
            <div className={styles.successIcon}>
              <Mail size={22} />
            </div>
          </div>
          <h1 className={styles.title}>Listo</h1>
          <p className={styles.subtitle}>{message}</p>
          <div className={styles.footerLinks}>
            <Link to="/login" className={styles.link}>
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---- Error ----
  return (
    <div className={styles.authWrapper}>
      <div className={styles.authCard}>
        <div className={styles.brandRow}>
          <div className={styles.errorIcon}>
            <AlertCircle size={22} />
          </div>
        </div>
        <h1 className={styles.title}>No pudimos verificar tu email</h1>
        <p className={styles.subtitle}>{message}</p>

        <label className={styles.field} style={{ marginTop: '0.75rem' }}>
          <span className={styles.label}>Ingresá tu email para reenviar el link</span>
          <div className={styles.inputWrap}>
            <Mail size={16} className={styles.inputIcon} />
            <input
              type="email"
              value={emailForResend}
              onChange={(e) => setEmailForResend(e.target.value)}
              placeholder="tu@email.com"
              className={styles.input}
            />
          </div>
        </label>

        <button
          type="button"
          className={styles.submitBtn}
          onClick={handleResend}
          disabled={resending || !emailForResend}
          style={{ marginTop: '0.5rem' }}
        >
          {resending ? (
            'Reenviando...'
          ) : (
            <>
              <RotateCw size={14} style={{ marginRight: 6 }} />
              Reenviar verificación
            </>
          )}
        </button>

        <div className={styles.footerLinks}>
          <Link to="/login" className={styles.link}>
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}