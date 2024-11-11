window.FighterTypes = {
  normal: "normal",
  fire: "fire",
  ice: "ice",
  lightning: "lightning",
}

window.Fighters = {
  "p01": {
    name: "Vash",
    description: "Hero of the game.",
    type: FighterTypes.normal,
    src: "assets/img/characters/vash_battle.png",
    icon: "assets/img/characters/penny.png",
    actions: [ "strike", "fear", "regen" ]
  },
  "e001": {
    name: "Sage",
    description: "A normal enemy.",
    type: FighterTypes.normal,
    src: "assets/img/characters/enemy_battle.png",
    icon: "assets/img/characters/enemy_battle.png",
    actions: [ "strike" ]
  },
  "b001": {
    name: "RedBoss",
    description: "The Red Boss.",
    type: FighterTypes.fire,
    src: "assets/img/characters/boss_battle.png",
    icon: "assets/img/characters/boss_battle.png",
    actions: [ "strike" ]
  }
}

// base stats * level + equipment 