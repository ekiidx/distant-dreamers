class TitleScreen {
    constructor({ save }) {
      this.save = save;
    }
  
    getOptions(resolve) {
      const safeFile = this.save.getSaveFile();
      return [
        { 
          label: "New Game",
          description: "Start a new adventure.",
          handler: () => {
            this.close();
            resolve();
          }
        },
        safeFile ? {
          label: "Continue Game",
          description: "Resume your adventure.",
          handler: () => {
            this.close();
            resolve(safeFile);
          }
        } : null
        // Filter out any value that isn't truthy
      ].filter(v => v);
    }
  
    createElement() {
      this.element = document.createElement("div");
      this.element.classList.add("title-screen");
      this.element.innerHTML = (`
        <img class="title-screen-logo" src="/assets/images/" alt="Distant Dreamers" />
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
        this.keyboardMenu = new KeyboardMenu();
        this.keyboardMenu.init(this.element);
        this.keyboardMenu.setOptions(this.getOptions(resolve));
      })
    }
  }