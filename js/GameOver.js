class GameOver {
    constructor({onComplete, save, map}) {
        this.onComplete = onComplete;
        this.save = save;
        this.map = map;
    }

    getOptions(resolve) {
      const saveFile = this.save.getSaveFile();
      return [
        saveFile ? { 
          label: "Try Again",
          description: "",
          handler: () => {
            this.close();
            window.sfx.gameOver.stop();
            const sceneTransition = new SceneTransition();
            sceneTransition.init(document.querySelector(".game-container"));
            setTimeout(sceneTransition.fadeOut(), 1000);
            window.sfx.bells.play();
            window.sfx.whoosh.play();
            resolve();
          }
        } : null
        // Filter out any value that isn't truthy
      ].filter(v => v);
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("title-screen");
        this.element.innerHTML = (`
          <img class="title-screen-logo" src="assets/img/distant-dreamers-logo.png" alt="Distant Dreamers" />
          <h2 class="game-over">GAME OVER</h2>
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