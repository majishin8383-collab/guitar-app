const SHAPES = {
  A: { frets: [null, null, null, 2, 2, 0], fingers: [0, 0, 0, 1, 2, 0], tip: "Play only G, B and high e. Two fingers at fret 2; high e stays open." },
  D: { frets: [null, null, null, 2, 3, 2], fingers: [0, 0, 0, 1, 2, 1], barre: true, tip: "Mini-barre G, B and high e at fret 2 with finger 1. Finger 2 presses B at fret 3. Play these three strings only." },
  A7: { frets: [null, 0, 2, 0, 2, 0], fingers: [0, 0, 1, 0, 2, 0], tip: "Two fingers: D string fret 2 and B string fret 2. Start strumming at the A string." },
  D7: { frets: [null, null, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3], tip: "Three fingers: G at 2, B at 1, high e at 2. Start at the D string." },
  E7: { frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0], tip: "Two fingers: A string fret 2 and G string fret 1. All six strings can ring." }
};
function chordDiagrams(names, handedness) {
  const strings = ["E", "A", "D", "G", "B", "e"];
  const left = handedness === "left";
  const x = i => 24 + (left ? 5 - i : i) * 24;
  return `<div class="chordDiagrams">${[...new Set(names)].filter(n => SHAPES[n]).map(name => {
    const s = SHAPES[name];
    return `<figure class="chordDiagram"><figcaption>${name}</figcaption>
      <svg viewBox="0 0 168 176" role="img" aria-label="${name}, ${left ? 'left' : 'right'}-handed chord diagram">
        ${[0,1,2,3,4].map(f=>`<line x1="24" x2="144" y1="${42+f*28}" y2="${42+f*28}" stroke="#777" stroke-width="${f===0?4:1}"/>`).join("")}
        ${strings.map((label,i)=>`<line x1="${x(i)}" x2="${x(i)}" y1="42" y2="154" stroke="#999"/><text x="${x(i)}" y="172">${label}</text>${s.frets[i]===null?`<text x="${x(i)}" y="30">×</text>`:s.frets[i]===0?`<text x="${x(i)}" y="30">○</text>`:""}`).join("")}
        ${s.barre?`<line x1="${x(3)}" x2="${x(5)}" y1="84" y2="84" stroke="#ff914d" stroke-width="18" stroke-linecap="round"/>`:""}
        ${s.frets.map((f,i)=>f>0?`<circle cx="${x(i)}" cy="${28+f*28}" r="10" fill="#ff914d"/><text x="${x(i)}" y="${32+f*28}" class="finger">${s.fingers[i]}</text>`:"").join("")}
      </svg><p class="muted">${s.tip}</p></figure>`;
  }).join("")}</div><p class="muted">Numbers in dots = fingers (1 index, 2 middle, 3 ring). × = skip; ○ = open. Diagrams face you. ${left ? "Left-handed layout: high e is on the left." : "Right-handed layout: low E is on the left."}</p>`;
}
function toneCard(state) {
  return `<details class="card toneCard"><summary>Guitar &amp; amp starting point</summary>
    <p>Mustang GTX50: use a clean Fender-style amp model. Try gain 3, bass 4, middle 6, treble 5 and light reverb (2), on a 0–10 scale. Set master volume for the room.</p>
    <p>${state.guitar === "les-paul" ? "Les Paul: start on the neck pickup, volume 7–8 and tone 6–7. Lower gain if chords get muddy." : "Strat: start on the neck pickup, volume 8 and tone 6–7. Add a little gain only if you want more bite."}</p>
    <p class="muted">Suggested starting values, not a required preset. Clean enough to hear every chord.</p></details>`;
}
export { chordDiagrams, toneCard };
