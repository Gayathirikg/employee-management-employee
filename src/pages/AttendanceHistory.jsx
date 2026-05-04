import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import Sidebar from '../components/Sidebar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import API from '../api/axios.js'

const LIMIT = 7

export default function AttendanceHistory() {
  const { employee } = useAuth()
  const [records, setRecords] = useState([])
  const [loading,setLoading] = useState(true)
  const [page,setPage] = useState(1)

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)
      try {
        const { data } = await API.get(`/time/history/${employee._id}`)
        setRecords(data)
      } catch (err) {
        toast.error('Failed to load attendance history')
      } finally {
        setLoading(false)
      }
    }
    if (employee?._id) fetchHistory()
  }, [employee])

  const fmt = (dt) =>
    dt ? new Date(dt).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit'
    }) : '—'

  const fmtDate = (dt) =>
    new Date(dt).toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric',
      month: 'short', year: 'numeric',
    })

  const totalPages = Math.ceil(records.length / LIMIT)
  const paginated  = records.slice((page - 1) * LIMIT, page * LIMIT)

  const workedDays = records.filter(r => r.clockOut).length
  const totalMins  = records
    .filter(r => r.totalMinutes)
    .reduce((acc, r) => acc + (r.totalMinutes || 0), 0)
  const avgHours = workedDays
    ? (totalMins / workedDays / 60).toFixed(1)
    : 0
  const totalSessions = records.reduce(
    (acc, r) => acc + (r.punches?.length || 0), 0
  )

  return (
    <div style={s.layout}>
      <Sidebar />
      <main style={s.main}>

        <h1 style={s.heading}>Attendance History 📅</h1>
        <p style={s.subheading}>Your complete attendance records</p>

        <div style={s.statsGrid}>
          {[
            {
              label: 'Total Days',
              value: records.length,
              icon: '📆', color: '#1d4ed8', bg: '#eff6ff'
            },
            {
              label: 'Days Completed',
              value: workedDays,
              icon: '✅', color: '#15803d', bg: '#f0fdf4'
            },
            {
              label: 'Avg Hours/Day',
              value: `${avgHours}h`,
              icon: '⏱️', color: '#b45309', bg: '#fffbeb'
            },
            {
              label: 'Total Sessions',
              value: totalSessions,
              icon: '🔄', color: '#7c3aed', bg: '#f5f3ff'
            },
          ].map(({ label, value, icon, color, bg }) => (
            <div key={label} style={{ ...s.statCard, background: bg }}>
              <div style={s.statIcon}>{icon}</div>
              <div style={{ ...s.statValue, color }}>{value}</div>
              <div style={s.statLabel}>{label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={s.loader}>Loading records...</div>
        ) : records.length === 0 ? (
          <div style={s.emptyBox}>
            <p style={s.emptyText}>No attendance records found</p>
            <p style={s.emptySub}>Start by punching in from the Clock In / Out page</p>
          </div>
        ) : (
          <>
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>#</th>
                    <th style={s.th}>Date</th>
                    <th style={s.th}>First In</th>
                    <th style={s.th}>Last Out</th>
                    <th style={s.th}>Sessions</th>
                    <th style={s.th}>Total Time</th>
                    <th style={s.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((rec, idx) => {
                    const totalH = Math.floor((rec.totalMinutes || 0) / 60)
                    const totalM = (rec.totalMinutes || 0) % 60

                    let status = 'Incomplete'
                    if (rec.clockOut) status = 'Completed'
                    else if (rec.punches?.length > 0) {
                      const last = rec.punches[rec.punches.length - 1]
                      status = last && !last.punchOut ? 'Working' : 'On Break'
                    }

                    return (
                      <tr key={rec._id}>

                        <td style={s.td}>
                          <span style={s.indexNum}>
                            {(page - 1) * LIMIT + idx + 1}
                          </span>
                        </td>

                        <td style={s.td}>
                          <span style={s.dateText}>
                            {rec.date || fmtDate(rec.clockIn)}
                          </span>
                        </td>

                        <td style={s.td}>
                          <span style={s.timeIn}>{fmt(rec.clockIn)}</span>
                        </td>

                        <td style={s.td}>
                          <span style={s.timeOut}>{fmt(rec.clockOut)}</span>
                        </td>

                        <td style={s.td}>
                          <span style={s.sessionBadge}>
                            🔄 {rec.punches?.length || 0} session{rec.punches?.length !== 1 ? 's' : ''}
                          </span>
                        </td>

                        <td style={s.td}>
                          <span style={s.duration}>
                            {rec.totalMinutes
                              ? `${totalH}h ${totalM}m`
                              : '—'
                            }
                          </span>
                        </td>

                        <td style={s.td}>
                          {status === 'Completed' ? (
                            <span style={s.badgeDone}>✅ Completed</span>
                          ) : status === 'Working' ? (
                            <span style={s.badgeWorking}>🟢 Working</span>
                          ) : status === 'On Break' ? (
                            <span style={s.badgeBreak}>🟡 On Break</span>
                          ) : (
                            <span style={s.badgeNone}>⚪ Incomplete</span>
                          )}
                        </td>

                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={s.pagination}>
                <button
                  style={page === 1 ? s.pgDisabled : s.pg}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ← Prev
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    style={page === i + 1 ? s.pgActive : s.pg}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  style={page === totalPages ? s.pgDisabled : s.pg}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next →
                </button>

                <span style={s.pgInfo}>
                  Page {page} of {totalPages}
                </span>
              </div>
            )}
          </>
        )}

      </main>
    </div>
  )
}

const s = {
  layout: { display: 'flex', fontFamily: "'Segoe UI', sans-serif" },
  main: {
    marginLeft: '250px', flex: 1,
    padding: '32px', background: '#f0f9ff', minHeight: '100vh',
  },
  heading:    { fontSize: '26px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px' },
  subheading: { color: '#64748b', fontSize: '14px', margin: '0 0 24px' },

  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px', marginBottom: '24px',
  },
  statCard:  { borderRadius: '12px', padding: '20px 22px', border: '1px solid #e2e8f0' },
  statIcon:  { fontSize: '22px', marginBottom: '8px' },
  statValue: { fontSize: '28px', fontWeight: '700', margin: '0 0 4px' },
  statLabel: { fontSize: '13px', color: '#64748b' },

  loader: { textAlign: 'center', padding: '60px', color: '#64748b' },

  emptyBox: {
    background: '#fff', borderRadius: '14px',
    padding: '60px', textAlign: 'center', border: '1px solid #e2e8f0',
  },
  emptyIcon: { fontSize: '48px', marginBottom: '12px' },
  emptyText: { fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: '0 0 6px' },
  emptySub:  { fontSize: '14px', color: '#94a3b8', margin: 0 },

  tableWrap: {
    background: '#fff', borderRadius: '14px',
    border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '20px',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '12px 16px', textAlign: 'left',
    background: '#f8fafc', color: '#64748b',
    fontSize: '12px', fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: '0.5px',
    borderBottom: '1px solid #e2e8f0',
  },
  td: { padding: '13px 16px', borderTop: '1px solid #f1f5f9', verticalAlign: 'middle' },

  indexNum:    { fontSize: '13px', color: '#94a3b8', fontWeight: '600' },
  dateText:    { fontSize: '13px', color: '#0f172a', fontWeight: '500' },
  timeIn:      { fontSize: '13px', color: '#15803d', fontWeight: '600' },
  timeOut:     { fontSize: '13px', color: '#dc2626', fontWeight: '600' },
  duration:    { fontSize: '13px', color: '#0369a1', fontWeight: '700' },
  sessionBadge: {
    fontSize: '12px', fontWeight: '600',
    background: '#f5f3ff', color: '#7c3aed',
    padding: '4px 10px', borderRadius: '20px',
  },

  badgeWorking: {
    padding: '4px 10px', borderRadius: '20px',
    background: '#f0fdf4', color: '#15803d',
    fontSize: '12px', fontWeight: '600',
  },
  badgeBreak: {
    padding: '4px 10px', borderRadius: '20px',
    background: '#fffbeb', color: '#b45309',
    fontSize: '12px', fontWeight: '600',
  },
  badgeDone: {
    padding: '4px 10px', borderRadius: '20px',
    background: '#eff6ff', color: '#1d4ed8',
    fontSize: '12px', fontWeight: '600',
  },
  badgeNone: {
    padding: '4px 10px', borderRadius: '20px',
    background: '#f1f5f9', color: '#94a3b8',
    fontSize: '12px', fontWeight: '600',
  },

  pagination: { display: 'flex', gap: '8px', alignItems: 'center' },
  pg: {
    padding: '8px 14px', borderRadius: '7px',
    border: '1.5px solid #e2e8f0', background: '#fff',
    color: '#374151', cursor: 'pointer', fontSize: '13px',
  },
  pgActive: {
    padding: '8px 14px', borderRadius: '7px',
    border: '1.5px solid #0369a1', background: '#0369a1',
    color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
  },
  pgDisabled: {
    padding: '8px 14px', borderRadius: '7px',
    border: '1.5px solid #e2e8f0', background: '#f8fafc',
    color: '#cbd5e1', cursor: 'not-allowed', fontSize: '13px',
  },
  pgInfo: { color: '#64748b', fontSize: '13px', marginLeft: '8px' },
}