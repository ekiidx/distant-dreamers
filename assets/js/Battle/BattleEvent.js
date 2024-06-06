class BattleEvent {
    constructor(event, battle) {
        this.event = event
        this.battle = battle
    }

    textMessage(resolve) {
        
        const text = this.event.text
        .replace("{CASTER}", this.event.caster?.name)
        .replace("{TARGET}", this.event.target?.name)
        .replace("{ACTION}", this.event.action?.name)
    
        const message = new Message({
          text,
          onComplete: () => {
            resolve()
          }
        })
        message.init( this.battle.element )
      }
    
      async stateChange(resolve) {
        const {caster, target, damage} = this.event
        if (damage) {
          //modify the target to have less HP
          target.update({
            hp: target.hp - damage
          })
          
          //start blinking
          target.fighterElement.classList.add("battle-damage-blink");
        }
    
        //Wait a little bit
        await utils.wait(600)
    
        //stop blinking
        target.fighterElement.classList.remove("battle-damage-blink");
        resolve();
      }

    battleMenu(resolve) {
        const menu = new BattleMenu({
            caster: this.event.caster,
            enemy: this.event.enemy,
            onComplete: submission => {
                // { what to use, who to use it on }
                resolve(submission)
            }
        })
        menu.init( this.battle.element)
    }

    animation(resolve) {
        const fn = BattleAnimations[this.event.animation]
        fn(this.event, resolve)
      }

    init(resolve) {
        this[this.event.type](resolve)
    }
}