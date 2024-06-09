class PauseMenu {
    constructor({onComplete}) {
        this.onComplete = onComplete
    }

    getOptions(screenKey) {
        if (screenKey === "root") {
            return [
                // All of our fighters (dynamic)
                {
                    label: "Save",
                    description: "Save your game.",
                    handler: () => {
                        // TODO
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
        return []
    }

    createElement() {
        this.element = document.createElement("div");
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