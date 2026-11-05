import { FC, useState, FormEvent } from 'react'
import { useStore } from './store'
import { Badge, Card, Stat, Table, Modal, Grid, RoomBoard, Feed } from './ui'
import { FLOORS, TYPES, Role, TODAY, thb, bill, stats, RATES, RoomType, Reservation } from './config/hotel'
import { ACTIVITY, LOGS } from './mock'

const useTotals = () => {
  const { rooms, res } = useStore()
  const type = (n: number) => rooms.find(r => r.no === n)!.type
  const paid = res.filter(r => r.pay === 'Paid' && r.status !== 'Cancelled')
  const byType = TYPES.map(t => ({ t, v: paid.filter(r => type(r.roomNo) === t).reduce((a, r) => a + bill(r, t).total, 0) }))
  return { type, byType, revenue: byType.reduce((a, b) => a + b.v, 0) }
}
const Bars = ({ data }: { data: { l: string; v: number; label: string }[] }) => {
  const max = Math.max(1, ...data.map(d => d.v))
  return <div className="space-y-3">{data.map(d => <div key={d.l} className="flex items-center gap-3 text-sm"><span className="w-28 shrink-0 text-xs font-medium text-ink/70">{d.l}</span>
    <div className="flex-1 h-2.5 bg-cream rounded-full overflow-hidden border border-line/60"><div className="h-full rounded-full bg-gradient-to-r from-burgundy to-gold" style={{ width: `${(d.v / max) * 100}%` }} /></div><span className="w-24 text-right text-sm font-medium tabular-nums">{d.label}</span></div>)}</div>
}
const ResTable = ({ rows }: { rows: Reservation[] }) => {
  const { type } = useTotals()
  return <Table heads={['Ref', 'Guest', 'Room', 'Check-in', 'Check-out', 'Status']}>{rows.map(r => <tr key={r.ref}><td>{r.ref}</td><td>{r.guest}</td><td>{r.roomNo} · {type(r.roomNo)}</td><td>{r.in}</td><td>{r.out}</td><td><Badge s={r.status} /></td></tr>)}</Table>
}

const RoomStatusBars = ({ scope }: { scope?: number }) => {
  const { rooms } = useStore(); const s = stats(rooms.filter(r => !scope || r.floor === scope))
  return <Bars data={[['Occupied', s.occ], ['Available', s.avail], ['Reserved', s.resv], ['Needs cleaning', s.dirty], ['Cleaning', s.clean], ['Inspection', s.insp], ['Out of service', s.oos]].map(([l, v]) => ({ l: l as string, v: v as number, label: String(v) }))} />
}

const ManagerOverview: FC = () => {
  const { rooms, res } = useStore(); const s = stats(rooms); const t = useTotals()
  return <div className="space-y-6">
    <Grid><Stat label="Total rooms" value={s.total} /><Stat label="Occupied" value={s.occ} /><Stat label="Available" value={s.avail} /><Stat label="Reserved" value={s.resv} />
      <Stat label="Needs cleaning" value={s.dirty} /><Stat label="Occupancy" value={`${s.rate}%`} sub="occupied ÷ (total − out of service)" />
      <Stat label="Arrivals today" value={res.filter(r => r.in === TODAY && r.status === 'Confirmed').length} /><Stat label="Departures today" value={res.filter(r => r.out === TODAY && r.status === 'Checked In').length} /></Grid>
    <div className="grid lg:grid-cols-2 gap-6">
      <Card title="Occupancy by floor"><Bars data={FLOORS.map(f => { const x = stats(rooms.filter(r => r.floor === f)); return { l: `Floor ${f}`, v: x.rate, label: `${x.rate}%` } })} /></Card>
      <Card title="Revenue overview (paid, incl. tax)" right={<span className="font-serif">{thb(t.revenue)}</span>}><Bars data={t.byType.map(x => ({ l: x.t, v: x.v, label: thb(x.v) }))} /></Card>
      <Card title="Room status overview"><RoomStatusBars /></Card>
      <Card title="Recent activity"><Feed items={ACTIVITY} /></Card>
    </div>
    <Card title="Recent reservations"><ResTable rows={res.slice(0, 5)} /></Card>
  </div>
}
const RoomsPage: FC = () => <RoomBoard />

