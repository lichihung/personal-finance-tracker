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

This opens a Vite frontend window and launches the browser at `http://localhost:5173`. The frontend connects to the remote backend, so you can log in with your real account straight away.

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

### Android Release (Google Play)

#### Prerequisites

Two files must exist outside the repo (never committed):

```
C:\Users\VESPER\personal-finance-tracker-android-keys\
    verdia.jks        ← signing keystore
    key.properties    ← keystore credentials
```

`key.properties` format:
```
storePassword=your-password
keyPassword=your-password
keyAlias=verdia
storeFile=C:\\Users\\VESPER\\personal-finance-tracker-android-keys\\verdia.jks
```

#### 1. Build the signed AAB

```bash
make release
```

This prompts for `versionCode` and `versionName` (press Enter to keep current), then runs `npm build` → `cap sync` → `gradlew bundleRelease`. The output AAB is at:

```
frontend/android/app/build/outputs/bundle/release/app-release.aab
```

#### 2. Upload to Google Play Console

1. Go to **Google Play Console** → select the app
2. **Testing → Closed testing** → **Manage track** (Closed Test)
3. Click **Create new release**
4. Upload `app-release.aab`
5. Fill in release notes describing what changed
6. Click **Save** → **Review release** → **Start rollout**