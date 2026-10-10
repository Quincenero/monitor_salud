import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import styles from './Profile.module.css';
import { User, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();

  // ---- Datos personales ----
  const [name, setName] = useState(user?.name || '');
  const [profileMsg, setProfileMsg] = useState(null);
  const [profileErr, setProfileErr] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileMsg(null);
    setProfileErr(null);
    setSavingProfile(true);
    try {
      const data = await api('/api/auth/profile', {
        method: 'PUT',
        body: { name },
      });
      updateUser(data.user);
      setProfileMsg('Datos actualizados.');
    } catch (err) {
      setProfileErr(err.message || 'No se pudo actualizar.');
    } finally {
      setSavingProfile(false);
    }
  }

  // ---- Contraseña ----
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMsg, setPwMsg] = useState(null);
  const [pwErr, setPwErr] = useState(null);
  const [savingPw, setSavingPw] = useState(false);

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPwMsg(null);
    setPwErr(null);

    if (newPassword !== confirmPassword) {
      setPwErr('Las contraseñas nuevas no coinciden.');
      return;
    }
    if (newPassword.length < 8) {
      setPwErr('La contraseña nueva debe tener al menos 8 caracteres.');
      return;
    }

    setSavingPw(true);
    try {
      await api('/api/auth/password', {
        method: 'PUT',
        body: { currentPassword, newPassword },
      });
      setPwMsg('Contraseña actualizada. Otras sesiones fueron cerradas.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwErr(err.message || 'No se pudo cambiar la contraseña.');
    } finally {
      setSavingPw(false);
    }
  }

  return (
    <div className={styles.profileGrid}>
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Datos personales</h2>
        <p className={styles.cardDesc}>
          Esta información es la que se muestra en tu cuenta.
        </p>

        {profileMsg && (
          <div className={styles.alertSuccess}>
            <CheckCircle2 size={16} />
            <span>{profileMsg}</span>
          </div>
        )}
        {profileErr && (
          <div className={styles.alertError}>
            <AlertCircle size={16} />
            <span>{profileErr}</span>
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className={styles.form}>
          <label className={styles.field}>
            <span className={styles.label}>
              <User size={14} /> Nombre
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={80}
              className={styles.input}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>
              <Mail size={14} /> Email
            </span>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className={styles.inputDisabled}
              title="El email no se puede cambiar"
            />
          </label>

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.primaryBtn}
              disabled={savingProfile || name === user?.name}
            >
              {savingProfile ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Cambiar contraseña</h2>
        <p className={styles.cardDesc}>
          Al cambiarla, se cierran las sesiones en otros dispositivos.
        </p>

        {pwMsg && (
          <div className={styles.alertSuccess}>
            <CheckCircle2 size={16} />
            <span>{pwMsg}</span>
          </div>
        )}
        {pwErr && (
          <div className={styles.alertError}>
            <AlertCircle size={16} />
            <span>{pwErr}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className={styles.form}>
          <label className={styles.field}>
            <span className={styles.label}>
              <Lock size={14} /> Contraseña actual
            </span>
            <input
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className={styles.input}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>
              <Lock size={14} /> Nueva contraseña
            </span>
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className={styles.input}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>
              <Lock size={14} /> Confirmar nueva contraseña
            </span>
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={styles.input}
            />
          </label>

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.primaryBtn}
              disabled={savingPw}
            >
              {savingPw ? 'Guardando...' : 'Cambiar contraseña'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
