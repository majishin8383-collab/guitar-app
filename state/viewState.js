// state/viewState.js
// Local view routing stored in state.view (keeps app.js unchanged)

export function getView(state) {
  const v = state && typeof state.view === "string" ? state.view : "home";
  return v || "home";
}

export function setView(ctx, viewName) {
  ctx.state.view = viewName;
  ctx.persist();
}
