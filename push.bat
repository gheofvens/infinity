@echo off
chcp 65001 >nul
echo ==============================
echo Push to GitHub and Deploy to Render
echo ==============================

:: Проверяем, есть ли изменения
git status --porcelain >nul 2>&1
if %errorlevel% neq 0 (
    echo Git status failed, aborting.
    pause
    exit /b
)

for /f %%i in ('git status --porcelain ^| findstr /r /c:"."') do (
    set changes=1
)

if not defined changes (
    echo No changes to commit. Skipping push and deploy.
    pause
    exit /b
)

echo Adding changes...
git add .

echo Committing...
git commit -m "Auto push"

echo Pushing to GitHub...
git push -u origin main

echo Triggering Render deploy...
curl -X POST "https://api.render.com/deploy/srv-d2jmtv3ipnbc73bd0c9g?key=Jj-dlcrsbtk"

echo ==============================
echo Done! GitHub updated and Render deploy triggered.
echo ==============================
pause