@echo off
REM ====== НАСТРОЙКА ======
set REPO=https://github.com/gheofvens/infinity.git
set BRANCH=main
set MSG=Auto deploy

REM ====== СТАРТ ======
echo ============================
echo 🚀 Infinity Auto Deploy
echo ============================

REM Добавляем изменения
git add .

REM Коммитим с сообщением
git commit -m "%MSG%"

REM Отправляем на GitHub
git push %REPO% %BRANCH%

echo ============================
echo ✅ Деплой завершён!
echo ============================
pause