const ReservationsBase = ({ edit }: { edit: boolean }) => {
  const { res, rooms, create, cancel } = useStore(); const t = useTotals()
  const [q, setQ] = useState(''); const [st, setSt] = useState(''); const [view, setView] = useState<Reservation | null>(null); const [open, setOpen] = useState(false)
  const [f, setF] = useState({ guest: '', email: '', nat: 'Thai', pax: 1, in: TODAY, out: TODAY, roomNo: 0 })
  const rows = res.filter(r => (r.guest + r.ref).toLowerCase().includes(q.toLowerCase()) && (!st || r.status === st))
  const submit = (e: FormEvent) => { e.preventDefault(); if (!f.guest || !f.roomNo) return; create({ ...f, phone: '+66 80 000 0000' }); setOpen(false) }
  return <Card title="Reservations" right={edit && <button className="btn btn-p" onClick={() => setOpen(true)}>New reservation</button>}>
    <div className="flex gap-2 mb-3"><input className="inp" placeholder="Search guest or reference" value={q} onChange={e => setQ(e.target.value)} />
      <select className="inp !w-auto" value={st} onChange={e => setSt(e.target.value)}><option value="">All</option>{['Pending', 'Confirmed', 'Checked In', 'Checked Out', 'Cancelled'].map(s => <option key={s}>{s}</option>)}</select></div>
    <Table heads={['Ref', 'Guest', 'Room', 'Dates', 'Guests', 'Status', 'Payment', '']}>{rows.map(r => <tr key={r.ref}><td>{r.ref}</td><td>{r.guest}</td><td>{r.roomNo} · {t.type(r.roomNo)}</td><td>{r.in} → {r.out}</td><td>{r.pax}</td><td><Badge s={r.status} /></td><td><Badge s={r.pay} /></td>
      <td className="whitespace-nowrap"><button className="btn" onClick={() => setView(r)}>View</button> {edit && (r.status === 'Confirmed' || r.status === 'Pending') && <button className="btn" onClick={() => cancel(r.ref)}>Cancel</button>}</td></tr>)}</Table>
    {view && <Modal title={view.ref} onClose={() => setView(null)}><p className="text-sm">{view.guest} · {view.nat}<br />{view.email} · {view.phone}<br />Room {view.roomNo} ({t.type(view.roomNo)}) · {view.pax} guest(s)<br />{view.in} → {view.out}</p></Modal>}
    {open && <Modal title="New reservation" onClose={() => setOpen(false)}><form className="space-y-3" onSubmit={submit}>
      <input className="inp" placeholder="Guest name" value={f.guest} onChange={e => setF({ ...f, guest: e.target.value })} />
      <input className="inp" placeholder="Email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} />
      <div className="flex gap-2"><input className="inp" type="date" value={f.in} onChange={e => setF({ ...f, in: e.target.value })} /><input className="inp" type="date" value={f.out} onChange={e => setF({ ...f, out: e.target.value })} />
        <input className="inp" type="number" min={1} value={f.pax} onChange={e => setF({ ...f, pax: +e.target.value })} /></div>
      <select className="inp" value={f.roomNo} onChange={e => setF({ ...f, roomNo: +e.target.value })}><option value={0}>Select an available room</option>
        {rooms.filter(r => r.status === 'Available').map(r => <option key={r.no} value={r.no}>{r.no} – {r.type} ({thb(RATES[r.type])})</option>)}</select>
      <button className="btn btn-p">Create</button></form></Modal>}
  </Card>
}
const GuestsPage: FC = () => {
  const { res } = useStore(); const [q, setQ] = useState('')
  const guests = [...new Set(res.map(r => r.email))].map(e => res.filter(r => r.email === e)).filter(g => g[0].guest.toLowerCase().includes(q.toLowerCase()))
  return <Card title="Guests"><input className="inp mb-3" placeholder="Search guests" value={q} onChange={e => setQ(e.target.value)} />
    <Table heads={['Name', 'Email', 'Phone', 'Nationality', 'Stays', 'Current']}>{guests.map(g => <tr key={g[0].email}><td>{g[0].guest}</td><td>{g[0].email}</td><td>{g[0].phone}</td><td>{g[0].nat}</td><td>{g.map(r => r.ref).join(', ')}</td><td><Badge s={g[0].status} /></td></tr>)}</Table></Card>
}
const Overview2 = ({ title, rows, act }: { title: string; rows: Reservation[]; act?: (r: Reservation) => JSX.Element }) => { const t = useTotals(); return <Card title={title}>
  <Table heads={['Ref', 'Guest', 'Room', '']}>{rows.map(r => <tr key={r.ref}><td>{r.ref}</td><td>{r.guest}</td><td>{r.roomNo} · {t.type(r.roomNo)}</td><td>{act?.(r)}</td></tr>)}</Table></Card> }
