class StartScreen {
    constructor({ container }) {
      this.container = container;
    }
  
    getOptions(resolve) {
      return [
        { 
          label: "Click To Play",
          description: "",
          handler: () => {
            this.close();
            window.sfx.title.play();
            // resolve();
            this.logoScreen(resolve);
          }
        }
      ].filter(v => v);
    }

    logoScreen(resolve) {
      this.logoScreen = document.createElement("div");
      this.logoScreen.classList.add("logo-screen");
      this.container.appendChild(this.logoScreen);
      this.logoScreen.innerHTML = (`
        <img class="lore-games-logo" src="assets/img/lore-games-logo.png" alt="Lore Games" />
      `)
      
      setTimeout(() => {
        this.logoScreen.remove();
        this.secondScreen(resolve)}
        , 5000);
    }

    secondScreen(resolve) {
      setTimeout(() => resolve(), 2000);
    }

    createElement() {
      this.element = document.createElement("div");
      this.element.classList.add("start-screen");
    }
  
    close() {
      this.keyboardMenu.end();
      this.element.remove();
    }
    
    init(container) {
      return new Promise(resolve => {
        this.container = container;
        this.createElement();
        container.appendChild(this.element);
        this.keyboardMenu = new KeyboardMenu();
        this.keyboardMenu.init(this.element);
        this.keyboardMenu.setOptions(this.getOptions(resolve));
      })
    }
  }