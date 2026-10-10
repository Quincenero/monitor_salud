import { useEffect, useState } from 'react';
import {
  Routes,
  Route,
  Link,
  NavLink,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import styles from './App.module.css';

import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute';
import { api } from './utils/api';

import { HealthSummary } from './components/HealthSummary';
import { HealthCharts } from './components/HealthCharts';
import { RecordForm } from './components/RecordForm';
import { RecordsList } from './components/RecordsList';
import { HealthGuideModal } from './components/HealthGuideModal';
import { DbInfoModal } from './components/DbInfoModal';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';

import {
  Activity,
  BarChart3,
  PlusCircle,
  ListFilter,
  BookOpen,
  Database,
  LogOut,
  User as UserIcon,
} from 'lucide-react';

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

function AppShell() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [dbStatus, setDbStatus] = useState(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Cargar registros solo si hay sesión
  useEffect(() => {
    if (!user) {
      setRecords([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await api('/api/records');
        if (!cancelled) setRecords(data.records || []);
      } catch (err) {
        if (err.status === 401) return; // la ProtectedRoute se encarga
        console.error('Error cargando registros:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Status de la DB
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await api('/api/status');
        if (!cancelled) setDbStatus(data);
      } catch {
        // silencioso
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  // Mientras AuthContext bootstrapea
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
        }}
      >
        Cargando...
      </div>
    );
  }

  // Si NO hay usuario → solo rutas públicas (sin navbar ni shell)
  if (!user) {
    return (
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Con usuario → shell completo
  return (
    <div className={styles.appContainer}>
      <header className={styles.topNavbar}>
        <div className={styles.navContent}>
          <div className={styles.brandGroup}>
            <div className={styles.brandIcon}>
              <Activity size={20} />
            </div>
            <div className={styles.brandText}>
              <h1 className={styles.brandTitle}>Monitor de Salud</h1>
              <p className={styles.brandSubtitle}>
                Glucemia · Ritmo cardíaco · Presión
              </p>
            </div>
          </div>

          <div className={styles.navActions}>
            <button
              type="button"
              className={`${styles.dbBadge} ${
                dbStatus?.isMongoConnected
                  ? styles.dbMongo
                  : styles.dbLocal
              }`}
              onClick={() => setIsDbModalOpen(true)}
            >
              <span
                className={`${styles.dbDot} ${
                  dbStatus?.isMongoConnected
                    ? styles.dotGreen
                    : styles.dotBlue
                }`}
              />
              {dbStatus?.isMongoConnected ? 'MongoDB' : 'Desconectado'}
            </button>

            <button
              type="button"
              className={styles.helpBtn}
              onClick={() => setIsGuideOpen(true)}
            >
              <BookOpen size={14} />
              <span>Guía</span>
            </button>

            <Link to="/profile" className={styles.helpBtn}>
              <UserIcon size={14} />
              <span>{user.name}</span>
            </Link>

            <button
              type="button"
              className={styles.helpBtn}
              onClick={handleLogout}
              title="Cerrar sesión"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      <nav className={styles.subNavbar}>
        <div className={styles.tabGroup}>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${styles.navTab} ${isActive ? styles.activeTab : ''}`
            }
          >
            <BarChart3 size={16} />
            <span>Panel de Control</span>
          </NavLink>
          <NavLink
            to="/new"
            className={({ isActive }) =>
              `${styles.navTab} ${isActive ? styles.activeTab : ''}`
            }
          >
            <PlusCircle size={16} />
            <span>Nueva Medición</span>
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) =>
              `${styles.navTab} ${isActive ? styles.activeTab : ''}`
            }
          >
            <ListFilter size={16} />
            <span>Historial Completo</span>
            <span className={styles.tabBadge}>{records.length}</span>
          </NavLink>
        </div>
      </nav>

      <main className={styles.mainContainer}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div>
                  <HealthSummary
                    records={records}
                    onOpenNewRecord={() => navigate('/new')}
                    onSeedSampleData={async () => {
                      setIsSeeding(true);
                      try {
                        const data = await api('/api/records/seed', {
                          method: 'POST',
                        });
                        setRecords(data.records);
                      } catch (err) {
                        if (err.status === 401)
                          console.error('Error al cargar seed: ', err.message);
                      } finally {
                        setIsSeeding(false);
                      }
                    }}
                    isSeeding={isSeeding}
                  />
                  {records.length > 0 && <HealthCharts records={records} />}
                  {records.length > 0 && (
                    <RecordsList
                      records={records}
                      onRecordDeleted={(id) =>
                        setRecords((prev) =>
                          prev.filter((r) => (r.id || r._id) !== id)
                        )
                      }
                      onRecordUpdated={(updated) =>
                        setRecords((prev) =>
                          prev.map((r) =>
                            (r.id || r._id) === (updated.id || updated._id)
                              ? updated
                              : r
                          )
                        )
                      }
                      onOpenNewRecord={() => navigate('/new')}
                    />
                  )}
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/new"
            element={
              <ProtectedRoute>
                <RecordForm
                  onRecordSaved={(newRecord) => {
                    setRecords((prev) => [newRecord, ...prev]);
                    navigate('/');
                  }}
                  onCancel={() => navigate('/')}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <RecordsList
                  records={records}
                  onRecordDeleted={(id) =>
                    setRecords((prev) =>
                      prev.filter((r) => (r.id || r._id) !== id)
                    )
                  }
                  onRecordUpdated={(updated) =>
                    setRecords((prev) =>
                      prev.map((r) =>
                        (r.id || r._id) === (updated.id || updated._id)
                          ? updated
                          : r
                      )
                    )
                  }
                  onOpenNewRecord={() => navigate('/new')}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p className={styles.footerNote}>
            Este monitoreo es informativo y no reemplaza el diagnóstico médico
            profesional.
          </p>
        </div>
      </footer>

      <HealthGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
      <DbInfoModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        status={dbStatus}
      />
    </div>
  );
}