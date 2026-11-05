# Ludo — tiny multiplayer game

Files: `index.html` (the whole game), `server.js` (Node + `ws`, handles unlimited rooms), `package.json`.

## Try it locally
```
npm install
npm start
```
Open http://localhost:3000 in two tabs, enter different nicknames and the same code.

## Play with friends
Friends need a public address, so host it on any service that runs Node (Render, Railway, Koyeb, a VPS...):
1. Put these files in a GitHub repo.
2. Create a new web service from the repo. Build command: `npm install`. Start command: `npm start`.
3. Open the URL you get, enter nickname + color + any code, then tap "Share invite link" in the lobby and send it to friends.

Free tiers usually sleep when idle, so the first load can take 30-60 seconds. For a one-off session you can also run it on your laptop and expose it with a tunnel tool (cloudflared, ngrok).

## Rules
Roll a 6 to leave home. A 6, a capture or reaching home gives an extra turn. Star and start squares are safe. You need the exact roll to finish. First to bring all 4 tokens home wins. 2-4 players. Rejoin with the same nickname + code. Rooms vanish about 10 minutes after everyone leaves.
