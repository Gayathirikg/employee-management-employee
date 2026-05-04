import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Sidebar from '../components/Sidebar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import API from '../api/axios.js'

export default function Dashboard() {
  const { employee } = useAuth()
  const navigate = useNavigate()
  const [todayRecord,setTodayRecord] = useState(null)
  const [clockStatus, setClockStatus] = useState(null) 
  const [loading, setLoading]= useState(true)

  const fetchTodayStatus = async () => {
    try {
      const { data } = await API.get(`/time/history/${employee._id}`)
      const today = new Date().toLocaleDateString()

      const todayEntry = data.find(
        (r) => new Date(r.clockIn).toLocaleDateString() === today
      )

      setTodayRecord(todayEntry || null)

      if (todayEntry && !todayEntry.clockOut)  setClockStatus('in')
      else if (todayEntry && todayEntry.clockOut) setClockStatus('out')
      else setClockStatus(null)

    } catch (err) {
      toast.error('Failed to load today status')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (employee?._id) fetchTodayStatus()
  }, [employee])

  const fmt = (dt) =>
    dt ? new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return ' Good Morning'
    if (h < 17) return 'Good Afternoon'
    return ' Good Evening'
  }

  const statusConfig = {
    in:   { label: 'Currently Working',  color: '#15803d', bg: '#f0fdf4', border: '#86efac', icon: '🟢' },
    out:  { label: 'Work Completed',      color: '#1d4ed8', bg: '#eff6ff', border: '#93c5fd', icon: '✅' },
    null: { label: 'Not Clocked In Yet', color: '#b45309', bg: '#fffbeb', border: '#fde68a', icon: '⚪' },
  }

  const st = statusConfig[clockStatus] || statusConfig[null]

  return (
    <div style={s.layout}>
      <Sidebar />
      <main style={s.main}>

        <div style={s.welcomeCard}>
          <div>
            <p style={s.greeting}>{getGreeting()},</p>
            <h1 style={s.name}>{employee?.name} </h1>
            <p style={s.date}>
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long', year: 'numeric',
                month: 'long', day: 'numeric'
              })}
            </p>
          </div>
          <div style={s.welcomeIcon}></div>
        </div>

        {loading ? (
          <div style={s.loader}>Loading...</div>
        ) : (
          <div style={s.cardGrid}>

            <div style={{ ...s.card, background: st.bg, borderColor: st.border }}>
              <p style={s.cardLabel}>TODAY'S STATUS</p>
              <div style={{ ...s.statusBadge, color: st.color }}>
                {st.icon} {st.label}
              </div>
              {todayRecord && (
                <div style={s.timeRow}>
                  <span>🕐 In: {fmt(todayRecord.clockIn)}</span>
                  <span>🕔 Out: {fmt(todayRecord.clockOut)}</span>
                </div>
              )}
            </div>

            <div style={s.card}>
              <p style={s.cardLabel}>MY INFO</p>
              <div style={s.infoRow}>
                <span style={s.infoKey}>Experience</span>
                <span style={s.infoVal}>{employee?.experience} yrs</span>
              </div>
              <div style={s.infoRow}>
                <span style={s.infoKey}>Payroll</span>
                <span style={s.infoVal}>
                  ₹{Number(employee?.payroll || 0).toLocaleString('en-IN')}/mo
                </span>
              </div>
              <div style={s.infoRow}>
                <span style={s.infoKey}>Email</span>
                <span style={s.infoVal}>{employee?.email}</span>
              </div>
            </div>

          </div>
        )}

        <h3 style={s.sectionTitle}>Quick Actions</h3>
        <div style={s.quickGrid}>
          {[
            { path: '/clock',      icon: '⏱️', label: 'Clock In / Out',    sub: 'Mark your attendance'   },
            { path: '/attendance', icon: '📅', label: 'Attendance History', sub: 'View your past records' },
            { path: '/profile',    icon: '👤', label: 'Edit Profile',       sub: 'Update your info'       },
          ].map(({ path, icon, label, sub }) => (
            <div
              key={path}
              style={s.quickCard}
              onClick={() => navigate(path)}
            >
              <div style={s.quickIcon}>{icon}</div>
              <p style={s.quickLabel}>{label}</p>
              <p style={s.quickSub}>{sub}</p>
            </div>
          ))}
        </div>

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
  welcomeCard: {
    background: 'linear-gradient(135deg, #0369a1, #0284c7)',
    borderRadius: '16px', padding: '28px 32px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '24px',
  },
  greeting:    { fontSize: '14px', color: '#bae6fd', margin: '0 0 4px' },
  name:        { fontSize: '28px', fontWeight: '700', color: '#fff', margin: '0 0 6px' },
  date:        { fontSize: '13px', color: '#bae6fd', margin: 0 },
  welcomeIcon: { fontSize: '60px' },

  loader: { textAlign: 'center', padding: '40px', color: '#64748b' },

  cardGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: '20px', marginBottom: '28px',
  },
  card: {
    background: '#fff', borderRadius: '14px',
    padding: '24px', border: '2px solid #e2e8f0',
  },
  cardLabel: {
    fontSize: '11px', color: '#64748b', fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 14px',
  },
  statusBadge: { fontSize: '18px', fontWeight: '700', marginBottom: '12px' },
  timeRow: { display: 'flex', gap: '20px', fontSize: '13px', color: '#475569' },

  infoRow: {
    display: 'flex', justifyContent: 'space-between',
    padding: '8px 0', borderBottom: '1px solid #f1f5f9',
  },
  infoKey: { fontSize: '13px', color: '#64748b' },
  infoVal: { fontSize: '13px', color: '#0f172a', fontWeight: '600' },

  sectionTitle: { fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 14px' },
  quickGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px',
  },
  quickCard: {
    background: '#fff', borderRadius: '14px',
    padding: '24px', border: '1px solid #e2e8f0',
    cursor: 'pointer',
  },
  quickIcon:  { fontSize: '28px', marginBottom: '10px' },
  quickLabel: { fontSize: '15px', fontWeight: '600', color: '#0f172a', margin: '0 0 4px' },
  quickSub:   { fontSize: '12px', color: '#94a3b8', margin: 0 },
}