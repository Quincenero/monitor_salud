import React from 'react';
import styles from './DbInfoModal.module.css';
import { X, Database, CheckCircle, Server, Info } from 'lucide-react';



export const DbInfoModal = ({ isOpen, onClose, status }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>
            <Database size={20} color="#0d9488" />
            Configuración de Base de Datos (MongoDB & Node Express)
          </h3>
          <button type="button" className={styles.closeBtn} onClick={onClose} title="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalContent}>
          <div className={styles.statusCard}>
            <div className={styles.statusRow}>
              <span className={styles.statusKey}>Motor de Persistencia:</span>
              <span className={styles.statusVal}>
                MongoDB (Mongoose ODM)
              </span>
            </div>
            <div className={styles.statusRow}>
              <span className={styles.statusKey}>Estado de Conexión:</span>
              <span className={styles.statusVal} style={{ color: status?.isMongoConnected ? '#059669' : '#0284c7' }}>
                {status?.isMongoConnected ? '● Conectado a MongoDB' : '● Desconectado'}
              </span>
            </div>
            <div className={styles.statusRow}>
              <span className={styles.statusKey}>Base de Datos:</span>
              <span className={styles.statusVal}>{status?.databaseName || 'health_db'}</span>
            </div>
          </div>

          <p>
            Tu aplicación está equipada con un backend completo en <strong>Express / Node.js</strong> y esquema Mongoose para <strong>MongoDB</strong>.
          </p>

          <p>
            <span style={{ color: status?.isMongoConnected ? '#059669' : '#dc2626' }}>
              {status?.isMongoConnected
                ? 'Tus datos de glucemia, BPM y presión arterial se están sincronizando directamente con MongoDB.'
                : 'MongoDB no está conectado. Revisa MONGODB_URI y verifica que el servidor de MongoDB esté activo.'}
            </span>
          </p>

          <div style={{ marginTop: '1rem' }}>
            <strong>¿Cómo conectar un cluster de MongoDB Atlas propio?</strong>
            <p style={{ margin: '0.4rem 0' }}>
              En tu archivo de entorno o variables de configuración, añade tu cadena de conexión MongoDB:
            </p>
            <div className={styles.codeBlock}>
              MONGODB_URI="mongodb+srv://&lt;usuario&gt;:&lt;password&gt;@cluster0.xxxxx.mongodb.net/healthdb"
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.4rem 0 0 0' }}>
              El servidor detecta automáticamente la variable e inicializa Mongoose sin necesidad de reconfigurar la aplicación.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
