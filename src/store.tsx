import { createContext, useContext, useState, ReactNode } from 'react'
import { Room, RoomStatus, Reservation, Task, Employee, Role, TaskStatus } from './config/hotel'
import { buildRooms, RES, TASKS, EMPS } from './mock'

interface Ctx {
  user: Role | null; login: (r: Role) => void; logout: () => void
  rooms: Room[]; res: Reservation[]; tasks: Task[]; emps: Employee[]; setEmps: (f: (e: Employee[]) => Employee[]) => void
  floor: number; setFloor: (f: number) => void
  reqs: string[]; addReq: (s: string) => void
  checkIn: (ref: string) => void; checkOut: (ref: string) => void; cancel: (ref: string) => void
  create: (r: Omit<Reservation, 'ref' | 'status' | 'pay'>) => void; setPay: (ref: string, p: 'Paid' | 'Pending') => void
  advance: (id: number) => void
}
const C = createContext<Ctx>(null!)
export const useStore = () => useContext(C)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Role | null>(null)
  const [rooms, setRooms] = useState(buildRooms)
  const [res, setRes] = useState(RES)
  const [tasks, setTasks] = useState(TASKS)
  const [emps, setEmps] = useState(EMPS)
  const [floor, setFloor] = useState(0) // 0 = all floors, shared by manager / reception / housekeeping
  const [reqs, setReqs] = useState<string[]>(['Room 106 – air-conditioning leak (Out of Service)'])
  const setRoom = (no: number, status: RoomStatus) => setRooms(rs => rs.map(r => (r.no === no ? { ...r, status } : r)))
  const setRes1 = (ref: string, p: Partial<Reservation>) => setRes(rs => rs.map(r => (r.ref === ref ? { ...r, ...p } : r)))
  const find = (ref: string) => res.find(r => r.ref === ref)!

  const value: Ctx = {
    user, login: setUser, logout: () => setUser(null), rooms, res, tasks, emps, setEmps, floor, setFloor, reqs,
    addReq: s => setReqs(r => [s, ...r]),
    checkIn: ref => { const r = find(ref); setRes1(ref, { status: 'Checked In' }); setRoom(r.roomNo, 'Occupied') },
    checkOut: ref => {
      const r = find(ref); setRes1(ref, { status: 'Checked Out' }); setRoom(r.roomNo, 'Needs Cleaning')
      setTasks(t => [...t, { id: Date.now(), roomNo: r.roomNo, priority: 'High', assignee: 'Nok', status: 'Pending' }])
    },
    cancel: ref => { const r = find(ref); setRes1(ref, { status: 'Cancelled' }); if (r.status === 'Confirmed') setRoom(r.roomNo, 'Available') },
    create: r => {
      setRes(rs => [{ ...r, ref: `MER-${1001 + rs.length}`, status: 'Confirmed', pay: 'Pending' }, ...rs]); setRoom(r.roomNo, 'Reserved')
    },
    setPay: (ref, pay) => setRes1(ref, { pay }),
    advance: id => {
      const t = tasks.find(x => x.id === id); if (!t) return
      const next: Partial<Record<TaskStatus, [TaskStatus, RoomStatus]>> = { Pending: ['In Progress', 'Cleaning'], 'In Progress': ['Awaiting Inspection', 'Awaiting Inspection'], 'Awaiting Inspection': ['Completed', 'Available'] }
      const n = next[t.status]; if (!n) return
      setTasks(ts => ts.map(x => (x.id === id ? { ...x, status: n[0] } : x))); setRoom(t.roomNo, n[1])
    },
  }
  return <C.Provider value={value}>{children}</C.Provider>
}
