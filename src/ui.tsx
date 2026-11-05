import { ReactNode, useState } from 'react'
import {
  X, Building2, BedDouble, DoorOpen, CalendarCheck, Sparkles, Percent, LogIn, LogOut,
  Users, Clock, Timer, CheckCircle2, ClipboardCheck, UserCheck, UserX, Hotel, LucideIcon,
} from 'lucide-react'
import { useStore } from './store'
import { FLOORS, TYPES, STATUSES, Room, RATES, stats, RoomType, RoomStatus } from './config/hotel'

const tone: Record<string, string> = {
  Available: 'bg-emerald-50 text-emerald-700 border-emerald-200', Reserved: 'bg-amber-50 text-amber-800 border-amber-200', Occupied: 'bg-rose-50 text-burgundy border-rose-200',
  'Needs Cleaning': 'bg-orange-50 text-orange-800 border-orange-200', Cleaning: 'bg-sky-50 text-sky-800 border-sky-200', 'Awaiting Inspection': 'bg-violet-50 text-violet-800 border-violet-200',
  Confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200', Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200', Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Pending: 'bg-amber-50 text-amber-800 border-amber-200', 'Checked In': 'bg-rose-50 text-burgundy border-rose-200', 'In Progress': 'bg-sky-50 text-sky-800 border-sky-200', High: 'bg-orange-50 text-orange-800 border-orange-200',
  'Out of Service': 'bg-stone-100 text-stone-600 border-stone-300',
}
const roomFace: Record<string, string> = {
  Available: 'border-l-emerald-500 from-white to-emerald-50/70',
  Reserved: 'border-l-amber-500 from-white to-amber-50/70',
  Occupied: 'border-l-burgundy from-white to-rose-50/70',
  'Needs Cleaning': 'border-l-orange-500 from-white to-orange-50/70',
  Cleaning: 'border-l-sky-500 from-white to-sky-50/70',
  'Awaiting Inspection': 'border-l-violet-500 from-white to-violet-50/70',
  'Out of Service': 'border-l-stone-400 from-white to-stone-50',
}
const STAT_META: Record<string, { Icon: LucideIcon; chip: string }> = {
  'Total rooms': { Icon: Building2, chip: 'bg-burgundy/10 text-burgundy' },
  Occupied: { Icon: BedDouble, chip: 'bg-rose-100 text-burgundy' },
  Available: { Icon: DoorOpen, chip: 'bg-emerald-100 text-emerald-700' },
  'Available rooms': { Icon: DoorOpen, chip: 'bg-emerald-100 text-emerald-700' },
  Reserved: { Icon: CalendarCheck, chip: 'bg-amber-100 text-amber-800' },
  'Needs cleaning': { Icon: Sparkles, chip: 'bg-orange-100 text-orange-800' },
  Occupancy: { Icon: Percent, chip: 'bg-gold/20 text-gold' },
  'Arrivals today': { Icon: LogIn, chip: 'bg-amber-100 text-amber-800' },
  'Departures today': { Icon: LogOut, chip: 'bg-rose-100 text-burgundy' },
  'Current guests': { Icon: Users, chip: 'bg-burgundy/10 text-burgundy' },
  'Pending check-ins': { Icon: Clock, chip: 'bg-amber-100 text-amber-800' },
  'Pending check-outs': { Icon: Clock, chip: 'bg-rose-100 text-burgundy' },
  'In progress': { Icon: Timer, chip: 'bg-sky-100 text-sky-800' },
  'Completed tasks': { Icon: CheckCircle2, chip: 'bg-emerald-100 text-emerald-700' },
  'Pending inspections': { Icon: ClipboardCheck, chip: 'bg-violet-100 text-violet-800' },
  Employees: { Icon: Users, chip: 'bg-burgundy/10 text-burgundy' },
  Active: { Icon: UserCheck, chip: 'bg-emerald-100 text-emerald-700' },
  Inactive: { Icon: UserX, chip: 'bg-stone-100 text-stone-600' },
}

