@echo off
chcp 65001 > nul
echo ========================================================
echo   🏛️ SUY TƯỞNG (MEDITATIONS) — LOCAL HTTP SERVER
echo.
echo   💻 Đọc trên Máy Tính:  http://localhost:8080/
echo   📱 Đọc trên Điện Thoại (cùng Wi-Fi): http://192.168.1.236:8080/
echo.
echo   Nhấn Ctrl+C để dừng máy chủ khi không sử dụng.
echo ========================================================
start "" "http://localhost:8080/"
python -m http.server 8080 --directory "%~dp0"
pause
