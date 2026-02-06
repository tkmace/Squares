# Simple Vercel KV Setup (IGNORE THE VERCEL INSTRUCTIONS)

## Don't Follow Vercel's Instructions!

Vercel shows you confusing steps about `node-redis` and environment variables. **IGNORE THOSE**. They're for a different setup method. Here's the simple way:

## Step 1: Create the KV Database (You Already Did This!)

✅ You already created the KV database in Vercel's Storage tab. Good!

## Step 2: Update Your Files

Just upload these 2 files to your GitHub repo:

### File 1: `package.json`

Replace your current package.json with this:

```json
{
  "name": "squares",
  "version": "1.0.0",
  "dependencies": {
    "@vercel/kv": "^1.0.0"
  }
}
```

### File 2: `api/index.js`

You already have a file called `api/index-with-kv.js.backup` in your repo. 

**Simply rename it:**
- Delete the current `api/index.js`
- Rename `api/index-with-kv.js.backup` to `api/index.js`

## Step 3: That's It!

Push to GitHub. Vercel will:
1. See the `@vercel/kv` dependency
2. Automatically connect your KV database
3. Install everything
4. Deploy

## No Need For:
- ❌ `vercel env pull` command
- ❌ Installing `redis` or `node-redis`
- ❌ Any local setup
- ❌ Environment variables

Vercel handles all of that automatically when it sees `@vercel/kv` in your package.json!

## To Check It Worked:

After deployment, your game should:
- Keep all data even after page refresh
- Work the same for all users
- Never reset unexpectedly

## If You See Errors:

Go to your Vercel deployment logs and look for:
- "Installing @vercel/kv" ✓ Good
- "Connected to KV database" ✓ Good
- Any error messages → Share them with me

## Current Version (In-Memory)

Your current version works great for this weekend! Only switch to KV if:
- You want to use this for future games
- You need guaranteed data persistence
- Multiple people will be admins

For a single party weekend, the current version is fine!
