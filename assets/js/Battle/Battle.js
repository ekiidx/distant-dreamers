class Battle {
    constructor() {
        this.combatants = {
            "player1": new Enemy({
                ...Fighters.p01,
                team: "player",
                hp: 50,
                maxHp: 50,
                xp: 0,
                maxXp: 100,
                level: 1,
                status: null
            }, this),
            "enemy1": new Enemy({
                ...Fighters.e001,
                team: "enemy",
                hp: 20,
                maxHp: 50,
                xp: 20,
                maxXp: 100,
                level: 1,
                status: null,
              }, this)
        }
        this.activeCombatants = {
            player: "player1",
            enemy: "enemy1",
        }
    }

    createElement() {
        this.element = document.createElement("div")
        this.element.classList.add("battle")
        // this.element.innerHTML = (`
        //     <div class="battle-hero">
        //         <img src="${'assets/images/characters/hero.png'}">
        //     </div>
        //     <div class="battle-enemy">
        //         <img src="${'assets/images/characters/hero.png'}">
        //     </div>
        // `)
    }

    init(container) {
        this.createElement()
        container.appendChild(this.element)

        Object.keys(this.combatants).forEach(key => {
            let combatant = this.combatants[key]
            combatant.id = key
            combatant.init(this.element)
        })

        this.turnCycle = new TurnCycle({
            battle: this,
            onNewEvent: event => {
                return new Promise(resolve => {
                    const battleEvent = new BattleEvent(event, this)
                    battleEvent.init(resolve)
                })
            }
        })
        this.turnCycle.init()
    }
}