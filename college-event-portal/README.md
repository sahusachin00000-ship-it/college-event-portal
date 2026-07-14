# CampusArena — College Event Participation Portal

Ek full-stack website jisme college events (Technical, Sports, Cultural) create
kiye ja sakte hain aur students unme register kar sakte hain.

- **Frontend:** plain HTML, CSS, JavaScript (koi framework nahi — seedha browser mein chalega)
- **Backend:** Node.js + Express, data ek JSON file (`db.json`) mein store hota hai — koi database install karne ki zarurat nahi

---

## Folder structure

```
college-event-portal/
├── backend/
│   ├── server.js          -> main server file
│   ├── routes/             -> auth, events, registrations APIs
│   ├── middleware/auth.js  -> login check (JWT)
│   ├── utils/db.js         -> db.json read/write helper
│   ├── db.json             -> sara data yahin save hota hai
│   ├── .env                -> secret keys
│   └── package.json
└── frontend/
    ├── index.html          -> home page
    ├── events.html         -> saare events
    ├── event-detail.html   -> ek event ka detail + register button
    ├── login.html / register.html
    ├── dashboard.html      -> student ke registered events
    ├── admin.html          -> admin panel (event create/edit/delete)
    ├── css/style.css
    └── js/                 -> sab logic yahan hai
```

---

## Backend chalane ke steps

1. Terminal mein `backend` folder me jao:
   ```bash
   cd backend
   npm install
   npm start
   ```
2. Agar sab sahi hua to terminal me ye dikhega:
   ```
   ✅ Server running at http://localhost:5000
   ```
3. Backend chalu rakhna zaroori hai jab tak website use karni ho.

> Agar port 5000 already use ho raha hai, `.env` file me `PORT` change kar do,
> aur `frontend/js/api.js` me `API_BASE` bhi wahi port update kar dena.

---

## Frontend kaise kholein

Frontend sirf static HTML files hain, koi build step nahi chahiye.

**Recommended (VS Code):**
- VS Code me "Live Server" extension install karo
- `frontend/index.html` par right-click → "Open with Live Server"

**Simple tarika:**
- Seedhe `frontend/index.html` ko double-click karke browser me khol lo
  (kaam karega, lekin Live Server se refresh automatic hota hai)

---

## Admin account kaise banaye (event organiser)

Normal sign-up se student account banta hai. Agar aapko **event create/manage**
karne wala admin account chahiye:

1. `register.html` page par jao
2. Form fill karo
3. "Organiser code" field me ye code daalo (ye `backend/.env` file me set hai):
   ```
   COLLEGE-ADMIN-2026
   ```
4. Submit karte hi admin panel (`admin.html`) khul jayega jaha aap events
   create/edit/delete kar sakte ho aur participants dekh sakte ho.

Is code ko `.env` file me change karke apna khud ka secret code rakh sakte ho.

---

## Features

- Student signup/login (JWT-based auth, password bcrypt se hash hota hai)
- Events browse karna category filter aur search ke saath
- Event detail page se ek click me register/cancel
- Student dashboard — apne saare registered events dekhna
- Admin panel — event create, edit, delete, aur registered participants ki list dekhna
- Fully responsive design (mobile par bhi sahi dikhta hai)

---

## Demo data

`backend/db.json` me pehle se 3 sample events daale gaye hain (Code Sprint,
Football tournament, Battle of Bands) — taaki demo turant dikhaya ja sake.
Inhe admin panel se edit/delete kiya ja sakta hai.

## Common issues

- **"Could not reach the server"** error aaye to check karo backend chal raha
  hai ya nahi (`npm start` terminal open honi chahiye).
- CORS error aaye to backend restart karo — `cors` package already configured hai.
