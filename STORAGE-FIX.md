# Important: Multi-User Storage Issue

## The Problem
You mentioned "two users are saving to different grids" - this is happening because the current app uses **in-memory storage** which:
- Resets when Vercel redeploys the function (every few hours or on inactivity)
- Each Vercel region might have its own copy
- Not persistent across restarts

## The Solution: Use Vercel KV (Redis)

Vercel KV is a free, simple database that will make the game work for all users. Here's how to set it up:

### Step 1: Add Vercel KV to Your Project

1. Go to https://vercel.com/dashboard
2. Click on your "squares" project
3. Go to the **Storage** tab
4. Click **Create Database**
5. Select **KV** (Redis)
6. Name it "squares-db"
7. Click **Create**

### Step 2: Update Your API Code

Replace the content of `api/index.js` with this:

```javascript
import { kv } from '@vercel/kv';

const GAME_KEY = 'superbowl-game-state';

async function getGameState() {
    const state = await kv.get(GAME_KEY);
    if (!state) {
        return {
            squares: Array(100).fill(null),
            rowNumbers: [],
            colNumbers: [],
            numbersAssigned: false,
            team1Name: 'Team 1',
            team2Name: 'Team 2',
            quarterScores: [
                { team1: '', team2: '' },
                { team1: '', team2: '' },
                { team1: '', team2: '' },
                { team1: '', team2: '' }
            ]
        };
    }
    return state;
}

async function saveGameState(state) {
    await kv.set(GAME_KEY, state);
    return state;
}

function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        const gameState = await getGameState();
        return res.status(200).json(gameState);
    }

    if (req.method === 'POST') {
        const gameState = await getGameState();
        const { action, index, initials, team1Name, team2Name, quarter, team1Score, team2Score } = req.body;

        switch (action) {
            case 'claim':
                if (index < 0 || index > 99) {
                    return res.status(400).json({ error: 'Invalid square index' });
                }
                if (!initials || initials.length < 2 || initials.length > 4) {
                    return res.status(400).json({ error: 'Initials must be 2-4 characters' });
                }
                if (gameState.squares[index]) {
                    return res.status(400).json({ error: 'Square already claimed' });
                }
                gameState.squares[index] = initials.toUpperCase();
                return res.status(200).json(await saveGameState(gameState));

            case 'assign-numbers':
                const claimed = gameState.squares.filter(s => s !== null).length;
                if (claimed < 100) {
                    return res.status(400).json({ error: 'All squares must be claimed first' });
                }
                gameState.rowNumbers = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
                gameState.colNumbers = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
                gameState.numbersAssigned = true;
                return res.status(200).json(await saveGameState(gameState));

            case 'update-teams':
                if (team1Name) gameState.team1Name = team1Name;
                if (team2Name) gameState.team2Name = team2Name;
                return res.status(200).json(await saveGameState(gameState));

            case 'set-score':
                if (quarter < 0 || quarter > 3) {
                    return res.status(400).json({ error: 'Invalid quarter' });
                }
                gameState.quarterScores[quarter] = {
                    team1: team1Score,
                    team2: team2Score
                };
                return res.status(200).json(await saveGameState(gameState));

            case 'erase':
                if (index < 0 || index > 99) {
                    return res.status(400).json({ error: 'Invalid square index' });
                }
                gameState.squares[index] = null;
                return res.status(200).json(await saveGameState(gameState));

            case 'clear-board':
                gameState.squares = Array(100).fill(null);
                return res.status(200).json(await saveGameState(gameState));

            case 'reset':
                const resetState = {
                    squares: Array(100).fill(null),
                    rowNumbers: [],
                    colNumbers: [],
                    numbersAssigned: false,
                    team1Name: gameState.team1Name,
                    team2Name: gameState.team2Name,
                    quarterScores: [
                        { team1: '', team2: '' },
                        { team1: '', team2: '' },
                        { team1: '', team2: '' },
                        { team1: '', team2: '' }
                    ]
                };
                return res.status(200).json(await saveGameState(resetState));

            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
```

### Step 3: Update package.json

Add this to your `package.json`:

```json
{
  "name": "squares",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@vercel/kv": "^1.0.0"
  }
}
```

### Step 4: Deploy

Just push to GitHub - Vercel will automatically:
1. Install @vercel/kv
2. Connect to your KV database
3. Start using persistent storage

## What This Fixes

✅ All users see the same grid
✅ Data persists across page refreshes
✅ No more random resets
✅ Game state saved permanently

## Cost

Vercel KV is **FREE** for hobby projects with plenty of storage for this use case!
