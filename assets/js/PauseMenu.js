class PauseMenu {
    constructor({onComplete}) {
        this.onComplete = onComplete
    }

    getOptions(screenKey) {

        //Case 1: Show the first page of options
        if (screenKey === "root") {
            const lineupFighters = playerState.lineup.map(id => {
            const {fighterId} = playerState.fighters[id]
            const base = Fighters[fighterId]
            return {
                label: base.name,
                description: base.description,
                handler: () => {
                    this.keyboardMenu.setOptions( this.getOptions(id) )
                }
            }
            })
            return [
                ...lineupFighters,
                {
                    label: "Save",
                    description: "Save your game.",
                    handler: () => {
                        //TODO
                    }
                },
                {
                    label: "Close",
                    description: "Close the menu.",
                    handler: () => {
                        this.close()
                    }
                }
            ]
        }

        //Case 2: Show the options for just one fighter (by id)
        const unequipped = Object.keys(playerState.fighters).filter(id => {
            // -1 means it's not in the array
            return playerState.lineup.indexOf(id) === -1
        }).map(id => {
            const {fighterId} = playerState.fighters[id]
            const base = Fighters[fighterId]
            return {
                label: `Swap for ${base.name}`,
                description: base.description,
                handler: () => {
                    playerState.swapLineup(screenKey, id)
                    this.keyboardMenu.setOptions( this.getOptions("root") )
                }
            }
        })

        return [
            ...unequipped,
            {
            label: "Move to front",
            description: "Move this fighter to the front of the list.",
            handler: () => {
                playerState.moveToFront(screenKey);
                this.keyboardMenu.setOptions( this.getOptions("root") )
            }
            },
            {
            label: "Back",
            description: "Go Back.",
            handler: () => {
                this.keyboardMenu.setOptions( this.getOptions("root") )
            }
            }
        ];
        }

    createElement() {
        this.element = document.createElement("div")
        this.element.classList.add("pause-menu")
        this.element.innerHTML = (`
          <h2>Pause Menu</h2>
        `)
      }

    close() {
        this.esc?.unbind()
        this.keyboardMenu.end()
        this.element.remove()
        this.onComplete()
    }

    async init(container) {
        this.createElement()
        this.keyboardMenu = new KeyboardMenu({
            descriptionContainer: container
        })
        this.keyboardMenu.init(this.element);
        this.keyboardMenu.setOptions(this.getOptions("root"))

        container.appendChild(this.element)

        utils.wait(200)
        this.esc = new KeyPressListener("Escape", () => {
          this.close()
        })
    }
}