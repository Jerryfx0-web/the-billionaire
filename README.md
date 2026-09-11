# The Billionaire

A browser-based billionaire empire game prototype with an online Node backend.

## Included now
- Player registration/login
- Persistent server-side player saves in `data/players.json`
- Online global leaderboard
- Businesses and passive income
- Simulated stock trading
- Properties
- Managers
- International expansion
- XP, levels and gems
- Daily rewards
- Responsive mobile-friendly UI
- Railway-ready Node deployment

## Run
```bash
npm start
```
Then open `http://localhost:3000`.

## Production roadmap
For a production launch, replace the JSON store with PostgreSQL, hash passwords with a password-hashing library, add sessions/JWT, server-authoritative transactions, WebSockets for live multiplayer, rate limiting, moderation/admin tools, payments, analytics and a real anti-cheat layer.
