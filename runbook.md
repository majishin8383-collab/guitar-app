# Guitar App — RUNBOOK

## Purpose
A guitar practice app that uses pleasant, human-feeling backing tracks to make practicing enjoyable and motivating.

## Current Status
- App exists and runs
- Backing tracks sound robotic / Atari-like
- This is the primary blocker

## Active Build Focus
Replace robotic backing tracks with AI-generated, band-feel instrumentals.

## Active Patch
GT-01 — Band-feel backing tracks

## Success Criteria
"Would I enjoy practicing guitar to this for 5 minutes?"

## Hard Constraints (LOCKED)
- No DAWs
- No exporting from old MacBook
- No perfectionism
- AI-generated music is acceptable
- Must feel good emotionally, not just technically

## Out of Scope (PARKED)
- Empire Reigns
- Praxis
- UI redesigns
- Monetization
- Advanced music theory systems

## Generator
Suno (instrumental-only, band feel)

## Backing Track Rules
- Drums + bass + light rhythm guitar/keys
- No lead melody
- No synth leads or arpeggiators
- Tempo: 70–110 BPM
- Time: 4/4
- Keys: E, A, D, G
- Length: 2–4 minutes
- Loop-safe structure

## Prompt Template
Instrumental backing track with a live band feel.
Realistic drums, bass, and light rhythm guitar.
No lead melody.
Warm, human groove.
Simple chord progression.
Guitar practice friendly.
Sounds like playing with musicians in a room.
Natural dynamics, no synth leads, no electronic arpeggios.
Tempo: ___ BPM.
Key: ___.
Style: ___.

## Stop Conditions
- Do not refactor unrelated files
- Do not change UI unless requested
- Do not introduce new frameworks
- Ask for missing files instead of guessing
