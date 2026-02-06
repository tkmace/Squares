# Troubleshooting Guide

## Step 1: Can you see the page?

Visit your Vercel URL (like `your-project.vercel.app`)

**If you see a blank white page:**
- The HTML file isn't being served
- Check that `index.html` is in the ROOT of your repo (not in a folder)

**If you see "Super Bowl Squares" title and blue background:**
- The HTML is working
- The API is the problem

## Step 2: Check the browser console

1. Press F12 (or right-click → Inspect)
2. Click "Console" tab
3. Refresh the page
4. Look for messages

**If you see nothing:**
- JavaScript might be blocked
- Try a different browser
- Check if you have any ad blockers

**If you see red errors:**
- Take a screenshot and share them

## Step 3: Check the API directly

Visit: `your-project.vercel.app/api/game`

**If you see JSON data like `{"squares":[null,null...]}`:**
- API is working!
- The problem is in the JavaScript connecting to it

**If you see "404 NOT FOUND":**
- API file isn't deployed correctly
- Make sure `/api/game.js` file exists in your repo

**If you see "500 ERROR":**
- API has a code error
- Check Vercel deployment logs

## Step 4: File structure check

Your GitHub repo should look EXACTLY like this:

```
Squares/
├── index.html          ← In the ROOT, not in a folder
├── api/
│   └── game.js         ← Inside api folder
└── package.json        ← In the ROOT
```

## Step 5: Vercel settings

1. Go to your project on Vercel
2. Click Settings
3. Under "Build & Development Settings":
   - Framework Preset: **Other**
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
   - Install Command: (leave empty)

## Common Issues

### Issue: "Failed to load game data"
**Cause:** API not responding
**Fix:** Visit `/api/game` directly to test

### Issue: Blank page
**Cause:** index.html not in root
**Fix:** Move index.html to root of repo

### Issue: Nothing in console
**Cause:** JavaScript not loading
**Fix:** Check browser doesn't block scripts

## Quick Test

Visit these URLs and tell me what you see:

1. `your-project.vercel.app` - Should show the game
2. `your-project.vercel.app/api/game` - Should show JSON data

Replace `your-project` with your actual Vercel project name.
