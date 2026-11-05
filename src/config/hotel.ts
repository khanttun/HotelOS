export type Role = 'manager' | 'receptionist' | 'housekeeping' | 'administrator'
export type RoomType = 'Standard' | 'Deluxe' | 'Executive' | 'Suite'
export type RoomStatus = 'Available' | 'Reserved' | 'Occupied' | 'Needs Cleaning' | 'Cleaning' | 'Awaiting Inspection' | 'Out of Service'
export type ResStatus = 'Pending' | 'Confirmed' | 'Checked In' | 'Checked Out' | 'Cancelled'
export type TaskStatus = 'Pending' | 'In Progress' | 'Awaiting Inspection' | 'Completed'
export interface Room { no: number; floor: number; type: RoomType; status: RoomStatus }
export interface Reservation { ref: string; guest: string; email: string; phone: string; nat: string; roomNo: number; in: string; out: string; pax: number; status: ResStatus; pay: 'Paid' | 'Pending' }
export interface Task { id: number; roomNo: number; priority: 'High' | 'Normal' | 'Low'; assignee: string; status: TaskStatus }
export interface Employee { id: number; name: string; email: string; role: Role; active: boolean }

// Single source of truth for the building. Add floors / counts here to expand.
export const FLOOR_PLAN: Record<number, Partial<Record<RoomType, number>>> = {
  1: { Standard: 6, Deluxe: 3, Suite: 1 },
  2: { Standard: 5, Deluxe: 4, Executive: 1 },
  3: { Standard: 4, Deluxe: 4, Executive: 2 },
  4: { Standard: 2, Deluxe: 4, Executive: 3, Suite: 1 },
}
export const FLOORS = Object.keys(FLOOR_PLAN).map(Number)
export const TYPES: RoomType[] = ['Standard', 'Deluxe', 'Executive', 'Suite']
export const STATUSES: RoomStatus[] = ['Available', 'Reserved', 'Occupied', 'Needs Cleaning', 'Cleaning', 'Awaiting Inspection', 'Out of Service']
export const RATES: Record<RoomType, number> = { Standard: 2800, Deluxe: 3800, Executive: 5200, Suite: 9500 }
export const TAX_RATE = 0.07

export const TODAY = new Date().toISOString().slice(0, 10)
export const day = (o: number) => new Date(Date.now() + o * 864e5).toISOString().slice(0, 10)
export const thb = (n: number) => '฿' + n.toLocaleString()
export const nights = (a: string, b: string) => Math.max(1, Math.round((+new Date(b) - +new Date(a)) / 864e5))
export const bill = (r: Reservation, type: RoomType) => {
  const n = nights(r.in, r.out), room = n * RATES[type], svc = n * 350, tax = Math.round((room + svc) * TAX_RATE)
  return { n, room, svc, tax, total: room + svc + tax }
}
// Occupancy = occupied / (total rooms − out-of-service rooms)
export const stats = (rooms: Room[]) => {
  const c = (s: RoomStatus) => rooms.filter(r => r.status === s).length
  const total = rooms.length, oos = c('Out of Service'), occ = c('Occupied')
  return { total, occ, avail: c('Available'), resv: c('Reserved'), dirty: c('Needs Cleaning'), clean: c('Cleaning'), insp: c('Awaiting Inspection'), oos,
    rate: total - oos ? Math.round((occ / (total - oos)) * 100) : 0 }
}
