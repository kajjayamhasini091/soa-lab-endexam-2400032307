@echo off
echo ========================================
echo   Pushing to GitHub...
echo ========================================

cd /d "c:\Users\hasin\Downloads\lab end sem\jwt-tourist-auth"

git init
git add .
git commit -m "JWT Tourist Auth - Login Token Validation and Update"
git remote remove origin 2>nul
git remote add origin https://github.com/kajjayamhasini091/soa-lab-endexam-2400032307.git
git branch -M main
git push -u origin main

echo ========================================
echo   DONE! Check GitHub now.
echo ========================================
pause
