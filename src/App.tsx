import { useState, FormEvent } from 'react'
import { Routes, Route, Navigate, NavLink, useNavigate, useParams } from 'react-router-dom'
import { Bell, LogOut, Menu, Hotel, X } from 'lucide-react'
import { useStore } from './store'
import { PAGES, NAV } from './pages'
import { Role } from './config/hotel'

const ROLES: Role[] = ['manager', 'receptionist', 'housekeeping', 'administrator']

function Login() {
  const { login } = useStore(); const nav = useNavigate()
  const [u, setU] = useState(''); const [p, setP] = useState(''); const [err, setErr] = useState('')
  const submit = (e: FormEvent) => { e.preventDefault(); const r = u.trim().toLowerCase() as Role
    if (!ROLES.includes(r)) return setErr('Unknown username. Try one of the demo roles below.')
    if (!p) return setErr('Please enter a password (any value works in this demo).')
    login(r); nav('/app/overview') }
  return <div className="min-h-screen flex items-center justify-center p-4"><div className="card hover:translate-y-0 w-full max-w-md p-8 shadow-[0_24px_60px_rgba(41,37,36,0.10)]">
    <div className="card-stripe !h-1.5" />
    <div className="text-center mb-6"><span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-burgundy/10 text-burgundy"><Hotel /></span><h1 className="font-serif text-3xl mt-3">HotelOS</h1><p className="text-sm text-mute">The Meridian Hotel · Staff Portal</p></div>
    <form onSubmit={submit} className="space-y-3"><input className="inp" placeholder="Username" value={u} onChange={e => setU(e.target.value)} />
      <input className="inp" type="password" placeholder="Password" value={p} onChange={e => setP(e.target.value)} />
      {err && <p className="text-sm text-burgundy">{err}</p>}<button className="btn btn-p w-full justify-center">Sign in</button></form>
    <p className="text-xs text-mute mt-6 mb-2">Demo roles (any password):</p>
    <div className="grid grid-cols-2 gap-2">{ROLES.map(r => <button key={r} className="btn justify-center capitalize" onClick={() => { setU(r); setP(p || 'demo') }}>{r}</button>)}</div></div></div>
}

const NOTES = ['Room 110 needs cleaning', 'Reservation MER-1009 awaiting confirmation', 'Maintenance: Room 106 out of service']

function Shell() {
  const { user, logout } = useStore(); const { page = 'overview' } = useParams(); const nav = useNavigate()
  const [open, setOpen] = useState(false); const [bell, setBell] = useState(false); const [read, setRead] = useState(false)
  if (!user) return <Navigate to="/login" />
  const items = NAV[user]; const Page = PAGES[user][page]
  if (!Page) return <Navigate to="/app/overview" />
  return <div className="min-h-screen flex">
    <aside className={`fixed md:static z-50 inset-y-0 left-0 w-64 bg-white border-r border-line p-5 shadow-[8px_0_24px_rgba(41,37,36,0.03)] transition-transform ${open ? '' : '-translate-x-full'} md:translate-x-0`}>
      <h2 className="font-serif text-2xl text-burgundy">HotelOS</h2><p className="text-xs text-mute mb-6">The Meridian Hotel</p>
      <nav className="space-y-1">{items.map(([k, l]) => <NavLink key={k} to={`/app/${k}`} onClick={() => setOpen(false)} className={({ isActive }) => `block rounded-lg px-3 py-2 text-sm transition ${isActive ? 'bg-burgundy text-white' : 'hover:bg-cream'}`}>{l}</NavLink>)}</nav></aside>
    <div className="flex-1 min-w-0">
       <header className="relative z-30 flex items-center justify-between px-6 py-3 bg-white border-b border-line">
        <div className="flex items-center gap-3"><button className="md:hidden" onClick={() => setOpen(!open)}><Menu /></button><span className="text-sm text-mute">{new Date().toLocaleDateString('en-GB', { dateStyle: 'full' })}</span></div>
        <div className="flex items-center gap-4 relative"><button type="button" onClick={() => { setBell(!bell); setRead(true) }} className="relative"><Bell size={20} />{!read && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-burgundy" />}</button>
           {bell && <div className="card hover:translate-y-0 absolute right-0 top-8 z-[60] w-72 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-5rem)] overflow-y-auto bg-white p-3 text-sm space-y-2 origin-top-right"><div className="card-stripe" /><div className="flex items-center justify-between pb-1"><h3 className="font-serif text-base">Notifications</h3><button type="button" aria-label="Close notifications" className="rounded-lg p-1 hover:bg-cream" onClick={() => setBell(false)}><X size={16} /></button></div>{NOTES.map(n => <p key={n} className="rounded-lg bg-cream/80 px-2.5 py-2">{n}</p>)}</div>}
          <span className="text-sm capitalize hidden sm:block">{user}</span>
          <button className="btn" onClick={() => { logout(); nav('/login') }}><LogOut size={14} />Logout</button></div></header>
      <main className="p-6 max-w-7xl"><h1 className="font-serif text-3xl mb-6">{items.find(i => i[0] === page)?.[1]}</h1><Page /></main></div></div>
}
export default function App() {
  return <Routes><Route path="/login" element={<Login />} /><Route path="/app/:page?" element={<Shell />} /><Route path="*" element={<Navigate to="/login" />} /></Routes>
}
