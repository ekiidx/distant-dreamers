class GameOver {
    constructor({onComplete}) {
        this.onComplete = onComplete;
    }

    getOptions(resolve) {
      return [
        { 
          label: "Try Again",
          description: "",
          handler: () => {
            this.close();
            resolve();
          }
        }
      ]
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("title-screen");
        this.element.innerHTML = (`
          <img class="title-screen-logo" src="assets/img/distant-dreamers-logo.png" alt="Distant Dreamers" />
          <h2 style="display: flex; justify-content: center; font-size: 12px; color: #ffffff;">GAME OVER</h2>
        `)
      }

      close() {
        this.keyboardMenu.end();
        this.element.remove();
        this.onComplete();
      }

    async init(container) {
      return new Promise(resolve => {
        this.createElement();
        container.appendChild(this.element);
        this.keyboardMenu = new KeyboardMenu();
        this.keyboardMenu.init(this.element);
        this.keyboardMenu.setOptions(this.getOptions(resolve));
      })
    }
}