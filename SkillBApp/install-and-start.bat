@echo off
echo Installing dependencies...
cd /d "%~dp0"
call npm install
echo.
echo Starting Expo with cleared cache...
call npm start -- --clear







