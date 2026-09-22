# Guitar Trainer — GT-004

## Goal and scope
A personal, mobile-friendly blues trainer: YouTube lessons and backing tracks, short runs, small chord shapes, left-handed diagrams, and Mustang GTX50 starting settings. Preserve the existing dark/orange UI and vanilla JavaScript structure.

## Delivery and validation — 2026-09-22
GT-003 was merged through PR #1 and published by the existing GitHub Pages deployment. The live Home and jam screens were opened and verified at https://majishin8383-collab.github.io/guitar-app/.

GT-004 fixes the final issue found during live inspection: navigation from a long screen retained the previous scroll position, hiding the next screen's instructions. A different screen now opens at the top; controls that update the current screen retain position. The app entry URL changes to invalidate the previous script cache.

Seven Node regression tests pass, including background reset, early-save prevention, and completion deduplication. The full Chromium browser flow passed at a 390 × 844 touch viewport: fresh Home, warm-up, start/restart/save, Easy/Medium/Hard unlocking, saved progress after reload, next core, jam, replay, persistent mirror OFF, guitar settings, Home/Back, and metronome cleanup. No application exceptions or missing local assets were found. Phone and 1280px desktop screenshots were visually inspected.

Passing browser evidence for PR #1: https://github.com/majishin8383-collab/guitar-app/actions/runs/35795943569. The Practice checks workflow verifies each subsequent pull request and main commit; it saves screenshots and results as a workflow artifact. Browser tests use a disposable profile, an accelerated clock, and an isolated YouTube frame. They do not prove playing quality or actual media playback.

Live YouTube inspection: the jam embed loaded the correct title, controls, and 7:35 duration, but playback did not visibly advance in the cloud browser. Actual audio is unverified. Every player retains its Open on YouTube link. Do not describe audio playback as tested successfully.

## Source of truth
- Repository: https://github.com/majishin8383-collab/guitar-app
- Active content: content/base.js, content/core.js, content/genres/blues.js, content/songs/song1_tracks.js, content/songs/song1.js.
- Router: app.js and render.js, using existing state.view, NOT hash routing.
- Progress key: guitar_trainer_state_v3. Existing drill progress is retained.
- Song completion: state.songs.completed[songId][variant].
- Core completion: state.coreCompleted[skillId].

## Implemented behavior
1. Home recommends Steady Time, then First Groove Easy / Medium / Hard, then Small Chord Changes, then the blues jam screen.
2. First Groove stays A / A / D / A, four beats per bar. Same activity across variants: 80 / 95 / 110 BPM and 60 / 75 / 90 seconds.
3. Small mistakes are allowed. A reported full stop resets the run. Completion is self-assessed after the timer, not microphone detection. Leaving the tab during a run resets it.
4. Song 1 uses YouTube drum loops so pitched accompaniment cannot contradict its chord pattern. Full-band jams are separate and direct the user to follow their video changes.
5. Left-handed is the fresh-install default. Existing handedness is retained. Turning video mirroring off stays off.
6. Returning from browser back/forward cache re-renders the practice screen so a cleaned-up timer cannot leave disabled controls.
7. No generated synth backing, Suno workflow, accounts, subscriptions, new framework, or app dependencies.

## Confirmed defects addressed
- index.html requested song1.tracks.js, while the file was song1_tracks.js.
- Home navigation retained the songs view and could trap the user.
- Variants were force-unlocked, with no saved song completion.
- Mirroring was forced on after each left-handed render.
- Song 1's A/A/D/A loop did not match its previous pitched tracks.
- Several mix/BPM labels were not supported by their sources.
- Tempo feedback could claim a level above the configured target.

## Content evidence — 2026-09-20
YouTube watch-page titles/descriptions identify the new loops as drum-only shuffle tracks at these tempos; their playability returned OK and playableInEmbed true. Actual user playback remains a separate check.
- Easy 80 BPM: https://www.youtube.com/watch?v=nm7neHuVuic
- Medium 95 BPM: https://www.youtube.com/watch?v=7QdfK0Vs1nM
- Hard 110 BPM: https://www.youtube.com/watch?v=dYzQfWD8bGk
- Original full-band A jam, 80 BPM: https://www.youtube.com/watch?v=QUZOJF_czqU
- Quick-change A, 92 BPM: https://www.youtube.com/watch?v=snHUyvxKPEc
- Chord lesson: https://www.youtube.com/watch?v=1X2rW5ATdLQ (full A shape reference; app diagrams explicitly teach smaller shapes).
All original blues video IDs returned valid titles via YouTube oEmbed. Every player includes an Open on YouTube fallback for blocked embeds.

## Missing content — do not invent
The 13-song path was discussed, but ONLY Song 1 exists in this repository, its branches, or its file history. No confirmed list of the other 12 songs was recovered. Song 2 remains a parked pointer, not a working lesson. Do not present 13 songs as implemented. Named blues-song packs and advanced Albert King / Eric Gales modules remain future content. First Groove is an original practice groove.

## Development and release
Run `node --test tests/regression.test.mjs` locally. Serve with `python3 -m http.server 8765`; ES modules require HTTP. The Practice checks workflow installs Playwright outside the app and runs `tests/browser-check.mjs` with Chromium. There are no app package dependencies.

For future edits, verify the affected phone flow and inspect screenshots. After merging, verify the existing Pages deployment and live app. Preserve the same URL and storage key. Avoid test state in the learner's browser; CI uses its own profile.

## Next workload
Recover or agree the actual next song. Implement one song as one content change with verified key, BPM, chords, lesson, and accompaniment. Keep unrelated projects out of this repository.
