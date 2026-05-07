# Parkside Courts

Small reservation app for the neighborhood pickleball club. My folks asked if I
could throw something together so members could grab evening slots without the
spreadsheet juggling, and this is what I came up with on a few weekends. Also a
fun excuse to play with TypeScript.

## Run it locally

```bash
npm install
npm run dev
```

Opens on http://localhost:8188. The schedule lives in `src/schedule.ts` — edit
there until I wire up a real backend.

## Status

v0.4. Booking flow works, no auth yet, no email confirmations. PRs welcome.
