class Message {
    constructor({ text, onComplete }) {
        this.text = text
        this.onComplete = onComplete
        this.element = null
    }

    createElement() {
        // Create element
        this.element = document.createElement("div")
        this.element.classList.add("message-box")

        this.element.innerHTML = (`
            <p>${this.text}</p>
            <button>Next &#127769;</button>
        `)

        this.element.querySelector("button").addEventListener("click", () => {
            // Close message box
            this.done()
        })
    }

    done() {
        this.element.remove()
        this.onComplete()
    }

    init(container) {
        this.createElement()
        container.appendChild(this.element)
    }
}