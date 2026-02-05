// Vercel Serverless Function for Super Bowl Squares
// This stores game state in memory (resets on deployment)
// For production, connect to Vercel KV, Postgres, or other database

let gameState = {
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

function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const path = req.url.split('?')[0];

    // GET /api/game - Get current game state
    if (req.method === 'GET' && path === '/api/game') {
        return res.status(200).json(gameState);
    }

    // POST /api/claim - Claim a square
    if (req.method === 'POST' && path === '/api/claim') {
        const { index, initials } = req.body;
        
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
        return res.status(200).json(gameState);
    }

    // POST /api/assign-numbers - Assign random numbers
    if (req.method === 'POST' && path === '/api/assign-numbers') {
        const claimed = gameState.squares.filter(s => s !== null).length;
        
        if (claimed < 100) {
            return res.status(400).json({ error: 'All squares must be claimed first' });
        }
        
        gameState.rowNumbers = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        gameState.colNumbers = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        gameState.numbersAssigned = true;
        
        return res.status(200).json(gameState);
    }

    // POST /api/update-teams - Update team names
    if (req.method === 'POST' && path === '/api/update-teams') {
        const { team1Name, team2Name } = req.body;
        
        if (team1Name) gameState.team1Name = team1Name;
        if (team2Name) gameState.team2Name = team2Name;
        
        return res.status(200).json(gameState);
    }

    // POST /api/set-score - Set quarter score
    if (req.method === 'POST' && path === '/api/set-score') {
        const { quarter, team1Score, team2Score } = req.body;
        
        if (quarter < 0 || quarter > 3) {
            return res.status(400).json({ error: 'Invalid quarter' });
        }
        
        gameState.quarterScores[quarter] = {
            team1: team1Score,
            team2: team2Score
        };
        
        return res.status(200).json(gameState);
    }

    // POST /api/reset - Reset game
    if (req.method === 'POST' && path === '/api/reset') {
        gameState = {
            squares: Array(100).fill(null),
            rowNumbers: [],
            colNumbers: [],
            numbersAssigned: false,
            team1Name: gameState.team1Name, // Keep team names
            team2Name: gameState.team2Name,
            quarterScores: [
                { team1: '', team2: '' },
                { team1: '', team2: '' },
                { team1: '', team2: '' },
                { team1: '', team2: '' }
            ]
        };
        
        return res.status(200).json(gameState);
    }

    return res.status(404).json({ error: 'Not found' });
}
