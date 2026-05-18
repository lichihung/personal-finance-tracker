@echo off
cd /d "%~dp0.."
call backend\.venv\Scripts\activate
cd backend
python manage.py runserver
