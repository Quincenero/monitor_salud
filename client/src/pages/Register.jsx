import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import styles from './AuthPages.module.css';
import {
  Activity,
  AlertCircle,
  Mail,
  Lock,
  User,
  CheckCircle2,
  RotateCw,
} from 'lucide-react';

export default function Register() {
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Estado para el paso "verificá tu email"
  const [submittedEmail, setSubmittedEmail] = useState(null);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

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
      const data = await register(name, email, password);
      if (data?.requiresVerification) {
        setSubmittedEmail(data.email || email);
      }
    } catch (err) {
      setError(err.message || 'No se pudo crear la cuenta.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setResendMsg('');
    try {
      await api('/api/auth/resend-verification', {
        method: 'POST',
        body: { email: submittedEmail },
      });
      setResendMsg('Te enviamos un nuevo link de verificación.');
    } catch (err) {
      setResendMsg(err.message || 'No se pudo reenviar el email.');
    } finally {
      setResending(false);
    }
  }

  // ------- Pantalla "Revisá tu email" -------
  if (submittedEmail) {
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
            Te enviamos un link de verificación a <strong>{submittedEmail}</strong>.
            Abrilo para activar tu cuenta (válido 24 horas).
          </p>

          {resendMsg && (
            <div className={styles.alert} style={{ background: '#ecfdf5', color: '#065f46', borderColor: '#a7f3d0' }}>
              <CheckCircle2 size={16} />
              <span>{resendMsg}</span>
            </div>
          )}

          <button
            type="button"
            className={styles.submitBtn}
            onClick={handleResend}
            disabled={resending}
            style={{ marginTop: '0.5rem' }}
          >
            {resending ? (
              'Reenviando...'
            ) : (
              <>
                <RotateCw size={14} style={{ marginRight: 6 }} />
                Reenviar email
              </>
            )}
          </button>

          <div className={styles.footerLinks}>
            <span>¿Ya verificaste?</span>
            <Link to="/login" className={styles.link}>
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ------- Formulario normal -------
  return (
    <div className={styles.authWrapper}>
      <div className={styles.authCard}>
        <div className={styles.brandRow}>
          <div className={styles.brandIcon}>
            <Activity size={22} />
          </div>
        </div>
        <h1 className={styles.title}>Crear cuenta</h1>
        <p className={styles.subtitle}>
          Empezá a registrar tus mediciones de salud
        </p>

        {error && (
          <div className={styles.alert}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.field}>
            <span className={styles.label}>Nombre</span>
            <div className={styles.inputWrap}>
              <User size={16} className={styles.inputIcon} />
              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                maxLength={80}
                className={styles.input}
                placeholder="Tu nombre"
              />
            </div>
          </label>

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
                placeholder="Repetí tu contraseña"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className={styles.submitBtn}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <div className={styles.footerLinks}>
          <span>¿Ya tenés cuenta?</span>
          <Link to="/login" className={styles.link}>
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}