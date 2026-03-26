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

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
```bash
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```