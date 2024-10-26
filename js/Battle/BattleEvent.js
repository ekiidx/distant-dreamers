class BattleEvent {
    constructor(event, battle) {
        this.event = event;
        this.battle = battle;
    }

    textMessage(resolve) {

        const text = this.event.text
            .replace("{CASTER}", this.event.caster?.name)
            .replace("{TARGET}", this.event.target?.name)
            .replace("{ACTION}", this.event.action?.name)

        const message = new Message({
            text,
            onComplete: () => {
                resolve();
            }
        })
        message.init(this.battle.element)
    }

    async stateChange(resolve) {
        const {
            caster,
            target,
            damage,
            recover,
            status,
            action
        } = this.event;
        let who = this.event.onCaster ? caster : target;

        // SFX actions
        if(action.sound === 'strike1') {
            window.sfx.strike1.play();
        }
        // if(action.sound === 'strike2') {
        //     window.sfx.strike2.play();
        // }
        if(action.sound === 'regen') {
            window.sfx.regen.play();
        }
        if(action.sound === 'fear') {
            window.sfx.fear.play();
        }

        if (damage) {
            //modify the target to have less HP
            target.update({
                hp: target.hp - (damage * caster.level)
                
            })
            //start blinking
            target.fighterElement.classList.add("battle-damage-blink");
            // window.sfx.strike1.play();
        }

        if (recover) {
            let newHp = who.hp + recover;
            if (newHp > who.maxHp) {
                newHp = who.maxHp;
            }
            who.update({
                hp: newHp * who.level
            })
        }

        if (status) {
            who.update({
                status: {
                    ...status
                }
            })
        }
        if (status === null) {
            who.update({
                status: null
            })
        }

        //Wait a little bit
        await utils.wait(600)
        //stop blinking after wait
        target.fighterElement.classList.remove("battle-damage-blink");
        resolve();
    }

    battleMenu(resolve) {
        const menu = new BattleMenu({
            caster: this.event.caster,
            enemy: this.event.enemy,
            items: this.battle.items,
            onComplete: submission => {
                // { what to use, who to use it on }
                resolve(submission)
            }
        })
        menu.init(this.battle.element)
    }

    giveXp(resolve) {
        let amount = this.event.xp;

        const {
            combatant
        } = this.event;
        const step = () => {

            if (!window.sfx.levelUpLoop.playing()) {
                window.sfx.levelUpLoop.play();
            }

            if (amount > 0) {
                amount -= 1;
                combatant.xp += 1;

                // Check if we've hit a level up
                if (combatant.xp === combatant.maxXp) {
                    combatant.xp = 0;
                    combatant.maxXp = 100;
                    combatant.level += 1;
                }

                combatant.update();
                requestAnimationFrame(step);
                return;
            }
            window.sfx.levelUpLoop.stop();
            window.sfx.levelUpLoopEnd.play();    
            resolve();
        }
        requestAnimationFrame(step);
    }

	// giveItems(resolve) {
	// 	let winningItem = combatant.itemsToGive;
	// 	resolve();
	// }

    animation(resolve) {
        const fn = BattleAnimations[this.event.animation];
        fn(this.event, resolve);
    }

    init(resolve) {
        this[this.event.type](resolve);
    }
}