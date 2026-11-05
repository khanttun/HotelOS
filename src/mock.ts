import { FLOOR_PLAN, Room, RoomType, RoomStatus, Reservation, Task, Employee, day } from './config/hotel'

const initial: Record<number, RoomStatus> = { 102: 'Occupied', 105: 'Occupied', 203: 'Occupied', 301: 'Occupied', 404: 'Occupied', 103: 'Reserved', 208: 'Reserved', 305: 'Reserved', 110: 'Needs Cleaning', 204: 'Needs Cleaning', 402: 'Cleaning', 307: 'Awaiting Inspection', 106: 'Out of Service' }
export const buildRooms = (): Room[] => Object.entries(FLOOR_PLAN).flatMap(([f, plan]) => {
  let n = 0
  return Object.entries(plan).flatMap(([type, count]) => Array.from({ length: count as number }, () => { n++; const no = Number(f) * 100 + n; return { no, floor: Number(f), type: type as RoomType, status: initial[no] ?? 'Available' } }))
})
const R = (ref: string, guest: string, nat: string, roomNo: number, i: number, o: number, pax: number, status: Reservation['status'], pay: Reservation['pay']): Reservation =>
  ({ ref, guest, email: guest.toLowerCase().replace(/[^a-z]+/g, '.') + '@mail.com', phone: '+66 8' + (1000000 + roomNo * 731).toString().slice(0, 8), nat, roomNo, in: day(i), out: day(o), pax, status, pay })
export const RES: Reservation[] = [
  R('MER-1001', 'Anan Chaiyasit', 'Thai', 102, -2, 1, 2, 'Checked In', 'Paid'),
  R('MER-1002', 'Sofia Marino', 'Italian', 105, -1, 2, 2, 'Checked In', 'Pending'),
  R('MER-1003', 'Hiroshi Tanaka', 'Japanese', 203, -3, 0, 1, 'Checked In', 'Paid'),
  R('MER-1004', 'Emma Larsson', 'Swedish', 301, -1, 0, 2, 'Checked In', 'Pending'),
  R('MER-1005', "Liam O'Connor", 'Irish', 404, -4, 3, 3, 'Checked In', 'Paid'),
  R('MER-1006', 'Mei Lin Zhou', 'Chinese', 103, 0, 3, 2, 'Confirmed', 'Pending'),
  R('MER-1007', 'Pimchanok Sri', 'Thai', 208, 0, 2, 2, 'Confirmed', 'Paid'),
  R('MER-1008', 'Daniel Weber', 'German', 305, 1, 4, 1, 'Confirmed', 'Pending'),
  R('MER-1009', 'Karan Mehta', 'Indian', 109, 3, 6, 2, 'Pending', 'Pending'),
  R('MER-1010', 'Olivia Brown', 'British', 207, -5, -2, 2, 'Checked Out', 'Paid'),
]
export const TASKS: Task[] = [
  { id: 1, roomNo: 110, priority: 'High', assignee: 'Nok', status: 'Pending' },
  { id: 2, roomNo: 204, priority: 'Normal', assignee: 'Somchai', status: 'Pending' },
  { id: 3, roomNo: 402, priority: 'High', assignee: 'Nok', status: 'In Progress' },
  { id: 4, roomNo: 307, priority: 'Normal', assignee: 'Somchai', status: 'Awaiting Inspection' },
  { id: 5, roomNo: 207, priority: 'Low', assignee: 'Nok', status: 'Completed' },
]
export const EMPS: Employee[] = [
  { id: 1, name: 'Natthaya Prasert', email: 'natthaya@meridian.com', role: 'manager', active: true },
  { id: 2, name: 'Arun Wongsa', email: 'arun@meridian.com', role: 'receptionist', active: true },
  { id: 3, name: 'Kanya Boon', email: 'kanya@meridian.com', role: 'receptionist', active: true },
  { id: 4, name: 'Nok Intira', email: 'nok@meridian.com', role: 'housekeeping', active: true },
  { id: 5, name: 'Somchai Dee', email: 'somchai@meridian.com', role: 'housekeeping', active: true },
  { id: 6, name: 'Tarit Lim', email: 'tarit@meridian.com', role: 'housekeeping', active: false },
  { id: 7, name: 'Admin Suda', email: 'suda@meridian.com', role: 'administrator', active: true },
]
export const ACTIVITY = ['Room 105 checked in (Sofia Marino)', 'Room 207 cleaning completed', 'Reservation MER-1009 created', 'Room 402 cleaning started', 'Invoice MER-1003 marked as paid']
export const LOGS = [['09:12', 'suda', 'Created account', 'Tarit Lim'], ['09:40', 'suda', 'Deactivated account', 'Tarit Lim'], ['10:05', 'suda', 'Changed setting', 'Tax rate 7%'], ['11:30', 'suda', 'Role changed', 'Kanya Boon → receptionist']]
