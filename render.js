/* Empire Reigns — game.economy.js
   Build: ER-20260109d2d
   Purpose: economy math + gates + streak/golden logic (NO DOM binding)
*/
(() => {
  const ER = (window.ER = window.ER || {});
  const S = ER.state;
  const U = ER.util;

  // ---------------------------
  // Milestones API wrapper (safe)
  // ---------------------------
  const MS = (() => {
    const api = window.ER_MILESTONES || null;
    return {
      exists: !!api,
      load: () => { try { api?.load?.(); } catch {} },
      tick: (state, hooks) => { try { api?.tick?.(state, hooks); } catch {} },
      bonuses: () => {
        try { return api?.getBonuses?.() || { globalMult:1, buildingMult:1, streakHold:1 }; }
        catch { return { globalMult:1, buildingMult:1, streakHold:1 }; }
      },
      list: () => {
        try { return api?.getList?.() || []; }
        catch { return []; }
      },
      progressFor: (id, state) => {
        try { return api?.progressFor?.(id, state) ?? 0; }
        catch { return 0; }
      }
    };
  })();

  ER.ms = MS;

  // ---------------------------
  // Upgrade B: Buildings (authoritative)
  // ---------------------------
  const BUILDINGS = {
    office:    { name:"Office",    gate: null,                    baseCost: 50,  costGrow: 1.35, incomePerLevel: 0.40 },
    warehouse: { name:"Warehouse", gate: { b:"office",   lv:2 },  baseCost: 120, costGrow: 1.38, incomePerLevel: 0.85 },
    workshop:  { name:"Workshop",  gate: { b:"warehouse",lv:2 },  baseCost: 280, costGrow: 1.42, incomePerLevel: 1.70 },
    market:    { name:"Market",    gate: { b:"workshop", lv:2 },  baseCost: 650, costGrow: 1.46, incomePerLevel: 3.40 },
  };

  ER.BUILDINGS = BUILDINGS;

  // ---------------------------
  // Gates for upgrades
  // ---------------------------
  const unlockedTools = () => (S.owned.assistant || 0) >= 1;
  const unlockedProc  = () => (S.owned.tools || 0) >= 1;
  const unlockedAuto  = () => (S.owned.proc || 0) >= 1;

  // ---------------------------
  // Multipliers
  // ---------------------------
  function opsMultiplier(){
    const toolsMult = Math.pow(1.25, S.owned.tools || 0);
    const procMult  = Math.pow(1.40, S.owned.proc  || 0);
    const autoMult  = Math.pow(2.00, S.owned.auto  || 0);
    return toolsMult * procMult * autoMult;
  }

  function prestigeMultiplier(){ return Math.pow(1.2, S.ep || 0); }

  function baseIncomePerSecond(){
    return (S.owned.assistant || 0) * 1.0;
  }

  function buildingIncomePerSecondRaw(){
    let total = 0;
    for (const k of Object.keys(BUILDINGS)){
      const lv = Math.max(1, S.bLvl[k] || 1);
      const def = BUILDINGS[k];
      const extra = Math.max(0, lv - 1);
      const baseTrickle = def.incomePerLevel * 0.25;
      total += baseTrickle + extra * def.incomePerLevel;
    }
    return total;
  }

  function incomePerSecond(){
    const b = MS.bonuses();
    const buildingsPart = buildingIncomePerSecondRaw() * (b.buildingMult || 1);
    const basePart = baseIncomePerSecond();
    const totalBase = basePart + buildingsPart;
    return totalBase * opsMultiplier() * prestigeMultiplier() * (b.globalMult || 1);
  }

  function buildingIncomeShown(){
    const b = MS.bonuses();
    return buildingIncomePerSecondRaw() * (b.buildingMult || 1);
  }

  // ---------------------------
  // Prestige
  // ---------------------------
  const PRESTIGE_GOAL = 10000;
  const canPrestige = () => (S.cash || 0) >= PRESTIGE_GOAL;

  function epGainIfPrestigeNow(){
    const le = Math.max(0, S.lifetimeEarned || 0) + 1;
    return Math.max(1, Math.floor(Math.log10(le)));
  }

  // ---------------------------
  // Offline progress
  // ---------------------------
  function applyOfflineProgress(){
    const now = Date.now();
    const secondsAway = (now - (S.lastTickMs || now)) / 1000;
    const capped = U.clamp(secondsAway, 0, 6*3600);
    const earned = incomePerSecond() * capped;
    if(earned > 0.01){
      S.cash += earned;
      S.lifetimeEarned += earned;
      U.setStatus(`Offline: +${U.money(earned)}`);
    } else {
      U.setStatus("Ready");
    }
    S.lastTickMs = now;
  }

  // ---------------------------
  // Upgrade B: Building leveling rules
  // ---------------------------
  function buildingGateLocked(key){
    const def = BUILDINGS[key];
    if (!def || !def.gate) return null;
    const need = def.gate;
    const cur = S.bLvl[need.b] || 1;
    if (cur >= need.lv) return null;
    return `${BUILDINGS[need.b].name} LV${need.lv} required`;
  }

  function buildingLevelIncomeDelta(key){
    return BUILDINGS[key].incomePerLevel;
  }

  function buildingLevelCost(key){
    return Math.max(1, Math.floor(S.bCost[key] || BUILDINGS[key].baseCost));
  }

  function bumpBuildingCost(key){
    const def = BUILDINGS[key];
    const cur = buildingLevelCost(key);
    S.bCost[key] = Math.ceil(cur * def.costGrow);
  }

  // ---------------------------
  // Upgrade A: Streak + Golden
  // (Effects are returned; UI/Main decides SFX + FX)
  // ---------------------------
  const STREAK_WINDOW_MS_BASE = 1300;
  const STREAK_MAX = 45;
  const STREAK_STEP = 0.025;
  const STREAK_MAX_MULT = 2.50;

  function streakWindowMs(){
    const b = MS.bonuses();
    return STREAK_WINDOW_MS_BASE * (b.streakHold || 1);
  }

  function updateStreak(nowMs){
    const dt = nowMs - (S.lastWorkMs || 0);
    const win = streakWindowMs();
    if (dt <= win) S.streakCount = Math.min(STREAK_MAX, (S.streakCount||0) + 1);
    else S.streakCount = 1;

    S.lastWorkMs = nowMs;

    const m = 1 + STREAK_STEP * Math.max(0, S.streakCount - 1);
    S.streakMult = U.clamp(m, 1.0, STREAK_MAX_MULT);

    S.goldenHeat = U.clamp((S.goldenHeat||0) + 0.08 + (S.streakCount * 0.004), 0, 1.0);

    return { streakCount: S.streakCount, streakMult: S.streakMult, goldenHeat: S.goldenHeat };
  }

  function decayStreak(nowMs){
    const win = streakWindowMs();
    const dt = nowMs - (S.lastWorkMs || 0);
    if (S.streakCount > 0 && dt > win){
      const over = dt - win;
      const drop = Math.floor(over / 550);
      if (drop > 0){
        S.streakCount = Math.max(0, S.streakCount - drop);
        const m = 1 + STREAK_STEP * Math.max(0, S.streakCount - 1);
        S.streakMult = U.clamp(m, 1.0, STREAK_MAX_MULT);
        S.goldenHeat = U.clamp((S.goldenHeat||0) - 0.10 * drop, 0, 1.0);
        if (S.streakCount === 0){
          S.streakMult = 1.0;
          S.goldenHeat = 0;
        }
      }
    }
    return { streakCount: S.streakCount, streakMult: S.streakMult, goldenHeat: S.goldenHeat };
  }

  function goldenChance(){
    const base = 0.012;
    const streakBoost = 0.010 * Math.min(1, (S.streakCount||0) / 20);
    const heatBoost = 0.018 * (S.goldenHeat || 0);
    const cooldownOk = (Date.now() - (S.lastGoldenMs||0)) > 1600;
    const raw = base + streakBoost + heatBoost;
    return cooldownOk ? U.clamp(raw, 0.012, 0.040) : 0;
  }

  // Returns payout amount (0 if none). Caller provides optional callback for FX.
  function tryGoldenPayout(baseAmount, x, y, onGold){
    const p = goldenChance();
    if (Math.random() > p) return 0;

    const streakFactor = 1.0 + (S.streakCount || 0) * 0.06;
    const econFactor = 1.0 + Math.min(2.0, incomePerSecond() / 40);
    const payout = baseAmount * (6 + Math.random()*6) * streakFactor * econFactor;

    S.cash += payout;
    S.lifetimeEarned += payout;
    S.lastGoldenMs = Date.now();
    S.goldenHeat = 0;

    if (typeof onGold === "function") {
      try { onGold({ payout, x, y }); } catch {}
    }

    return payout;
  }

  // ---------------------------
  // Shared buy helper (pure, no UI)
  // ---------------------------
  function canAfford(cost){ return (S.cash||0) >= cost; }

  function spend(cost){
    if (!canAfford(cost)) return false;
    S.cash -= cost;
    return true;
  }

  ER.econ = {
    // gates
    unlockedTools, unlockedProc, unlockedAuto,

    // multipliers
    opsMultiplier, prestigeMultiplier,

    // income
    baseIncomePerSecond,
    buildingIncomePerSecondRaw,
    incomePerSecond,
    buildingIncomeShown,

    // prestige
    PRESTIGE_GOAL,
    canPrestige,
    epGainIfPrestigeNow,

    // offline
    applyOfflineProgress,

    // buildings
    buildingGateLocked,
    buildingLevelIncomeDelta,
    buildingLevelCost,
    bumpBuildingCost,

    // streak/golden
    streakWindowMs,
    updateStreak,
    decayStreak,
    goldenChance,
    tryGoldenPayout,

    // spending
    canAfford,
    spend
  };
})();
