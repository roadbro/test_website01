@echo off
chcp 65001 > nul
cd /d "%~dp0"
if not exist ".env.local" copy ".env.example" ".env.local" > nul
echo .env.local 파일을 메모장으로 엽니다.
echo 두 인증키의 안내 문구를 실제 키로 바꾼 뒤 저장하세요.
start "" notepad ".env.local"
