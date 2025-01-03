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
            // (Damage Base * Weapon Damage) * (Caster Strength - Target Defense))
            let defenseModifier = caster.strength - target.defense;

            if (defenseModifier <= 0) {
                defenseModifier = 1;
            }
            let weaponModifier = damage * window.Weapons[caster.weapon[0].weaponId].damage;
         
            //modify the target to have less HP
            target.update({
                hp: target.hp - (weaponModifier * defenseModifier)
            })

            // console.log(caster.name + " damage base: " + damage);
            // console.log(caster.name + " weapon: " + (window.Weapons[caster.weapon[0].weaponId].damage));
            // console.log(caster.name + " str: " + caster.strength);
            // console.log(target.name + " def: " + target.defense);
            // console.log(caster.name + " weaponModifier: " + weaponModifier);
            // console.log(caster.name + " defenseModifier: " + defenseModifier);
            // console.log(caster.name + " damage total: " + (weaponModifier * defenseModifier));
            // console.log(target.name + " hp: " + target.hp + " / " + target.maxHp);

            //start blinking
            target.fighterElement.classList.add("battle-damage-blink");
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

                // Check if there's a level up
                if (combatant.xp === combatant.maxXp) {
                    combatant.xp = 0;
                    combatant.level += 1;
                    combatant.maxXp = 100 * combatant.level;
                    combatant.maxHp = combatant.maxHp * 1.2;
                    combatant.hp = combatant.maxHp;
                    combatant.strength += 1;
                    combatant.defense += 1;
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


// Level 1     HP: 100     EXP: 0          Str: 2       Def: 2
// Level 2     HP: 120     EXP: 50         Str: 3       Def: 3
// Level 3     HP: 150     EXP: 150        Str: 4       Def: 4
// Level 4     HP: 190     EXP: 300        Str: 5       Def: 5
// Level 5     HP: 210     EXP:            Str: 6       Def: 6
// Level 6     HP: 270     EXP:            Str: 7       Def: 7
// Level 7     HP: 340     EXP:            Str: 8       Def: 8
// Level 8     HP: 420     EXP: 500        Str: 9       Def: 9
// Level 9     HP: 510     EXP:            Str: 10      Def: 10
// Level 10    HP: 610     EXP:            Str: 11      Def: 11
// Level 11    HP: 720     EXP:            Str: 12      Def: 12
// Level 12    HP: 840     EXP:            Str: 13      Def: 13
// Level 13    HP: 970     EXP:            Str: 14      Def: 14
// Level 14    HP: 1110    EXP:            Str: 15      Def: 15
// Level 15    HP: 1260    EXP:            Str: 16      Def: 16
// Level 16    HP: 1420    EXP:            Str: 17      Def: 17
// Level 17    HP: 1590    EXP:            Str: 18      Def: 18
// Level 18    HP: 1770    EXP:            Str: 19      Def: 19
// Level 19    HP: 1960    EXP:            Str: 20      Def: 20
// Level 20    HP: 2160    EXP:            Str: 21      Def: 21
