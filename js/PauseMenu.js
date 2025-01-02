class PauseMenu {
    constructor({save, onComplete}) {
        this.save = save;
        this.onComplete = onComplete;
        this.items = window.playerState.items;
        this.weaponsInventory = window.playerState.weaponsInventory;
        this.weaponsEquipped = window.playerState.fighters["p1"].weapon;
    }

    getOptions(screenKey) {
        // Show the first page of options
        if (screenKey === "root") {
            return [
                {
                    label: "Status",
                    description: "Check Status.",
                    handler: () => {
                        this.keyboardMenu.setOptions( this.getOptions("status") )
                        window.sfx.select.play();
                    }
                },
                {
                    label: "Items",
                    description: "Check inventory.",
                    handler: () => {
                        this.keyboardMenu.setOptions( this.getOptions("items") )
                        window.sfx.select.play();
                    }
                },
                {
                    label: "Weapons",
                    description: "Weapon inventory.",
                    handler: () => {
                        this.keyboardMenu.setOptions( this.getOptions("weapons") )
                        window.sfx.select.play();
                    }
                },
                {
                    label: "Save",
                    description: "Save your game.",
                    handler: () => {
                        this.save.save();
                        window.sfx.bells.play();
                        this.close();
                    }
                },
                {
                    label: "Close",
                    description: "Close the menu.",
                    handler: () => {
                        this.close();
                    }
                }
            ]
        }

        if (screenKey === "items") {
            let quantityMap = {};
            this.items.forEach(item => {

                let existing = quantityMap[item.actionId];
                if (existing) {
                    existing.quantity += 1;
                } else {
                    quantityMap[item.actionId] = {
                        actionId: item.actionId,
                        quantity: 1,
                        instanceId: item.instanceId,
                    }
                }
            })
            const items = Object.values(quantityMap);

            return [
                ...items.map(item => {
                    const action = Actions[item.actionId];
                    return {
                        label: action.name,
                        description: action.description,
                        right: () => {
                            return "x" + item.quantity;
                        },
                        handler: () => {
                            this.menuSubmit(action, item.instanceId);
                        }
                    }
                }),
                {
                    label: "Back",
                    description: "Go Back.",
                    handler: () => {
                        this.keyboardMenu.setOptions( this.getOptions("root") );
                        window.sfx.select.play();
                    }
                }
            ]
        }

        if (screenKey === "weapons") {
            return [
                ...this.weaponsInventory.map(item => {
                    const weapon = Weapons[item.weaponId];
                    const weaponInstanceId = item.instanceId
                    return {
                        label: weapon.name,
                        description: weapon.description,
                        right: () => {
                            if( weaponInstanceId === this.weaponsEquipped[0].instanceId) {
                                return "(equipped)";
                            } else {
                                return "";
                            }
                        },
                        handler: () => {
                            this.weaponSubmit(item);
                        }
                    }
               }),
                {
                    label: "Back",
                    description: "Go Back.",
                    handler: () => {
                        this.keyboardMenu.setOptions( this.getOptions("root") );
                        window.sfx.select.play();
                    }
                }
            ]
        }

        if (screenKey === "status") {
             // show lineup of fighters
            const lineupFighters = playerState.lineup.map(id => {
                const {fighterId} = playerState.fighters[id];
                const base = Fighters[fighterId];
                
                return {
                    label: base.name,
                    description: base.description,
                    handler: () => {
                        this.keyboardMenu.setOptions( this.getOptions(base.name) )
                    }
                }
            })        
            return [
                ...lineupFighters,
                {
                    label: "Back",
                    description: "Go Back.",
                    handler: () => {
                        this.keyboardMenu.setOptions( this.getOptions("root") );
                        window.sfx.select.play();
                    }
                }
            ]
        }

        if (screenKey === "Vash") {
            const fighter = playerState.fighters["p1"]
            return [
                {
                    label: "Level: " + fighter.level,
                    description: "Player Level",
                    handler: () => {
                        this.keyboardMenu.setOptions( this.getOptions("Vash") );
                        window.sfx.select.play();
                    }
                },
                {
                    label: "HP: " + fighter.hp + "/ " + fighter.maxHp,
                    description: "Player Health",
                    handler: () => {
                        this.keyboardMenu.setOptions( this.getOptions("Vash") );
                        window.sfx.select.play();
                    }
                },
                {
                    label: "XP: " + fighter.xp,
                    description: "Player Experience",
                    handler: () => {
                        this.keyboardMenu.setOptions( this.getOptions("Vash") );
                        window.sfx.select.play();
                    }
                },
                {
                    label: "Strength: " + fighter.strength,
                    description: "Player Strength",
                    handler: () => {
                        this.keyboardMenu.setOptions( this.getOptions("Vash") );
                        window.sfx.select.play();
                    }
                },
                {
                    label: "Defense: " + fighter.defense,
                    description: "Player Defense",
                    handler: () => {
                        this.keyboardMenu.setOptions( this.getOptions("Vash") );
                        window.sfx.select.play();
                    }
                },
                {
                    label: "Back",
                    description: "Go Back.",
                    handler: () => {
                        this.keyboardMenu.setOptions( this.getOptions("root") );
                        window.sfx.select.play();
                    }
                }
            ]
        }

        // // Show the options for just one fighter (by id)
        // const unequipped = Object.keys(playerState.fighters).filter(id => {
        //     // -1 means it's not in the array
        //     return playerState.lineup.indexOf(id) === -1;
        // }).map(id => {
        //     const {fighterId} = playerState.fighters[id];
        //     const base = Fighters[fighterId];
        //     return {
        //         label: `Swap for ${base.name}`,
        //         description: base.description,
        //         handler: () => {
        //             playerState.swapLineup(screenKey, id)
        //             this.keyboardMenu.setOptions( this.getOptions("root") );
        //         }
        //     }
        // })

        // return [
        //     ...unequipped,
        //     {
        //         label: "Move to front",
        //         description: "Move this fighter to the front of the list.",
        //         handler: () => {
        //             playerState.moveToFront(screenKey);
        //             this.keyboardMenu.setOptions( this.getOptions("root") );
        //         }
        //     },
        //     {
        //         label: "Back",
        //         description: "Go Back.",
        //         handler: () => {
        //             this.keyboardMenu.setOptions( this.getOptions("root") );
        //         }
        //     }
        // ];
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("pause-menu");
        // this.element.innerHTML = (`
        //         <h2>Menu</h2>
        // `);

        this.flexMenu = document.createElement("div");
        this.flexMenu.classList.add("flex-menu");

        this.statusMenu = document.createElement("div");
        this.statusMenu.classList.add("status-menu");

        this.hudMenu = document.createElement("div");
        this.hudMenu.classList.add("hud-menu");

        this.weaponMenu = document.createElement("div");
        this.weaponMenu.classList.add("weapon-menu");

        this.locationMenu = document.createElement("div");
        this.locationMenu.classList.add("location-menu");
    }

    close() {
        this.esc?.unbind();
        this.keyboardMenu.end();
        this.element.remove();
        this.hud.element.remove();
        this.onComplete();
    }

    menuSubmit(action, instanceId = null) {
        window.sfx.button.play();
        let character = playerState.fighters["p1"];
        let characterHp = character["hp"];

        if (character["hp"] !== character["maxHp"]) {
            let newHp = characterHp + 30;

            if (newHp > character["maxHp"]) {
                newHp = character["maxHp"];
            }
            character["hp"] = newHp;

            for (let i = 0; i < this.items.length; i++) {
                if(this.items[i].instanceId == instanceId ){
                    this.items.splice(i, 1);
                    break;
                }
            }
            window.sfx.regen.play();
            this.hud.update();
            this.keyboardMenu.setOptions( this.getOptions("items") );
        }
    }

    weaponSubmit(weaponsInventoryItem) {
        this.weaponsEquipped.splice(0, 1);
        this.weaponsEquipped.push(weaponsInventoryItem);

        this.hud.updateWeapon(this.weaponSpan);
        // this.hud.update(this.node);
        this.keyboardMenu.setOptions(this.getOptions("weapons"));
        window.sfx.weapon_equip.play();
    }

    async init(container) {
        this.createElement();

        // this attaches pause-menu to the main game container
        container.appendChild(this.element);

        // Attach Flex menu to pause-menu div
        this.element.appendChild(this.flexMenu);

        // Creates new keyboard menu instance 
        this.keyboardMenu = new KeyboardMenu({
            descriptionContainer: container
        })

        // This is where keyboardMenu attaches to pause-menu
        this.keyboardMenu.init(this.flexMenu);
        this.keyboardMenu.setOptions(this.getOptions("root"));

        // This attached status menu to flex menu
        this.flexMenu.appendChild(this.statusMenu);

        this.statusMenu.appendChild(this.hudMenu);
        this.statusMenu.appendChild(this.weaponMenu);
        this.statusMenu.appendChild(this.locationMenu);

        // Fire the hud
        this.hud = new HudMenu();
        this.hud.init(this.hudMenu);

        utils.wait(200);
        this.esc = new KeyPressListener("Escape", () => {
            this.close();
        })
    }
}