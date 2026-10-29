# Hajiri Sahayog — Admin Dashboard

A desktop web app for school admins and principals to view and analyze attendance data exported from the [Hajiri Sahayog](https://github.com/mynameisprem-pj/Hajiri-Sahayog) teacher app.

---

## How It Works

1. Teachers export their data from the Hajiri Sahayog teacher app as a `.json` file
2. They share the file with the admin (WhatsApp, Email, USB, etc.)
3. Admin imports one or multiple files at once into this dashboard
4. Admin can search, filter, view, and export attendance reports as Excel/CSV

No server. No internet required after first load. All data stays in the browser session — nothing is saved permanently on the admin's computer.

---

## Features

- 📥 Import multiple teacher backup files at once
- 📊 School-wide attendance overview dashboard
- 👥 Student search and filter across all teachers
- 📅 Attendance records with date range, teacher, class, status filters
- 📉 Low attendance alerts (students below 75%)
- 📤 Export to Excel (class-wise attendance grid, all students summary)
- 📤 Export to CSV (filtered attendance records)
- 🖼️ Admin profile with optional photo and school logo

---

## Tech Stack

| Purpose | Library |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v3 |
| State | Zustand |
| Excel Export | SheetJS (xlsx) |

---

## Getting Started

```bash
git clone https://github.com/your-username/hajiri-sahayog-admin.git
cd hajiri-sahayog-admin
npm install
npm run dev
```

---

## Developer

**Prem Jha**
📧 premjha1714@gmail.com

Built with ❤️ for teachers of Nepal.

---

## License

MIT