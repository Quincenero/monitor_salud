import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import styles from './AuthPages.module.css';
import {
  Activity,
  AlertCircle,
  Mail,
  Lock,
  RotateCw,
  MailWarning,
} from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Estado para "email no verificado"
  const [notVerifiedEmail, setNotVerifiedEmail] = useState(null);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setNotVerifiedEmail(null);
    setResendMsg('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err.data?.code === 'EMAIL_NOT_VERIFIED') {
        setNotVerifiedEmail(err.data.email || email);
        setError(err.message || 'Tenés que verificar tu email antes de ingresar.');
      } else {
        setError(err.message || 'No se pudo iniciar sesión.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!notVerifiedEmail) return;
    setResending(true);
    setResendMsg('');
    try {
      await api('/api/auth/resend-verification', {
        method: 'POST',
        body: { email: notVerifiedEmail },
      });
      setResendMsg('Te enviamos un nuevo link de verificación. Revisá tu email.');
    } catch (err) {
      setResendMsg(err.message || 'No se pudo reenviar el email.');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className={styles.authWrapper}>
      <div className={styles.authCard}>
        <div className={styles.brandRow}>
          <div className={styles.brandIcon}>
            <Activity size={22} />
          </div>
        </div>
        <h1 className={styles.title}>Iniciar sesión</h1>
        <p className={styles.subtitle}>
          Accedé a tu panel de monitoreo de salud
        </p>

        {error && (
          <div className={styles.alert}>
            {notVerifiedEmail ? <MailWarning size={16} /> : <AlertCircle size={16} />}
            <span>{error}</span>
          </div>
        )}

        {notVerifiedEmail && (
          <div style={{ marginBottom: '1rem' }}>
            {resendMsg ? (
              <div
                className={styles.alert}
                style={{ background: '#ecfdf5', color: '#065f46', borderColor: '#a7f3d0' }}
              >
                <Mail size={16} />
                <span>{resendMsg}</span>
              </div>
            ) : (
              <button
                type="button"
                className={styles.submitBtn}
                onClick={handleResend}
                disabled={resending}
              >
                {resending ? (
                  'Reenviando...'
                ) : (
                  <>
                    <RotateCw size={14} style={{ marginRight: 6 }} />
                    Reenviar email de verificación
                  </>
                )}
              </button>
            )}
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

          <label className={styles.field}>
            <span className={styles.label}>Contraseña</span>
            <div className={styles.inputWrap}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.input}
                placeholder="••••••••"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className={styles.submitBtn}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className={styles.footerLinks}>
          <Link to="/forgot-password" className={styles.link}>
            ¿Olvidaste tu contraseña?
          </Link>
          <span className={styles.dot}>·</span>
          <Link to="/register" className={styles.link}>
            Crear cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}