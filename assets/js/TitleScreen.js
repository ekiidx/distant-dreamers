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
            window.sfx.bells.volume(.6).play();
            window.sfx.whoosh.volume(.7).play();
            resolve();
          }
        },
        saveFile ? {
          label: "Continue Game",
          description: "",
          handler: () => {
            this.close();
            window.sfx.title.stop();
            window.sfx.bells.volume(.6).play();
            window.sfx.whoosh.volume(.7).play();
            resolve(saveFile);
          }
        } : null
        // Filter out any value that isn't truthy
      ].filter(v => v);
    }
  
    createElement() {
      this.element = document.createElement("div");
      this.element.classList.add("title-screen");
      this.element.innerHTML = (`
        <img class="title-screen-logo" src="assets/images/distant-dreamers-logo.png" alt="Distant Dreamers" />
      `)
    }
  
    close() {
      this.keyboardMenu.end();
      this.element.remove();
    }
    
    init(container) {
      return new Promise(resolve => {

        this.createElement();
        container.appendChild(this.element);
        window.sfx.title.volume(.8).play();
        this.keyboardMenu = new KeyboardMenu();
        this.keyboardMenu.init(this.element);
        this.keyboardMenu.setOptions(this.getOptions(resolve));
      })
    }
  }