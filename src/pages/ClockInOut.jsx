import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import Sidebar from '../components/Sidebar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import API from '../api/axios.js'

export default function ClockInOut() {
  const { employee } = useAuth()

  const [record, setRecord] = useState(null)
  const [status, setStatus] = useState(null) 
  const [loading,setLoading] = useState(true)
  const [actionLoad, setActionLoad]= useState(false)
  const [time, setTime]= useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const fetchStatus = async () => {
    try {
      const { data } = await API.get(`/time/history/${employee._id}`)

      const today = new Date()
      const todayStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`

      const todayRecord = data.find((r) => r.date === todayStr)

      if (todayRecord) {
        setRecord(todayRecord)
        const lastPunch = todayRecord.punches[todayRecord.punches.length - 1]
        if (lastPunch && !lastPunch.punchOut) {
          setStatus('in')  
        } else {
          setStatus('out')
        }
      } else {
        setRecord(null)
        setStatus(null)    
      }
    } catch (err) {
      toast.error('Failed to fetch status')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (employee?._id) fetchStatus()
  }, [employee])

  const handlePunchIn = async () => {
    setActionLoad(true)
    try {
      const { data } = await API.post('/time/clock-in', {
        employeeId: employee._id
      })
      setRecord(data)
      setStatus('in')
      toast.success(
        record
          ? ' Welcome back! '
          : ' Good Morning! '
      )
    } catch (err) {
      toast.error(err.response?.data?.message || 'Punch In failed')
    } finally {
      setActionLoad(false)
    }
  }

  const handleBreak = async () => {
    setActionLoad(true)
    try {
      const { data } = await API.put('/time/clock-out', {
        employeeId: employee._id,
        isFinal: false        
      })
      setRecord(data)
      setStatus('out')
      toast.success(' Enjoy your break!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setActionLoad(false)
    }
  }

  const handleEndDay = async () => {
    if (!window.confirm('Are you sure you want to end your work day?')) return
    setActionLoad(true)
    try {
      const { data } = await API.put('/time/clock-out', {
        employeeId: employee._id,
        isFinal: true    
      })
      setRecord(data)
      setStatus('ended')      
      toast.success('See you tomorrow ')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setActionLoad(false)
    }
  }

  const fmt = (dt) =>
    dt ? new Date(dt).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }) : '—'

  const getTotalWorked = () => {
    if (!record?.punches?.length) return '0h 0m 0s'
    const total = record.punches.reduce((acc, p) => {
      if (!p.punchIn) return acc
      const end  = p.punchOut ? new Date(p.punchOut) : new Date()
      const diff = Math.floor((end - new Date(p.punchIn)) / 1000)
      return acc + diff
    }, 0)
    const h   = Math.floor(total / 3600)
    const m   = Math.floor((total % 3600) / 60)
    const sec = total % 60
    return `${h}h ${m}m ${sec}s`
  }

  const statusConfig = {
    null:  { 
      label: 
        'Not Started', 
         color: '#94a3b8', 
         bg: '#f8fafc',
          border: '#e2e8f0'
         },
    in:{ 
      label: 'Working',
             color: '#15803d',
              bg: '#f0fdf4',
               border: '#86efac'
               },
    out:{ 
      label: 'On Break',  
          color: '#b45309',
           bg: '#fffbeb',
            border: '#fde68a'
           },
    ended:{
      label: 'Day Completed', 
      color: '#1d4ed8',
       bg: '#eff6ff', 
       border: '#93c5fd'
       },
  }

  const st = statusConfig[status] || statusConfig[null]

  return (
    <div style={s.layout}>
      <Sidebar />
      <main style={s.main}>

        <h1 style={s.heading}>Punch In / Out </h1>
        <p style={s.subheading}>
          Mark your attendance —  (Break / Lunch)
        </p>

        {loading ? (
          <div style={s.loader}> Loading your status...</div>
        ) : (
          <div style={s.content}>

            <div style={s.clockCard}>
              <p style={s.clockDate}>
                {time.toLocaleDateString('en-IN', {
                  weekday: 'long', year: 'numeric',
                  month: 'long', day: 'numeric'
                })}
              </p>
              <p style={s.clockTime}>
                {time.toLocaleTimeString('en-IN', {
                  hour: '2-digit', minute: '2-digit', second: '2-digit'
                })}
              </p>
              <p style={s.clockLabel}>Current Time</p>
            </div>

            <div style={s.rowCards}>

              <div style={{
                ...s.statusCard,
                background: st.bg,
                borderColor: st.border,
              }}>
                <span style={s.statusIcon}>{st.icon}</span>
                <div>
                  <p style={s.statusSmall}>Current Status</p>
                  <p style={{ ...s.statusLabel, color: st.color }}>{st.label}</p>
                </div>
              </div>

              <div style={s.totalCard}>
                <p style={s.totalSmall}> Total Worked Today</p>
                <p style={s.totalValue}>{getTotalWorked()}</p>
                {record && (
                  <p style={s.punchCount}>
                    {record.punches?.length || 0} punch session{record.punches?.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

            </div>

            {record?.punches?.length > 0 && (
              <div style={s.historyCard}>
                <p style={s.historyTitle}> Today's Punch History</p>
                <table style={s.punchTable}>
                  <thead>
                    <tr>
                      <th style={s.pth}>#</th>
                      <th style={s.pth}>Punch In</th>
                      <th style={s.pth}>Punch Out</th>
                      <th style={s.pth}>Duration</th>
                      <th style={s.pth}>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.punches.map((punch, idx) => {
                      const isActive = !punch.punchOut
                      const diffSec  = punch.punchIn
                        ? Math.floor(
                            ((punch.punchOut ? new Date(punch.punchOut) : new Date()) -
                              new Date(punch.punchIn)) / 1000
                          )
                        : 0
                      const h = Math.floor(diffSec / 3600)
                      const m = Math.floor((diffSec % 3600) / 60)
                      const sc = diffSec % 60

                      return (
                        <tr key={idx}>
                          <td style={s.ptd}>{idx + 1}</td>
                          <td style={{ ...s.ptd, color: '#15803d', fontWeight: '600' }}>
                            {fmt(punch.punchIn)}
                          </td>
                          <td style={{ ...s.ptd, color: '#dc2626', fontWeight: '600' }}>
                            {punch.punchOut ? fmt(punch.punchOut) : (
                              <span style={s.activeBadge}> Active</span>
                            )}
                          </td>
                          <td style={{ ...s.ptd, color: '#0369a1', fontWeight: '600' }}>
                            {isActive
                              ? `${h}h ${m}m ${sc}s`
                              : `${h}h ${m}m`
                            }
                          </td>
                          <td style={s.ptd}>
                            {idx === 0
                              ? <span style={s.badgeFirst}>Start</span>
                              : <span style={s.badgeReturn}> Return</span>
                            }
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div style={s.btnSection}>

              {(status === null || status === 'out') && (
                <button
                  style={actionLoad ? s.btnDisabled : s.punchInBtn}
                  onClick={handlePunchIn}
                  disabled={actionLoad}
                >
                  {actionLoad
                    ? ' Please wait...'
                    : status === null
                      ? ' Start Work (Punch In)'
                      : ' Punch In (Back from Break)'
                  }
                </button>
              )}

              {status === 'in' && (
                <div style={s.btnGroup}>
                  <button
                    style={actionLoad ? s.btnDisabled : s.breakBtn}
                    onClick={handleBreak}
                    disabled={actionLoad}
                  >
                    {actionLoad ? '⏳...' : ' Go for Break / Lunch'}
                  </button>
                  <button
                    style={actionLoad ? s.btnDisabled : s.endDayBtn}
                    onClick={handleEndDay}
                    disabled={actionLoad}
                  >
                    {actionLoad ? '⏳...' : 'End Work Day'}
                  </button>
                </div>
              )}

              {status === 'ended' && (
                <div style={s.doneMsg}>
                   Work day completed! Rest well, see you tomorrow 
                </div>
              )}

            </div>

          </div>
        )}
      </main>
    </div>
  )
}

const s = {
  layout: {
    display: 'flex',
     fontFamily: "'Segoe UI', sans-serif"
     },
  main: {
    marginLeft: '250px', flex: 1,
    padding: '32px', background: '#f0f9ff', minHeight: '100vh',
  },
  heading:{ 
    fontSize: '26px',
     fontWeight: '700',
      color: '#0f172a',
       margin: '0 0 4px'
       },
  subheading:{
     color: '#64748b', 
     fontSize: '14px',
      margin: '0 0 28px'
     },
  loader: { 
    textAlign: 'center',
     padding: '60px',
      color: '#64748b' 
    },
  content: {
     display: 'flex',
      flexDirection: 'column', 
      gap: '20px',
       maxWidth: '700px' 
      },

  clockCard:{
    background: 'linear-gradient(135deg, #0c4a6e, #0369a1)',
    borderRadius: '16px', padding: '32px', textAlign: 'center',
  },
  clockDate:{
     fontSize: '14px',
      color: '#bae6fd',
       margin: '0 0 8px' 
      },
  clockTime:{
    fontSize: '52px',
     fontWeight: '700',
      color: '#fff',
    margin: 0,
     letterSpacing: '2px',
  },
  clockLabel:{ 
    fontSize: '13px', 
    color: '#7dd3fc', 
    margin: '8px 0 0'
   },

  rowCards: { 
    display: 'flex',
     gap: '16px'
     },

  statusCard: {
    flex: 1, borderRadius: '12px', padding: '20px 24px',
    border: '2px solid', display: 'flex', alignItems: 'center', gap: '16px',
  },
  statusIcon:  { fontSize: '32px' },
  statusSmall: { fontSize: '11px', color: '#64748b', fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px' },
  statusLabel: { fontSize: '18px', fontWeight: '700', margin: 0 },

  totalCard: {
    flex: 1, background: '#fff', borderRadius: '12px',
    padding: '20px 24px', border: '1px solid #e2e8f0', textAlign: 'center',
  },
  totalSmall:  { fontSize: '12px', color: '#64748b', fontWeight: '600', margin: '0 0 8px' },
  totalValue:  { fontSize: '28px', fontWeight: '700', color: '#0369a1', margin: '0 0 4px' },
  punchCount:  { fontSize: '12px', color: '#94a3b8', margin: 0 },

  historyCard: {
    background: '#fff', borderRadius: '12px',
    padding: '20px', border: '1px solid #e2e8f0',
  },
  historyTitle: {
    fontSize: '14px', fontWeight: '700',
    color: '#0f172a', margin: '0 0 16px',
  },
  punchTable: { width: '100%', borderCollapse: 'collapse' },
  pth: {
    padding: '10px 12px', textAlign: 'left',
    background: '#f8fafc', color: '#64748b',
    fontSize: '11px', fontWeight: '700',
    textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0',
  },
  ptd: {
    padding: '11px 12px', borderTop: '1px solid #f1f5f9',
    fontSize: '13px', color: '#374151',
  },
  activeBadge: {
    fontSize: '11px', fontWeight: '600',
    background: '#fef2f2', color: '#dc2626',
    padding: '3px 8px', borderRadius: '20px',
  },
  badgeFirst: {
    padding: '3px 8px', borderRadius: '20px',
    background: '#eff6ff', color: '#1d4ed8',
    fontSize: '11px', fontWeight: '600',
  },
  badgeReturn: {
    padding: '3px 8px', borderRadius: '20px',
    background: '#f0fdf4', color: '#15803d',
    fontSize: '11px', fontWeight: '600',
  },

  btnSection: { display: 'flex', justifyContent: 'center' },
  btnGroup:   { display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' },

  punchInBtn: {
    padding: '16px 48px', borderRadius: '12px', border: 'none',
    background: '#15803d', color: '#fff',
    fontSize: '16px', fontWeight: '700', cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(21,128,61,0.3)',
  },
  breakBtn: {
    padding: '16px 32px', borderRadius: '12px', border: 'none',
    background: '#b45309', color: '#fff',
    fontSize: '15px', fontWeight: '700', cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(180,83,9,0.3)',
  },
  endDayBtn: {
    padding: '16px 32px', borderRadius: '12px', border: 'none',
    background: '#dc2626', color: '#fff',
    fontSize: '15px', fontWeight: '700', cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(220,38,38,0.3)',
  },
  btnDisabled: {
    padding: '16px 48px', borderRadius: '12px', border: 'none',
    background: '#94a3b8', color: '#fff',
    fontSize: '15px', fontWeight: '700', cursor: 'not-allowed',
  },
  doneMsg: {
    background: '#f0fdf4', border: '2px solid #86efac',
    borderRadius: '12px', padding: '20px 32px',
    color: '#15803d', fontSize: '16px',
    fontWeight: '600', textAlign: 'center',
  },
}