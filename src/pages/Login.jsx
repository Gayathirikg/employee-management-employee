import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext.jsx'
import API from '../api/axios.js'

export default function Login() {
  const [form, setForm]= useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleChange = (e) => {  
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const validate = () => {
    if (!form.email || !form.password) return 'Email and password are required'
    if (!/\S+@\S+\.\S+/.test(form.email))  return 'Enter a valid email address'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const err = validate()
    if (err) return toast.error(err)

    setLoading(true)
    try {
      const { data } = await API.post('/auth/employee-login', form)
      login(data.token, data.employee)
      toast.success(`Welcome, ${data.employee.name}! `)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>

      <div style={s.left}>
        <div style={s.leftContent}>
          <h1 style={s.leftTitle}>Employee Portal</h1>
          <p style={s.leftSub}>
            Track your attendance, manage your profile, and stay connected.
          </p>
          <div style={s.featureList}>
            {[
              '⏱️  Clock In & Clock Out',
              '📅  View Attendance History',
              '👤  Manage Your Profile',
              '📊  Track Your Work Hours',
            ].map((f) => (
              <div key={f} style={s.featureItem}>{f}</div>
            ))}
          </div>
        </div>
      </div>

      <div style={s.right}>
        <div style={s.card}>
          <div style={s.cardTop}>
            <div style={s.cardIcon}></div>
            <h2 style={s.cardTitle}>Sign In</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={s.fieldWrap}>
              <label style={s.label}>Email Address</label>
              <input
                style={s.input}
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div style={s.fieldWrap}>
              <label style={s.label}>Password</label>
              <input
                style={s.input}
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              style={loading ? s.btnDisabled : s.btn}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

         
        </div>
      </div>

    </div>
  )
}

const s = {
  page: {
    display: 'flex', minHeight: '100vh',
    fontFamily: "'Segoe UI', sans-serif",
  },
  left: {
    flex: 1,
    background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 60%, #0284c7 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '60px 48px',
  },
  leftContent: { maxWidth: '420px' },
  bigIcon:     { fontSize: '52px', marginBottom: '20px' },
  leftTitle:   { fontSize: '34px', fontWeight: '700', color: '#fff', margin: '0 0 12px' },
  leftSub:     { fontSize: '15px', color: '#bae6fd', margin: '0 0 36px', lineHeight: '1.6' },
  featureList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  featureItem: {
    fontSize: '14px', color: '#e0f2fe',
    background: 'rgba(255,255,255,0.1)',
    padding: '12px 16px', borderRadius: '8px',
    borderLeft: '3px solid #38bdf8',
  },

  right: {
    width: '460px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#f0f9ff', padding: '40px',
  },
  card: {
    background: '#fff', borderRadius: '20px', padding: '40px',
    width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  },
  cardTop:   { textAlign: 'center', marginBottom: '28px' },
  cardIcon:  { fontSize: '40px', marginBottom: '12px' },
  cardTitle: { fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px' },
  cardSub:   { color: '#64748b', fontSize: '14px', margin: 0 },

  fieldWrap: { marginBottom: '18px' },
  label: {
    display: 'block', fontSize: '13px',
    fontWeight: '600', color: '#374151', marginBottom: '6px',
  },
  input: {
    width: '100%', padding: '12px 14px', borderRadius: '9px',
    border: '1.5px solid #e2e8f0', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box', color: '#0f172a',
  },
  btn: {
    width: '100%', padding: '14px', borderRadius: '9px',
    border: 'none', background: '#0369a1',
    color: '#fff', fontSize: '15px', fontWeight: '600',
    cursor: 'pointer', marginTop: '4px',
  },
  btnDisabled: {
    width: '100%', padding: '14px', borderRadius: '9px',
    border: 'none', background: '#7dd3fc',
    color: '#fff', fontSize: '15px', fontWeight: '600',
    cursor: 'not-allowed', marginTop: '4px',
  },
  note: {
    marginTop: '20px', textAlign: 'center',
    color: '#94a3b8', fontSize: '12px',
  },
}