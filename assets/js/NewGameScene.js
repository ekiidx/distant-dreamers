class NewGameScene {
  constructor() {
    // this.save = save;
    // this.onComplete = onComplete;

    this.text = "<p>This is a game I have been working on and off since 2013.</p>";
  }

  getOptions(resolve) {
    return [
      { 
        label: "Next",
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
      this.element.classList.add("new-game-scene");
      this.element.innerHTML = (`
        <p>${this.text}</p>
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