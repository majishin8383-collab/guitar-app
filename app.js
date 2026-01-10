const app = document.getElementById("app");

let state = {
  genre: "blues"
};

function renderHome() {
  app.innerHTML = `
    <div class="card">
      <h2>Choose Your Genre</h2>
      <p>More coming later. Start focused.</p>
      <button id="choose-blues">Blues</button>
    </div>

    <div class="card">
      <button id="start-practice">Start Practice</button>
    </div>
  `;

  document.getElementById("choose-blues").onclick = () => {
    state.genre = "blues";
    alert("Blues selected");
  };

  document.getElementById("start-practice").onclick = renderPractice;
}

function renderPractice() {
  app.innerHTML = `
    <div class="card">
      <h2>Today's Practice</h2>
      <p>Genre: <strong>${state.genre}</strong></p>
      <p>Session generator coming next.</p>
      <button class="secondary" id="back-home">Back</button>
    </div>
  `;

  document.getElementById("back-home").onclick = renderHome;
}

// boot
renderHome();
