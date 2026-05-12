import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import socket from '../socket.js';

const navItems = [
  { path: '/', icon: '🏠', label: 'Dashboard' },
  { path: '/profile', icon: '👤', label: 'My Profile'},
  { path: '/clock',  icon: '⏱️', label: 'Clock In / Out' },
  { path: '/attendance', icon: '📅', label: 'Attendance History'},
    { path: '/chat',icon: '💬', label: 'Chat'}, 

]

export default function Sidebar() {
  const { pathname } = useLocation()
  const { logout, employee } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
  socket.disconnect(); 
  logout();
  navigate('/login');
};

  const Initials = (name = '') =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <aside style={s.sidebar}>

      <div style={s.logo}>
        <span style={s.logoIcon}>💼</span>
        <div>
          <p style={s.logoTitle}>Employee</p>
          <p style={s.logoSub}>Portal</p>
        </div>
      </div>

      <nav style={s.nav}>
        <p style={s.navLabel}>NAVIGATION</p>
        {navItems.map(({ path, icon, label }) => {
          const isActive = pathname === path
          return (
            <Link
              key={path}
              to={path}
              style={isActive ? s.linkActive : s.link}
            >
              <span style={s.icon}>{icon}</span>
              <span>{label}</span>
              {isActive && <span style={s.dot} />}
            </Link>
          )
        })}
      </nav>

      <div style={s.bottom}>
        <div style={s.profileCard}>
          <div style={s.avatar}>
            {Initials(employee?.name)}
          </div>
          <div style={s.profileInfo}>
            <p style={s.profileName}>{employee?.name || 'Employee'}</p>
            <p style={s.profileEmail}>{employee?.email || ''}</p>
          </div>
        </div>
        <button style={s.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>

    </aside>
  )
}

const s = {
  sidebar: {
    width: '250px',
    minHeight: '100vh',
    background: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    left: 0, top: 0, bottom: 0,
    zIndex: 100,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '24px 20px',
    borderBottom: '1px solid #1e293b',
  },
  logoIcon:  { fontSize: '28px' },
  logoTitle: { color: '#fff', fontSize: '16px', fontWeight: '700', margin: 0 },
  logoSub:   { color: '#475569', fontSize: '12px', margin: 0 },

  nav:      { flex: 1, padding: '20px 12px' },
  navLabel: {
    color: '#475569', fontSize: '11px', fontWeight: '700',
    letterSpacing: '1px', padding: '0 8px', marginBottom: '8px',
  },
  link: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '11px 14px', borderRadius: '8px',
    textDecoration: 'none', color: '#94a3b8',
    fontSize: '14px', marginBottom: '2px',
  },
  linkActive: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '11px 14px', borderRadius: '8px',
    textDecoration: 'none', color: '#fff',
    fontSize: '14px', fontWeight: '600',
    marginBottom: '2px', background: '#0369a1',
  },
  icon: { fontSize: '16px' },
  dot: {
    width: '6px', height: '6px', borderRadius: '50%',
    background: '#38bdf8', marginLeft: 'auto',
  },

  bottom: { padding: '16px 12px', borderTop: '1px solid #1e293b' },
  profileCard: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '12px', borderRadius: '8px',
    background: '#1e293b', marginBottom: '10px',
  },
  avatar: {
    width: '38px', height: '38px', borderRadius: '50%',
    background: '#0369a1', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '700', fontSize: '14px', flexShrink: 0,
  },
  profileInfo: { overflow: 'hidden' },
  profileName: {
    color: '#fff', fontSize: '13px', fontWeight: '600', margin: 0,
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  profileEmail: {
    color: '#64748b', fontSize: '11px', margin: '2px 0 0',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  logoutBtn: {
    width: '100%', padding: '10px', borderRadius: '8px',
    border: 'none', background: '#7f1d1d',
    color: '#fca5a5', cursor: 'pointer',
    fontSize: '13px', fontWeight: '600',
  },
}