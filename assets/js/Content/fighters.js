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
    src: "assets/images/characters/vash_battle.png",
    icon: "assets/images/characters/hero.png",
    actions: [ "strike", "fear", "regen" ]
  },
  "e001": {
    name: "Enemy",
    description: "A normal enemy.",
    type: FighterTypes.normal,
    src: "assets/images/characters/enemy_battle.png",
    icon: "assets/images/characters/enemy_battle.png",
    actions: [ "strike" ]
  },
  "b001": {
    name: "RedBoss",
    description: "The Red Boss.",
    type: FighterTypes.fire,
    src: "assets/images/characters/boss_battle.png",
    icon: "assets/images/characters/boss_battle.png",
    actions: [ "strike" ]
  }
}