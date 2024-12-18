class SceneTransition {
    constructor() {
        this.element = null;
    }
    // adds div with .transition class onto .game-container
    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("transition");
    }

    fadeOut() {
        this.element.classList.add("fade-out");
        // animationend is a native method
        this.element.addEventListener("animationend", () => {
            this.element.remove();
        }, { once: true })
    }

    battleTransition(container) {
        this.createElement();
        container.appendChild(this.element);
    }

    init(container, callback) {
        this.createElement();
        container.appendChild(this.element);

        this.element.addEventListener("animationend", () => {
            callback();
        }, { once: true })
    }
}