const ReceptionOverview: FC = () => {
  const { res, rooms, checkIn, checkOut } = useStore(); const s = stats(rooms)
  const arr = res.filter(r => r.status === 'Confirmed' && r.in <= TODAY), dep = res.filter(r => r.status === 'Checked In' && r.out <= TODAY)
  return <div className="space-y-6"><Grid><Stat label="Arrivals today" value={res.filter(r => r.in === TODAY && r.status === 'Confirmed').length} /><Stat label="Departures today" value={res.filter(r => r.out === TODAY && r.status === 'Checked In').length} />
    <Stat label="Current guests" value={res.filter(r => r.status === 'Checked In').length} /><Stat label="Available rooms" value={s.avail} /><Stat label="Pending check-ins" value={arr.length} /><Stat label="Pending check-outs" value={dep.length} /></Grid>
    <div className="grid lg:grid-cols-2 gap-6"><Overview2 title="Upcoming arrivals" rows={arr} act={r => <button className="btn btn-p" onClick={() => checkIn(r.ref)}>Check in</button>} />
      <Overview2 title="Upcoming departures" rows={res.filter(r => r.status === 'Checked In')} act={r => <button className="btn" onClick={() => checkOut(r.ref)}>Check out</button>} /></div>
    <Card title="Recent reservations"><ResTable rows={res.slice(0, 5)} /></Card></div>
}
const Availability: FC = () => { const [pick, setPick] = useState<number | null>(null)
  return <div className="space-y-3">{pick && <p className="text-sm card px-4 py-3 hover:translate-y-0 border-gold"><span className="card-stripe" />Room {pick} selected — go to Reservations → New reservation to book it.</p>}
    <RoomBoard onPick={r => setPick(r.no)} pickable={r => r.status === 'Available'} /></div> }
const CheckIn: FC = () => { const { res, checkIn } = useStore(); return <Overview2 title="Check-in (confirmed reservations)" rows={res.filter(r => r.status === 'Confirmed')} act={r => <button className="btn btn-p" onClick={() => checkIn(r.ref)}>Check in</button>} /> }
const CheckOut: FC = () => { const { res, checkOut } = useStore(); return <Overview2 title="Check-out (in-house guests)" rows={res.filter(r => r.status === 'Checked In')} act={r => <button className="btn btn-p" onClick={() => checkOut(r.ref)}>Check out</button>} /> }
const Billing: FC = () => { const { res, setPay } = useStore(); const t = useTotals(); const [inv, setInv] = useState<Reservation | null>(null)
  return <Card title="Billing (THB)"><Table heads={['Ref', 'Guest', 'Room', 'Service', 'Tax 7%', 'Total', 'Payment', '']}>{res.filter(r => r.status !== 'Cancelled').map(r => { const b = bill(r, t.type(r.roomNo))
    return <tr key={r.ref}><td>{r.ref}</td><td>{r.guest}</td><td>{thb(b.room)}</td><td>{thb(b.svc)}</td><td>{thb(b.tax)}</td><td>{thb(b.total)}</td><td><Badge s={r.pay} /></td>
      <td className="whitespace-nowrap"><button className="btn" onClick={() => setPay(r.ref, r.pay === 'Paid' ? 'Pending' : 'Paid')}>{r.pay === 'Paid' ? 'Mark Pending' : 'Mark Paid'}</button> <button className="btn" onClick={() => setInv(r)}>Invoice</button></td></tr> })}</Table>
    {inv && (() => { const b = bill(inv, t.type(inv.roomNo)); return <Modal title={`Invoice ${inv.ref}`} onClose={() => setInv(null)}><div className="text-sm space-y-1">
      <p className="font-serif text-lg">The Meridian Hotel</p><p>{inv.guest} · Room {inv.roomNo}</p><p>{b.n} night(s): {thb(b.room)}</p><p>Services: {thb(b.svc)}</p><p>Tax: {thb(b.tax)}</p><p className="font-semibold">Total: {thb(b.total)} ({inv.pay})</p></div>
      <button className="btn btn-p no-print" onClick={() => window.print()}>Print</button></Modal> })()}</Card> }

