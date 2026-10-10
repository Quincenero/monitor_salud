import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import styles from './AuthPages.module.css';
import { Activity, AlertCircle, CheckCircle2, Mail } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api('/api/auth/forgot-password', {
        method: 'POST',
        body: { email },
      });
      setSent(true);
    } catch (err) {
      setError(err.message || 'No se pudo procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className={styles.authWrapper}>
        <div className={styles.authCard}>
          <div className={styles.brandRow}>
            <div className={styles.successIcon}>
              <CheckCircle2 size={22} />
            </div>
          </div>
          <h1 className={styles.title}>Revisá tu email</h1>
          <p className={styles.subtitle}>
            Si <strong>{email}</strong> está registrado, te enviamos un link
            para restablecer tu contraseña. El link expira en 30 minutos.
          </p>
          <div className={styles.footerLinks}>
            <Link to="/login" className={styles.link}>
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authWrapper}>
      <div className={styles.authCard}>
        <div className={styles.brandRow}>
          <div className={styles.brandIcon}>
            <Activity size={22} />
          </div>
        </div>
        <h1 className={styles.title}>Recuperar contraseña</h1>
        <p className={styles.subtitle}>
          Ingresá tu email y te enviamos un link para restablecerla
        </p>

        {error && (
          <div className={styles.alert}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.field}>
            <span className={styles.label}>Email</span>
            <div className={styles.inputWrap}>
              <Mail size={16} className={styles.inputIcon} />
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
                placeholder="tu@email.com"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className={styles.submitBtn}
          >
            {loading ? 'Enviando...' : 'Enviar link'}
          </button>
        </form>

        <div className={styles.footerLinks}>
          <Link to="/login" className={styles.link}>
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}