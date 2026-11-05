# HotelOS – The Meridian Hotel (frontend prototype)
```
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
```
Demo logins (any non-empty password): `manager`, `receptionist`, `housekeeping`, `administrator`.

- `src/config/hotel.ts` – floor/room-type plan. Edit `FLOOR_PLAN` to grow from 40 to 60/100 rooms; UI and stats follow.
- `src/mock.ts` – all mock data. `src/store.tsx` – shared state + workflow actions (check-in → Occupied, check-out → Needs Cleaning, housekeeping → Available).
- Replace store actions with API calls when the Node/Express backend exists.