const TaskTable = ({ act }: { act: boolean }) => { const { tasks, advance } = useStore(); const label = { Pending: 'Start cleaning', 'In Progress': 'Send to inspection', 'Awaiting Inspection': 'Approve', Completed: '' }
  return <Card title="Housekeeping tasks"><Table heads={['Room', 'Floor', 'Priority', 'Assigned', 'Status', '']}>{tasks.map(t => <tr key={t.id}><td>{t.roomNo}</td><td>{Math.floor(t.roomNo / 100)}</td><td><Badge s={t.priority} /></td><td>{t.assignee}</td><td><Badge s={t.status} /></td>
    <td>{act && t.status !== 'Completed' && <button className="btn btn-p" onClick={() => advance(t.id)}>{label[t.status]}</button>}</td></tr>)}</Table></Card> }
const HkOverview: FC = () => { const { rooms, tasks } = useStore(); const s = stats(rooms)
  return <div className="space-y-6"><Grid><Stat label="Needs cleaning" value={s.dirty} /><Stat label="In progress" value={s.clean} /><Stat label="Completed tasks" value={tasks.filter(t => t.status === 'Completed').length} />
    <Stat label="Pending inspections" value={s.insp} /></Grid><TaskTable act={false} /></div> }
const HkRooms: FC = () => { const { tasks, advance } = useStore()
  return <RoomBoard extra={r => { const t = tasks.find(x => x.roomNo === r.no && x.status !== 'Completed'); return t ? <button className="btn btn-p" onClick={() => advance(t.id)}>{{ Pending: 'Start cleaning', 'In Progress': 'Mark cleaned', 'Awaiting Inspection': 'Pass inspection', Completed: '' }[t.status]}</button> : null }} /> }
const Maintenance: FC = () => { const { reqs, addReq, rooms } = useStore(); const [room, setRoom] = useState(rooms[0].no); const [txt, setTxt] = useState('')
  return <Card title="Maintenance requests"><div className="flex gap-2 mb-4"><select className="inp !w-auto" value={room} onChange={e => setRoom(+e.target.value)}>{rooms.map(r => <option key={r.no}>{r.no}</option>)}</select>
    <input className="inp" placeholder="Describe the issue" value={txt} onChange={e => setTxt(e.target.value)} /><button className="btn btn-p" onClick={() => { if (txt) { addReq(`Room ${room} – ${txt}`); setTxt('') } }}>Submit</button></div>
    <Feed items={reqs} /></Card> }

const Reports: FC = () => { const { rooms } = useStore(); const t = useTotals()
  return <div className="grid lg:grid-cols-2 gap-6"><Card title="Occupancy by floor"><Bars data={FLOORS.map(f => { const x = stats(rooms.filter(r => r.floor === f)); return { l: `Floor ${f}`, v: x.rate, label: `${x.rate}%` } })} /></Card>
    <Card title="Revenue by room type"><Bars data={t.byType.map(x => ({ l: x.t, v: x.v, label: thb(x.v) }))} /></Card></div> }
const roles: Role[] = ['manager', 'receptionist', 'housekeeping', 'administrator']
const Accounts = ({ editable }: { editable: boolean }) => { const { emps, setEmps } = useStore(); const [n, setN] = useState('')
  return <Card title="Employee accounts">{editable && <div className="flex gap-2 mb-4"><input className="inp" placeholder="New employee name" value={n} onChange={e => setN(e.target.value)} />
    <button className="btn btn-p" onClick={() => { if (n) { setEmps(e => [...e, { id: Date.now(), name: n, email: n.split(' ')[0].toLowerCase() + '@meridian.com', role: 'receptionist', active: true }]); setN('') } }}>Create</button></div>}
    <Table heads={['Name', 'Email', 'Role', 'Status', '']}>{emps.map(e => <tr key={e.id}><td>{e.name}</td><td>{e.email}</td><td className="capitalize">{e.role}</td><td><Badge s={e.active ? 'Paid' : 'Cancelled'} /></td>
      <td>{editable && <button className="btn" onClick={() => setEmps(l => l.map(x => x.id === e.id ? { ...x, active: !x.active } : x))}>{e.active ? 'Deactivate' : 'Activate'}</button>}</td></tr>)}</Table></Card> }
