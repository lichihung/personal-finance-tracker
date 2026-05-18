# Finance Tracker

A simple and intuitive web app to track your income and expenses in one place.

- Live Demo: https://lichihung-finance-tracker.netlify.app/

---

## Overview

Finance Tracker helps you stay on top of your personal finances without unnecessary complexity.

You can:
- Record income and expenses
- Organize transactions with categories
- Review your financial activity
- Explore the app instantly with a demo account

The app is built with a React frontend and a Django REST API backend, and deployed for real-world usage.

---

## Try It Out

### Demo Account
Username: demo  
Password: demo1234  

You can explore the app without signing up.  
Demo mode is read-only.

---

## Features

- Secure authentication (JWT login / register)
- Password reset via email
- Dashboard with financial overview
- Transaction management (add, edit, delete)
- Category management
- Filtering and search
- Demo mode for quick exploration
- Responsive design (mobile & desktop)

---

## Tech Stack

### Frontend
- React
- Chakra UI
- React Router
- React Hook Form
- Recharts

### Backend
- Django
- Django REST Framework
- JWT Authentication (SimpleJWT)

### Deployment
- Frontend: Netlify
- Backend: Render

---

## Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Transactions
![Transactions](screenshots/transactions.png)

### Categories
![Categories](screenshots/categories.png)

---

## Run Locally

### Web

Install dependencies (first time only):
```bash
make install-web
```

Start the app:
```bash
make run-web
```

This opens the Django backend and Vite frontend in separate terminal windows, then launches the browser at `http://localhost:5173`.

By default the frontend talks to the local Django backend (`http://localhost:8000/api`), which uses a fresh local database. To use your real account instead, create `frontend/.env.local` pointing to the remote backend:

```bash
VITE_API_BASE_URL=https://personal-finance-tracker-edzo.onrender.com/api
```

### Android Emulator

Install dependencies (first time only):
```bash
make install-android
```

Build and launch the emulator:
```bash
make run-android
```

This builds the frontend, syncs it into the Android project via Capacitor, and deploys the APK to a running emulator. The app always connects to the remote backend.

Requires Android Studio (or standalone Android SDK) with at least one AVD configured.