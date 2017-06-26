@echo off
color 2
title Emilia Bot music - By SilverCrow
echo If the path is not set change...
cd "C:\test\emilia-musicbot"
echo Search maj , wait a few second...
git pull
echo Starting script...
node --harmony bot.js
pause