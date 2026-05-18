@echo off
cd /d "%~dp0.."\frontend
set VITE_API_BASE_URL=https://personal-finance-tracker-edzo.onrender.com/api
npm run dev
