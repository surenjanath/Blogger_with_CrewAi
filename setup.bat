@echo off
echo ========================================
echo Django Blog Post Builder Setup
echo ========================================
echo.

echo [1/4] Creating virtual environment...
python -m venv venv
if errorlevel 1 (
    echo ERROR: Failed to create virtual environment
    echo Make sure Python is installed and in your PATH
    pause
    exit /b 1
)

echo [2/4] Activating virtual environment...
call venv\Scripts\activate.bat

echo [3/4] Installing dependencies...
pip install --upgrade pip
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo [4/4] Setting up environment file...
if not exist .env (
    copy .env.example .env
    echo Created .env file from .env.example
    echo Please edit .env file with your configuration
) else (
    echo .env file already exists, skipping...
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Activate virtual environment: venv\Scripts\activate
echo 2. Edit .env file with your settings
echo 3. Run migrations: python manage.py migrate
echo 4. Start server: python manage.py runserver
echo.
pause

