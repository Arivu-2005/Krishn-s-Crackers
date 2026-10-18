@echo off
title Krishn's Crackers Server
echo ========================================================
echo        KRISHN'S CRACKERS - "Celebrate Every Moment!"
echo ========================================================
echo.
echo Starting Node.js Express server on port 3000...
echo.
echo Customer Storefront: http://localhost:3000/
echo Admin Dashboard:     http://localhost:3000/admin.html
echo.
echo Admin Credentials:
echo   Email:    admin@krishnscrackers.com
echo   Password: admin123
echo.
echo Press Ctrl+C in this terminal window to stop the server.
echo ========================================================
echo.

start http://localhost:3000/

node server.js
pause
