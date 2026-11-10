# DG-Note

Meeting notes by ForgeHype. One phone on the table records the meeting, Soniox transcribes Arabic and English, and each voice is named from the introductions at the start.

**Status: step 1 of 6.** The Solo tab records and transcribes for real. Group and the sample reports are still the design prototype. See [docs/ROADMAP.md](docs/ROADMAP.md).

## How Solo works

1. **Start meeting.** The phone says "This meeting will be recorded for digital records." Recording starts.
2. **Introductions.** Each person says their name and department, e.g. "Hi, I'm Sara Mendes from Nursing" or «أنا نورة السليطي من الصيدلة». Tap **Introductions done**.
3. **Meeting.** Talk as usual. Audio is saved on the phone every 10 seconds (IndexedDB), so a dropped connection or a reload loses nothing.
4. **End meeting.** The whole recording is uploaded once. The server sends it to Soniox (async, with speaker separation, language detection and English translation).
5. **Who spoke.** Each voice is matched to the staff list from what it said in the introductions, even if slightly misheard. Names not on the list are kept as spoken. Tap a card to fix a name. Two cards with the same name are joined in the report.
6. **Transcript.** Opens under Reports, with speaker colours, Arabic shown in English with the original underneath, and unclear words in orange (tap to keep or correct).

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
- **Deploy:** any Node host (Render, Railway, Fly.io). Set `SONIOX_API_KEY` in the host's environment. Start command `npm start`.

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
