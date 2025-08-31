// sw5e-helper-starter/scripts/main.js
import { API } from "./api.js";

const MODULE_ID = "sw5e-qol";

Hooks.once("init", () => {
  console.log(`${MODULE_ID} | init`);
});

Hooks.once("ready", () => {
  console.log(`${MODULE_ID} | ready`);
  const mod = game.modules.get(MODULE_ID);
  if (mod) mod.api = API;
});
