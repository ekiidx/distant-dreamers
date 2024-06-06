window.FighterTypes = {
  normal: "normal",
  spicy: "fire",
  veggie: "ice",
  fungi: "lightning",
}

window.Fighters = {
  "p01": {
    name: "Vash",
    type: FighterTypes.normal,
    src: "/images/characters/",
    icon: "/images/icons/spicy.png",
    actions: [ "fear", "regen", "strike" ]
  },
  "e001": {
    name: "Enemy",
    type: FighterTypes.normal,
    src: "/",
    icon: "/images/icons/veggie.png",
    actions: [ "strike" ]
  }
}