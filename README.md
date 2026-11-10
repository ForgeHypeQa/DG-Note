# DG-Note

Meeting notes by ForgeHype. One phone on the table records the meeting, Soniox transcribes Arabic and English, and each voice is named from the introductions at the start.

**Status: step 1 of 6.** The Solo tab records and transcribes for real. Group and the sample reports are still the design prototype. See [docs/ROADMAP.md](docs/ROADMAP.md).

## Sign-in (demo)

The app opens on a sign-in screen. Accounts are fixed in `server/auth.js` (no database yet):

| Account | Sign in with | Role |
|---|---|---|
| Admin | the ForgeHype email | Full access: sees who is online, can sign people out, switch guests on or off |
| Guest 1 to Guest 6 | `Guest 1` … `Guest 6` | Can use Solo and Reports |

- At most **4 people** can be signed in at once (`MAX_ONLINE`). A 5th person sees "The demo is full".
- The admin is never locked out: if the demo is full, the guest idle the longest is signed out.
- Signing in on a second device replaces the first session for that account.
- A seat is freed when someone signs out, or after 3 minutes without the app open.
- 8 wrong passwords in a minute pauses that account for a minute.
- Logins and passwords are stored only as salted scrypt hashes. To change the admin login, set `ADMIN_LOGIN_HASH` and `ADMIN_PASSWORD_HASH` in the host's environment (make them with `node -e "const c=require('crypto');const s=c.randomBytes(16).toString('hex');console.log(s+':'+c.scryptSync(process.argv[1],s,32).toString('hex'))" 'value'`).
- Sign-in lasts 7 days and survives server restarts (signed cookie, key from `SESSION_SECRET`). Leaving the app does not sign you out: after 3 minutes away you only give up your seat. Coming back, you get a seat again if one is free; otherwise the app says the demo is full and nothing is lost.

## How Solo works

1. **Start meeting.** The phone says "This meeting will be recorded for digital records." Recording starts.
2. **Introductions.** Each person says their name and department, e.g. "Hi, I'm Sara Mendes from Nursing" or «أنا نورة السليطي من الصيدلة». Tap **Introductions done**.
3. **Meeting.** Talk as usual. Audio is saved on the phone every 5 seconds (IndexedDB), so a dropped connection or a reload loses nothing.
   - If the phone stops the recording (app sent to the background, screen locked), coming back shows **Continue recording**. If the app was closed, Solo shows **Meeting was interrupted** with **Continue recording**. Each restart is a new part; the server joins the parts into one file (ffmpeg) before transcription.
4. **End meeting.** The whole recording is uploaded once. The server sends it to Soniox (async, with speaker separation, language detection and English translation).
5. **Who spoke.** Each voice is matched to the staff list from what it said in the introductions, even if slightly misheard. Names not on the list are kept as spoken. Tap a card to fix a name. Two cards with the same name are joined in the report.
6. **Transcript.** Opens under Reports, with speaker colours, Arabic shown in English with the original underneath, and unclear words in orange (tap to keep or correct).

**Saved on the phone:** finished transcripts, names, edits, change history and the recording are kept on the phone (IndexedDB) for the signed-in account, so reloading, signing out or a server restart loses nothing. In a report, **Recording** has *Save the audio file*, *Save the transcript (.txt)* and *Delete this meeting from the phone*.

There is **no database yet**. The server keeps the audio in memory only while sending it to Soniox, then deletes the file and transcription from Soniox. Results are held in memory for one hour. The recording stays on the phone.

## Run it

Needs Node 20 or newer and a Soniox API key (https://console.soniox.com).

```bash
npm install
cp .env.example .env      # then put your key in SONIOX_API_KEY
npm start                 # http://localhost:3000
```

On the computer, open http://localhost:3000 and use **Test with an audio file**, or record with the laptop microphone.

### On a phone

Browsers only allow the microphone over **https**. Easiest options:

- **Tunnel (quick test):** `npx cloudflared tunnel --url http://localhost:3000` and open the https address it prints on the phone.
- **Render (recommended):** in Render choose New → Blueprint → this repo. It reads `render.yaml`, asks for `SONIOX_API_KEY`, and gives an https link like `https://dg-note.onrender.com`. The free plan sleeps when idle, so the first open takes about a minute.
- **Other hosts:** any Node host (Render, Railway, Fly.io). Set `SONIOX_API_KEY` in the host's environment. Start command `npm start`.

Keep the screen on during the meeting. The app asks the phone not to sleep, but a web page can stop recording if the browser is sent to the background. The native app (step 6) removes this limit.

### Without a Soniox key

A stand-in Soniox server returns a scripted 4-person meeting, whatever audio you send:

```bash
npm run mock        # terminal 1
npm run dev:mock    # terminal 2, then open http://localhost:3000
```

### Tests

```bash
npm test            # name matching and transcript building
```

## Files

| Path | What it does |
|---|---|
| `server/index.js` | Web server and the `/api/solo/jobs` endpoints |
| `server/soniox.js` | Soniox REST calls (upload, transcribe, poll, fetch, delete) |
| `server/build.js` | Soniox tokens → speaker segments, English text, unclear words |
| `server/names.js` | Finds each speaker's name and department in their introduction |
| `server/roster.js` | Sample staff list (stands in for the database) |
| `public/` | The app: `index.html`, `styles.css`, `app.js` |
| `test/` | Unit tests and the stand-in Soniox server |

## API

| Method | Path | |
|---|---|---|
| GET | `/api/health` | `{ soniox: true/false, model }` |
| GET | `/api/roster` | Sample staff list |
| POST | `/api/solo/jobs?title=&introEndMs=&durationMs=` | Body is the raw audio file. Returns `{ id }` |
| GET | `/api/solo/jobs/:id` | `{ status: working/done/error, step, result }` |

`step` goes `upload → queued → processing → naming → done`. `result` has `speakers[]` (label, name, dept, email, how, heard, candidates) and `segments[]` (speaker, startMs, endMs, text, orig, lang).

Optional settings in `.env`: `SONIOX_MODEL` (default `stt-async-v6`), `SONIOX_API_BASE` (for a regional Soniox domain), `PORT`.
