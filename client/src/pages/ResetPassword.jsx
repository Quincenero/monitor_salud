import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import styles from './AuthPages.module.css';
import { Activity, AlertCircle, CheckCircle2, Lock } from 'lucide-react';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await api('/api/auth/reset-password', {
        method: 'POST',
        body: { token, password },
      });
      setDone(true);
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err) {
      setError(err.message || 'Link inválido o expirado.');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className={styles.authWrapper}>
        <div className={styles.authCard}>
          <div className={styles.brandRow}>
            <div className={styles.errorIcon}>
              <AlertCircle size={22} />
            </div>
          </div>
          <h1 className={styles.title}>Link inválido</h1>
          <p className={styles.subtitle}>
            El link no contiene un token válido. Solicitá uno nuevo.
          </p>
          <div className={styles.footerLinks}>
            <Link to="/forgot-password" className={styles.link}>
              Solicitar nuevo link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className={styles.authWrapper}>
        <div className={styles.authCard}>
          <div className={styles.brandRow}>
            <div className={styles.successIcon}>
              <CheckCircle2 size={22} />
            </div>
          </div>
          <h1 className={styles.title}>Contraseña actualizada</h1>
          <p className={styles.subtitle}>
            Te estamos redirigiendo al inicio de sesión...
          </p>
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
        <h1 className={styles.title}>Nueva contraseña</h1>
        <p className={styles.subtitle}>
          Elegí una contraseña nueva para tu cuenta
        </p>

        {error && (
          <div className={styles.alert}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.field}>
            <span className={styles.label}>Nueva contraseña</span>
            <div className={styles.inputWrap}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className={styles.input}
                placeholder="Mínimo 8 caracteres"
              />
            </div>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Confirmar contraseña</span>
            <div className={styles.inputWrap}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className={styles.input}
                placeholder="Repetí la contraseña"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className={styles.submitBtn}
          >
            {loading ? 'Guardando...' : 'Restablecer contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}