export const Badge = ({ s }: { s: string }) => <span className={`inline-block whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${tone[s] ?? 'bg-stone-100 text-stone-600 border-stone-200'}`}>{s}</span>
export const Card = ({ title, children, right }: { title?: string; children: ReactNode; right?: ReactNode }) => (
  <section className="card">
    <div className="card-stripe" />
    {title && <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3 border-b border-line/80 bg-gradient-to-r from-cream/80 to-white"><h3 className="font-serif text-lg text-ink">{title}</h3>{right}</div>}
    <div className="p-5">{children}</div>
  </section>
)
export const Stat = ({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) => {
  const meta = STAT_META[label] ?? { Icon: Hotel, chip: 'bg-cream text-gold' }
  const Icon = meta.Icon
  return (
    <div className="card p-4">
      <div className="card-stripe" />
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-gold/15 to-transparent pointer-events-none" />
      <div className="relative flex items-start justify-between gap-2">
        <p className="text-[11px] uppercase tracking-[0.14em] text-mute pt-1">{label}</p>
        <span className={`rounded-xl p-2 ${meta.chip}`}><Icon size={16} /></span>
      </div>
      <p className="relative font-serif text-3xl mt-2 tracking-tight">{value}</p>
      {sub && <p className="relative text-xs text-mute mt-1 leading-snug">{sub}</p>}
    </div>
  )
}
export const Table = ({ heads, children }: { heads: string[]; children: ReactNode }) => (
  <div className="overflow-x-auto -mx-1"><table className="w-full text-sm"><thead><tr>{heads.map(h => <th key={h} className="text-left text-[11px] uppercase tracking-[0.12em] text-mute font-medium px-3 py-2.5 border-b border-line bg-cream/40">{h}</th>)}</tr></thead>
    <tbody className="[&_td]:px-3 [&_td]:py-3 [&_tr]:border-b [&_tr]:border-line/50 [&_tr:last-child]:border-0 [&_tr:hover]:bg-cream/70">{children}</tbody></table></div>
)
export const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) => (
  <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px] flex items-center justify-center p-4" onClick={onClose}>
    <div className="card hover:translate-y-0 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
      <div className="card-stripe" />
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-line"><h3 className="font-serif text-lg">{title}</h3><button className="rounded-lg p-1 hover:bg-cream" onClick={onClose}><X size={18} /></button></div>
      <div className="p-5 space-y-3">{children}</div>
    </div>
  </div>
)
export const Grid = ({ children }: { children: ReactNode }) => <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">{children}</div>
export const Feed = ({ items }: { items: string[] }) => (
  <ul className="space-y-2">{items.map(a => (
    <li key={a} className="flex gap-3 rounded-xl border border-line/80 bg-cream/60 px-3.5 py-2.5 text-sm text-ink/80">
      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold shrink-0" /><span>{a}</span>
    </li>
  ))}</ul>
)

export function FloorSelector() {
  const { floor, setFloor } = useStore()
  return <div className="flex flex-wrap gap-2">{[0, ...FLOORS].map(f => (
    <button key={f} onClick={() => setFloor(f)} className={`btn ${floor === f ? 'btn-p' : ''}`}>{f === 0 ? 'All Floors' : `Floor ${f}`}</button>))}</div>
}

interface BoardProps { onPick?: (r: Room) => void; pickable?: (r: Room) => boolean; extra?: (r: Room) => ReactNode }
export function RoomBoard({ onPick, pickable, extra }: BoardProps) {
  const { rooms, floor, res } = useStore()
  const [type, setType] = useState(''); const [status, setStatus] = useState(''); const [sel, setSel] = useState<Room | null>(null)
  const scoped = rooms.filter(r => !floor || r.floor === floor)
  const shown = scoped.filter(r => (!type || r.type === type) && (!status || r.status === status))
  const s = stats(scoped)
  const guestOf = (r: Room) => res.find(x => x.roomNo === r.no && (x.status === 'Confirmed' || x.status === 'Checked In'))?.guest
  const cur = sel && rooms.find(r => r.no === sel.no)
  return (
    <div className="space-y-4">
      <div className="card p-4 hover:translate-y-0"><div className="card-stripe" />
        <div className="flex flex-wrap items-center justify-between gap-3"><FloorSelector />
          <div className="flex gap-2">
            <select className="inp !w-auto" value={type} onChange={e => setType(e.target.value)}><option value="">All types</option>{TYPES.map(t => <option key={t}>{t}</option>)}</select>
            <select className="inp !w-auto" value={status} onChange={e => setStatus(e.target.value)}><option value="">All statuses</option>{STATUSES.map(t => <option key={t}>{t}</option>)}</select>
          </div></div>
        <p className="text-sm text-mute mt-3">{s.total} rooms · {s.occ} occupied · {s.avail} available · {s.resv} reserved · {s.dirty + s.clean + s.insp} in housekeeping · {s.oos} out of service · occupancy {s.rate}%</p>
      </div>
      {FLOORS.filter(f => !floor || f === floor).map(f => {
        const rs = shown.filter(r => r.floor === f); if (!rs.length) return null
        return <div key={f}><h4 className="font-serif text-lg mb-3 text-ink">Floor {f}</h4>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">{rs.map(r => (
            <button key={r.no} onClick={() => setSel(r)} className={`text-left rounded-2xl border border-line border-l-[5px] bg-gradient-to-br p-3.5 shadow-[0_6px_18px_rgba(41,37,36,0.05)] hover:shadow-[0_12px_28px_rgba(41,37,36,0.10)] hover:-translate-y-0.5 transition ${roomFace[r.status] ?? 'border-l-gold from-white to-cream'}`}>
              <div className="flex justify-between items-start gap-2"><span className="font-serif text-2xl leading-none">{r.no}</span><Badge s={r.status} /></div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-gold mt-2.5">{r.type}</p>
              <p className="text-xs mt-1 h-4 truncate text-ink/70">{guestOf(r) ?? 'Vacant'}</p></button>))}</div></div>
      })}
      {cur && <Modal title={`Room ${cur.no}`} onClose={() => setSel(null)}>
        <p className="text-sm">Floor {cur.floor} · {cur.type} · ฿{RATES[cur.type as RoomType].toLocaleString()}/night</p>
        <Badge s={cur.status as RoomStatus} />{guestOf(cur) && <p className="text-sm">Guest: {guestOf(cur)}</p>}
        <div className="flex gap-2 pt-2">{extra?.(cur)}
          {onPick && (pickable?.(cur) ?? true) && <button className="btn btn-p" onClick={() => { onPick(cur); setSel(null) }}>Select room</button>}</div>
      </Modal>}
    </div>
  )
}
