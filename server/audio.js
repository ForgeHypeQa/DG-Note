// Joins recording parts into one file. A phone can stop recording when the app goes
// to the background; the app then records a new part. The speech engine needs one file per
// meeting, so the parts are joined here (temp files, deleted straight after).
import ffmpegPath from 'ffmpeg-static';
import { execFile } from 'node:child_process';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

// body = all parts back to back; sizes = byte length of each part.
export function splitParts(body, sizes) {
  const parts = []; let at = 0;
  for (const n of sizes) { parts.push(body.subarray(at, at + n)); at += n; }
  if (at !== body.length) throw new Error('The recording parts did not arrive complete. Try again.');
  return parts;
}

export async function joinParts(parts, ext) {
  if (parts.length === 1) return { buffer: parts[0], joined: false };
  const dir = await mkdtemp(path.join(tmpdir(), 'dg-'));
  try {
    const inputs = [];
    for (let i = 0; i < parts.length; i++) { const f = path.join(dir, `p${i}.${ext}`); await writeFile(f, parts[i]); inputs.push(f); }
    const out = path.join(dir, 'joined.ogg');
    const args = ['-hide_banner', '-loglevel', 'error', ...inputs.flatMap(f => ['-i', f]),
      '-filter_complex', `${inputs.map((_, i) => `[${i}:a]`).join('')}concat=n=${inputs.length}:v=0:a=1[a]`,
      '-map', '[a]', '-ac', '1', '-c:a', 'libopus', '-b:a', '48k', out];
    await new Promise((res, rej) => execFile(ffmpegPath, args, { timeout: 10 * 60 * 1000 }, (e, so, se) => e ? rej(new Error('Could not join the recording parts: ' + (se || e.message).slice(0, 200))) : res()));
    return { buffer: await readFile(out), joined: true, mime: 'audio/ogg', ext: 'ogg' };
  } finally {
    rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}
