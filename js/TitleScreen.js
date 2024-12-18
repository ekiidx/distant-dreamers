class TitleScreen {
    constructor({ save }) {
      this.save = save;
    }
  
    getOptions(resolve) {
      const saveFile = this.save.getSaveFile();
      return [
        { 
          label: "New Game",
          description: "",
          handler: () => {
            this.close();
            window.sfx.title.stop();
            window.sfx.bells.volume(.3).play();
            window.sfx.whoosh.volume(.4).play();
            resolve();
          }
        },
        saveFile ? {
          label: "Continue Game",
          description: "",
          handler: () => {
            this.close();
            window.sfx.title.stop();
            const sceneTransition = new SceneTransition();
            sceneTransition.init(document.querySelector(".game-container"));
            setTimeout(sceneTransition.fadeOut(), 1000);
            resolve(saveFile);
          }
        } : null
        // Filter out any value that isn't truthy
      ].filter(v => v);
    }
  
    createElement() {
      this.background = document.createElement("div");
      this.background.classList.add("title-background");

      this.element = document.createElement("div");
      this.element.classList.add("title-screen");
      this.element.innerHTML = (`
        <img class="title-screen-logo" src="assets/img/distant-dreamers-logo.png" alt="Distant Dreamers" />
      `)
    }
  
    close() {
      this.keyboardMenu.end();
      this.element.remove();
    }
    
    init(container) {
      return new Promise(resolve => {
        this.createElement();
        this.element.appendChild(this.background);
        container.appendChild(this.element);
        this.keyboardMenu = new KeyboardMenu();
        this.keyboardMenu.init(this.element);
        this.keyboardMenu.setOptions(this.getOptions(resolve));
      })
    }
  }