class PauseMenu {
    constructor({save, onComplete}) {
        this.save = save;
        this.onComplete = onComplete;
        this.items = window.playerState.items;
    }

    getOptions(screenKey) {
        // Show the first page of options
        if (screenKey === "root") {
            const lineupFighters = playerState.lineup.map(id => {
               
                const {fighterId} = playerState.fighters[id];
                const base = Fighters[fighterId];
                
                return {
                    label: base.name,
                    description: base.description,
                    handler: () => {
                        // this.keyboardMenu.setOptions( this.getOptions(id) )
                        this.keyboardMenu.setOptions( this.getOptions("status") )
                    }
                }
            })        
        
            return [
                // show lineup of fighters
                ...lineupFighters,
                {
                    label: "Items",
                    description: "Check inventory.",
                    handler: () => {
                        this.keyboardMenu.setOptions( this.getOptions("items") )
                    }
                },
                {
                    label: "Equipment",
                    description: "Equip items.",
                    handler: () => {
                        this.keyboardMenu.setOptions( this.getOptions("equip") )
                    }
                },
                {
                    label: "Save",
                    description: "Save your game.",
                    handler: () => {
                        this.save.save();
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
                            this.menuSubmit(action, item.instanceId)
                        }
                    }
                }),

                {
                    label: "Back",
                    description: "Go Back.",
                    handler: () => {
                        this.keyboardMenu.setOptions( this.getOptions("root") );
                    }
                }
            ]
        }

        if (screenKey === "equip") {
            return [
                {
                    label: "Test",
                    description: "Test",
                    handler: () => {
                        //
                    }
                },
                {
                    label: "Back",
                    description: "Go Back.",
                    handler: () => {
                        this.keyboardMenu.setOptions( this.getOptions("root") );
                    }
                }
            ]
        }

        if (screenKey === "status") {
            return [
                {
                    label: "Stats",
                    description: "This will be character info.",
                    handler: () => {
                        //
                    }
                },
                {
                    label: "Back",
                    description: "Go Back.",
                    handler: () => {
                        this.keyboardMenu.setOptions( this.getOptions("root") );
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
        this.element.innerHTML = (`
          <h2>Menu</h2>
        `)
    }

    close() {
        this.esc?.unbind();
        this.keyboardMenu.end();
        this.element.remove();
        this.onComplete();
    }

    menuSubmit(action, instanceId = null) {
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
            this.keyboardMenu.setOptions( this.getOptions("items") );
        }
    }

    async init(container) {

        console.log(this.items);
        this.createElement();
        this.keyboardMenu = new KeyboardMenu({
            descriptionContainer: container
        })
        this.keyboardMenu.init(this.element);
        this.keyboardMenu.setOptions(this.getOptions("root"));

        container.appendChild(this.element);

        utils.wait(200);
        this.esc = new KeyPressListener("Escape", () => {
          this.close();
        })
    }
}