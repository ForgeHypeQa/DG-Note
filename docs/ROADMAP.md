# DG-Note roadmap

| # | Step | What it proves | Status |
|---|---|---|---|
| 1 | **Solo transcription** | One phone records, Soniox transcribes Arabic and English, speakers are named from the introductions | Built |
| 2 | **Real-room testing and tuning** | Accuracy with 2–4 people at a real table on iPhone and Android, long meetings (1–2 h), name matching on real accents | Next |
| 3 | **AI write-up** | Summary, decisions, actions and open questions written from the transcript, in English, translatable; dictation edits with grammar fixed | |
| 4 | **Group meetings** | Each person's phone records its owner; the server lines the recordings up by time, keeps the loudest phone per moment, and sends one clean file to Soniox | |
| 5 | **Database and accounts** | Sign-in, organisations and staff list, saved meetings and reports, email of the PDF minutes, audio auto-deleted after 30 days | |
| 6 | **Native app** | iOS and Android wrapper so recording continues with the screen locked; push notifications for invites | |

## Step 2 checklist

- [ ] Add the Soniox key and run one meeting on a laptop with **Test with an audio file**
- [ ] Deploy (or tunnel) over https and record on an iPhone and an Android phone
- [ ] 2, 3 and 4 people at a 1 m table, English only, Arabic only, mixed
- [ ] Check speaker count, names, departments, unclear words
- [ ] 60-minute meeting: upload time, Soniox time, phone storage
- [ ] Put the real staff list into `server/roster.js`
