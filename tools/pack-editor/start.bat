@echo off
chcp 65001 >nul
title 记得 Pack Editor
cd /d "%~dp0..\.."
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1"
if errorlevel 1 (
  echo.
  echo 启动失败，请确认已安装 Node.js 与 pnpm，并在仓库根目录执行过 pnpm install。
  pause
)