const AdminOverview: FC = () => { const { emps } = useStore()
  return <div className="space-y-6"><Grid><Stat label="Employees" value={emps.length} /><Stat label="Active" value={emps.filter(e => e.active).length} /><Stat label="Inactive" value={emps.filter(e => !e.active).length} /></Grid>
    <div className="grid lg:grid-cols-2 gap-6"><Card title="Role distribution"><Bars data={roles.map(r => ({ l: r, v: emps.filter(e => e.role === r).length, label: String(emps.filter(e => e.role === r).length) }))} /></Card>
      <Card title="Recent administrative activity"><Feed items={LOGS.map(l => `${l[0]} ${l[2]}: ${l[3]}`)} /></Card></div></div> }
const RoleMgmt: FC = () => { const { emps, setEmps } = useStore()
  return <Card title="Role management"><Table heads={['Employee', 'Role']}>{emps.map(e => <tr key={e.id}><td>{e.name}</td><td><select className="inp !w-auto capitalize" value={e.role} onChange={v => setEmps(l => l.map(x => x.id === e.id ? { ...x, role: v.target.value as Role } : x))}>{roles.map(r => <option key={r}>{r}</option>)}</select></td></tr>)}</Table></Card> }
const Settings: FC = () => { const [s, set] = useState({ 'Require password change every 90 days': true, 'Email notifications': true, 'Maintenance mode': false })
  return <Card title="System settings">{Object.entries(s).map(([k, v]) => <label key={k} className="flex items-center justify-between py-2 text-sm border-b border-line/60">{k}<input type="checkbox" checked={v} onChange={() => set({ ...s, [k]: !v })} /></label>)}</Card> }
const Logs: FC = () => <Card title="Audit logs"><Table heads={['Time', 'User', 'Action', 'Target']}>{LOGS.map(l => <tr key={l[0]}>{l.map(c => <td key={c}>{c}</td>)}</tr>)}</Table></Card>

export const PAGES: Record<Role, Record<string, FC>> = {
  manager: { overview: ManagerOverview, reservations: () => <ReservationsBase edit={false} />, rooms: RoomsPage, guests: GuestsPage, housekeeping: () => <TaskTable act={false} />, reports: Reports, staff: () => <Accounts editable={false} /> },
  receptionist: { overview: ReceptionOverview, reservations: () => <ReservationsBase edit />, guests: GuestsPage, availability: Availability, checkin: CheckIn, checkout: CheckOut, billing: Billing },
  housekeeping: { overview: HkOverview, tasks: () => <TaskTable act />, status: HkRooms, maintenance: Maintenance },
  administrator: { overview: AdminOverview, accounts: () => <Accounts editable />, roles: RoleMgmt, settings: Settings, logs: Logs },
}
export const NAV: Record<Role, [string, string][]> = {
  manager: [['overview', 'Overview'], ['reservations', 'Reservations'], ['rooms', 'Rooms'], ['guests', 'Guests'], ['housekeeping', 'Housekeeping'], ['reports', 'Reports'], ['staff', 'Staff']],
  receptionist: [['overview', 'Overview'], ['reservations', 'Reservations'], ['guests', 'Guests'], ['availability', 'Room Availability'], ['checkin', 'Check-in'], ['checkout', 'Check-out'], ['billing', 'Billing']],
  housekeeping: [['overview', 'Overview'], ['tasks', 'My Tasks'], ['status', 'Room Status'], ['maintenance', 'Maintenance Requests']],
  administrator: [['overview', 'Overview'], ['accounts', 'Employee Accounts'], ['roles', 'Role Management'], ['settings', 'System Settings'], ['logs', 'Audit Logs']],
}
