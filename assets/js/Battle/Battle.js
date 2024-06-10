class Battle {
    constructor({ enemy, onComplete }) {

        this.enemy = enemy;
        this.onComplete = onComplete;

        this.combatants = {
            // "player1": new Enemy({
            //     ...Fighters.p01,
            //     team: "player",
            //     hp: 50,
            //     maxHp: 50,
            //     xp: 95,
            //     maxXp: 100,
            //     level: 1,
            //     status: { type: "regen"},
            //     isPlayerControlled: true
            // }, this),
            // "enemy1": new Enemy({
            //     ...Fighters.e001,
            //     team: "enemy",
            //     hp: 1,
            //     maxHp: 50,
            //     xp: 20,
            //     maxXp: 100,
            //     level: 1,
            //     status: null,
            //   }, this)
        }

        this.activeCombatants = {
            player: null, // Player
            enemy: null, // Enemy
        }

        // Add player team
        window.playerState.lineup.forEach(id => {
            this.addCombatant(id, "player", window.playerState.fighters[id])
        });
        // Add enemy team
        Object.keys(this.enemy.fighters).forEach(key => {
            this.addCombatant("e_"+key, "enemy", this.enemy.fighters[key])
        });

        // Start empty
        this.items = [
            // { actionId: "item_recoverStatus", instanceId: "p1", team: "player" },
            // { actionId: "item_recoverStatus", instanceId: "p2", team: "player" },
            // { actionId: "item_recoverStatus", instanceId: "p3", team: "enemy" },
            // {actionId: "item_recoverHp", instanceId: "p4", team: "player" }
        ]

        //Add in player items
        window.playerState.items.forEach(item => {
            this.items.push({
            ...item,
            team: "player"
            })
        })
  
      this.usedInstanceIds = {};
    }

    addCombatant(id, team, config) {
            this.combatants[id] = new Enemy({
                // Add base fighter
                ...Fighters[config.fighterId],
                // state override
                ...config,
                team,
                isPlayerControlled: team === "player"
            }, this)

            // Populate first active fighter
            this.activeCombatants[team] = this.activeCombatants[team] || id
    }

    createElement() {
        this.element = document.createElement("div")
        this.element.classList.add("battle")
        // this.element.innerHTML = (`
        //     <div class="battle-hero">
        //         <img src="${'assets/images/characters/hero.png'}">
        //     </div>
        //     <div class="battle-enemy">
        //         <img src="${this.enemy.src}" alt="${this.enemy.name}">
        //     </div>
        // `)
    }

    init(container) {
        this.createElement();
        container.appendChild(this.element);

        Object.keys(this.combatants).forEach(key => {
            let combatant = this.combatants[key];
            combatant.id = key;
            combatant.init(this.element)
        })

        this.turnCycle = new TurnCycle({
            battle: this,
            onNewEvent: event => {
                return new Promise(resolve => {
                    const battleEvent = new BattleEvent(event, this)
                    battleEvent.init(resolve);
                })
            },
            onWinner: winner => {

                if (winner === "player") {
                    const playerState = window.playerState;
                    Object.keys(playerState.fighters).forEach(id => {
                        const playerStateFighter = playerState.fighters[id];
                        const combatant = this.combatants[id];
                        if (combatant) {
                            playerStateFighter.hp = combatant.hp;
                            playerStateFighter.xp = combatant.xp;
                            playerStateFighter.maxXp = combatant.maxXp;
                            playerStateFighter.level = combatant.level;
                        }
                    })

                    // Get rid of player items
                    playerState.items = playerState.items.filter(item => {
                        return !this.usedInstanceIds[item.instanceId]
                    })

                    //Send signal to update
                    // utils.emitEvent("PlayerStateUpdated");
                } 
                this.element.remove();
                this.onComplete(winner === "player");
            }
        })
        this.turnCycle.init();
    }
}