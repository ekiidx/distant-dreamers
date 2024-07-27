window.FighterTypes = {
  normal: "normal",
  spicy: "fire",
  veggie: "ice",
  fungi: "lightning",
}

window.Fighters = {
  "p01": {
    name: "Vash",
    description: "Hero of the game.",
    type: FighterTypes.normal,
    src: "assets/images/characters/vash_battle.png",
    icon: "assets/images/characters/hero.png",
    actions: [ "strike", "fear", "regen" ]
  },
  "e001": {
    name: "Enemy",
    description: "Enemy of the game.",
    type: FighterTypes.normal,
    src: "assets/images/characters/enemy_battle.png",
    icon: "assets/images/characters/enemy_battle.png",
    actions: [ "strike" ]
  }
}