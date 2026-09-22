# Guitar Trainer — GT-003 recovery draft

## Goal and scope
A personal, mobile-friendly blues trainer: YouTube lessons and backing tracks, short runs, small chord shapes, left-handed diagrams, and Mustang GTX50 starting settings. Preserve the existing dark/orange UI and vanilla JavaScript structure.

## Current delivery status — 2026-09-21
Implementation is preserved in this draft branch. It is NOT published to the live app.
The execution environment went offline during browser setup. These files were recovered from the recorded edits against the unchanged baseline f4f69813fc9a78acef719162396878027585044d.

Six Node regression tests passed before the disconnection. During recovery, JavaScript syntax, content references, sequential song progression, tempo consistency, and accompaniment types were checked again. The restored Node test file still needs a run on this exact commit. No successful mobile screenshot, real browser end-to-end pass, or actual embedded audio playback check has been completed.

## Source of truth
- Repository: https://github.com/majishin8383-collab/guitar-app
- Active content: content/base.js, content/core.js, content/genres/blues.js, content/songs/song1_tracks.js, content/songs/song1.js.
- Router: app.js and render.js, using existing state.view, NOT hash routing.
- Progress key: guitar_trainer_state_v3. Existing drill progress is retained.
- Song completion: state.songs.completed[songId][variant].
- Core completion: state.coreCompleted[skillId].

## Implemented draft behavior
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

## Resume here
1. Check out this branch in an active environment.
2. Run: node --test tests/regression.test.mjs
3. Serve: python3 -m http.server 8765
4. Test on a 390px viewport: fresh Home, Steady Time, start/restart/finish/save, Easy / Medium / Hard locks, reloading saved progress, next-core routing, Home and Back, mirroring OFF persistence, and metronome stopping on navigation.
5. Verify actual YouTube play/pause and fallback links. Confirm no console errors or local asset 404s. Inspect phone and desktop screenshots.
6. Fix failures, record results here, then merge and verify the existing live deployment. Do not call the draft ready before these checks.

## Next workload after this draft ships
Recover or agree the actual next song. Implement one song as one content change with verified key, BPM, chords, lesson, and accompaniment. Keep unrelated projects out of this repository.
