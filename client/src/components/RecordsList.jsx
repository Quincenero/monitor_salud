import React, { useState, useMemo } from 'react';
import styles from './RecordsList.module.css';
import {evaluateGlucose, evaluateBpm, evaluateBloodPressure } from '../utils/healthEvaluations';
import { RecordForm } from './RecordForm';
import {
  Search,
  Download,
  Trash2,
  Edit2,
  Calendar,
  Droplets,
  Heart,
  Activity,
  X,
  PlusCircle,
} from 'lucide-react';



export const RecordsList = ({
  records,
  onRecordDeleted,
  onRecordUpdated,
  onOpenNewRecord,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [contextFilter, setContextFilter] = useState('all');
  const [editingRecord, setEditingRecord] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        searchTerm === '' ||
        r.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(r.glucose).includes(searchTerm) ||
        String(r.bpm).includes(searchTerm) ||
        `${r.systolic}/${r.diastolic}`.includes(searchTerm);

      const matchesContext = contextFilter === 'all' || r.context === contextFilter;

      return matchesSearch && matchesContext;
    });
  }, [records, searchTerm, contextFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta medición de salud?')) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/records/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        onRecordDeleted(id);
      } else {
        alert(data.error || 'No se pudo eliminar el registro');
      }
    } catch (err) {
      console.error('Error deleting record:', err);
      alert('Error de conexión al eliminar el registro');
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportCSV = () => {
    if (records.length === 0) return;

    const headers = ['Fecha y Hora', 'Glucemia (mg/dL)', 'BPM (lpm)', 'Presion Sistolica (mmHg)', 'Presion Diastolica (mmHg)', 'Contexto', 'Notas'];
    const rows = records.map((r) => [
      new Date(r.measuredAt).toLocaleString('es-ES'),
      r.glucose,
      r.bpm,
      r.systolic,
      r.diastolic,
      r.context,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `monitoreo_salud_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDateTime = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusColor = (level) => {
    switch (level) {
      case 'optimal': return '#059669';
      case 'caution': return '#2563eb';
      case 'warning': return '#d97706';
      case 'danger': return '#dc2626';
      default: return '#64748b';
    }
  };

  return (
    <div className={styles.listContainer} id="records-list-container">
      {/* Header with Search and Filters */}
      <div className={styles.listHeader}>
        <div className={styles.titleArea}>
          <h3>Historial de Registros</h3>
          <p>Consulta, busca y gestiona tus tomas de salud</p>
        </div>

        <div className={styles.filterBar}>
          <div className={styles.searchBox}>
            <Search size={14} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar por notas o valor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className={styles.contextSelect}
            value={contextFilter}
            onChange={(e) => setContextFilter(e.target.value)}
          >
            <option value="all">Todos los contextos</option>
            <option value="ayunas">En ayunas</option>
            <option value="postprandial">Postprandial</option>
            <option value="reposo">En reposo</option>
            <option value="actividad">Post actividad</option>
            <option value="noche">Noche</option>
          </select>

          <button
            type="button"
            className={styles.exportBtn}
            onClick={handleExportCSV}
            title="Exportar archivo CSV para consulta médica"
            disabled={records.length === 0}
          >
            <Download size={14} />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Fecha y Hora</th>
              <th className={styles.th}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Droplets size={14} color="#0891b2" /> Glucemia
                </span>
              </th>
              <th className={styles.th}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Heart size={14} color="#e11d48" /> Pulso (BPM)
                </span>
              </th>
              <th className={styles.th}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Activity size={14} color="#7c3aed" /> Presión Arterial
                </span>
              </th>
              <th className={styles.th}>Momento</th>
              <th className={styles.th}>Notas</th>
              <th className={styles.th} style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.emptyRow}>
                  {records.length === 0 ? (
                    <div>
                      <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>No hay mediciones registradas</p>
                      <button
                        type="button"
                        onClick={onOpenNewRecord}
                        className={styles.exportBtn}
                        style={{ margin: '0 auto', display: 'inline-flex' }}
                      >
                        <PlusCircle size={14} /> Ingresar medición
                      </button>
                    </div>
                  ) : (
                    'No se encontraron registros con los filtros seleccionados.'
                  )}
                </td>
              </tr>
            ) : (
              filteredRecords.map((r) => {
                const recordId = r.id || r._id || '';
                const gEval = evaluateGlucose(r.glucose, r.context);
                const bEval = evaluateBpm(r.bpm, r.context);
                const bpEval = evaluateBloodPressure(r.systolic, r.diastolic);

                return (
                  <tr key={recordId} className={styles.tr}>
                    <td className={styles.td}>
                      <span style={{ fontWeight: 600, color: '#334155' }}>
                        {formatDateTime(r.measuredAt)}
                      </span>
                    </td>

                    {/* Glucemia */}
                    <td className={styles.td}>
                      <div className={styles.valCell}>
                        <span className={styles.valMain}>{r.glucose} <small style={{ fontWeight: 500, color: '#64748b' }}>mg/dL</small></span>
                        <span className={styles.valSub} style={{ color: getStatusColor(gEval.level) }}>
                          {gEval.label.split('(')[0]}
                        </span>
                      </div>
                    </td>

                    {/* BPM */}
                    <td className={styles.td}>
                      <div className={styles.valCell}>
                        <span className={styles.valMain}>{r.bpm} <small style={{ fontWeight: 500, color: '#64748b' }}>lpm</small></span>
                        <span className={styles.valSub} style={{ color: getStatusColor(bEval.level) }}>
                          {bEval.label.split('(')[0]}
                        </span>
                      </div>
                    </td>

                    {/* Presión */}
                    <td className={styles.td}>
                      <div className={styles.valCell}>
                        <span className={styles.valMain}>
                          {r.systolic} / {r.diastolic} <small style={{ fontWeight: 500, color: '#64748b' }}>mmHg</small>
                        </span>
                        <span className={styles.valSub} style={{ color: getStatusColor(bpEval.level) }}>
                          {bpEval.label.split('(')[0]}
                        </span>
                      </div>
                    </td>

                    {/* Momento */}
                    <td className={styles.td}>
                      <span className={styles.contextPill}>
                        {r.context}
                      </span>
                    </td>

                    {/* Notas */}
                    <td className={styles.td}>
                      <span className={styles.notesText} title={r.notes || 'Sin notas'}>
                        {r.notes || '—'}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className={styles.td} style={{ textAlign: 'right' }}>
                      <div className={styles.actionBtns} style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          title="Editar registro"
                          onClick={() => setEditingRecord(r)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                          title="Eliminar registro"
                          onClick={() => handleDelete(recordId)}
                          disabled={deletingId === recordId}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de edición */}
      {editingRecord && (
        <div className={styles.modalOverlay} onClick={() => setEditingRecord(null)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Editar Medición</h3>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => setEditingRecord(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <RecordForm
                initialData={editingRecord}
                onRecordSaved={(updated) => {
                  onRecordUpdated(updated);
                  setEditingRecord(null);
                }}
                onCancel={() => setEditingRecord(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
