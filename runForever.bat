@echo off
title Emilia Bot music mode forever - By SilverCrow
echo If the path is not set change...
cd "C:\test\emilia-musicbot"
echo search maj...
git pull
echo Starting bot with forever mode on...
:main
node bot.js
goto main
