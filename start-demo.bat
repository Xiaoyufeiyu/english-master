@echo off
chcp 65001 >nul
set NODE=C:\Users\Fuxiaoyu\.workbuddy\binaries\node\versions\22.12.0\node.exe
set LT=C:\Users\Fuxiaoyu\.workbuddy\binaries\node\workspace\node_modules\localtunnel\bin\lt.js
set ROOT=D:\english-master
echo ========================================
echo  修仙英语 · 演示服务启动器
echo ========================================
echo 将打开两个窗口：
echo   [EM-Server] 本地服务 (localhost:8080)
echo   [EM-Tunnel] 公网隧道 (Your url is ...)
echo ----------------------------------------
echo 若提示 8080 被占用，请先关闭旧的 EM-Server 窗口。
echo ========================================
start "EM-Server" "%NODE%" "%ROOT%\server\server.js"
timeout /t 2 >nul
start "EM-Tunnel" "%NODE%" "%LT%" --port 8080
echo 已启动。请查看 [EM-Tunnel] 窗口里的 "your url is: https://xxxx.loca.lt"
echo 首次打开该公网地址会弹密码页，访问 https://loca.lt/password 取密码填入即可进入。
pause
