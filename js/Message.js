class Message {
    constructor({ text, onComplete }) {
        this.text = text;
        this.onComplete = onComplete;
        this.element = null;
    }

    createElement() {
        // Create element
        this.element = document.createElement("div");
        this.element.classList.add("message-box");

        this.element.innerHTML = (`
            <p class="text-message"></p>
            <button>Next &#127769;</button>
        `)

        // Init typewriter effect
        this.typewriterText = new Typewriter({
            element: this.element.querySelector(".text-message"),
            text: this.text
        })

        this.element.querySelector("button").addEventListener("click", () => {
            // Close message box
            this.done();
        })

        this.actionListener = new KeyPressListener("Enter", () => {
            // Close message box with Enter key
            this.done();
        })
    }

    done() {
        // If typwriterText is done remove and unbind element
        if (this.typewriterText.isDone) {
            window.sfx.typewriterConfirm.play();
            this.element.remove();
            this.actionListener.unbind();
            this.onComplete();
        } else {
            // If not warp typewriterText to the end.
            this.typewriterText.warpToDone();
        }
    }

    init(container) {
        this.createElement();
        container.appendChild(this.element);
        this.typewriterText.init();
    }
}