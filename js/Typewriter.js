class Typewriter {
    constructor(config) {
        this.element = config.element;
        this.text = config.text;
        this.speed = config.speed || 69;

        this.timeout = null;
        this.isDone = false;
    }

    revealOneCharacter(list) {
        const next = list.splice(0,1)[0];
        next.span.classList.add("revealed");

        if (list.length > 0) {
            this.timeout = setTimeout(() => {
                this.revealOneCharacter(list)
                if (list.length % 2 === 0) {
                    window.sfx.typewriter.play();
                }
            }, next.delayAfter)
        } else {
            this.IsDone = true;
        }
    }

    warpToDone() {
        clearTimeout(this.timeout);
        this.isDone = true;
        this.element.querySelectorAll("span").forEach(s => {
            s.classList.add("revealed");
        })
    }

    init() {
        let characters = [];
        this.text.split("").forEach(character => {

            // Make each letter into a span, at to element in DOM
            let span = document.createElement("span");
            span.textContent = character;
            this.element.appendChild(span);

            // Add this span to our internal state Array
            characters.push({
                span,
                delayAfter: character === " " ? 0 : this.speed
            })
        })

        this.revealOneCharacter(characters);
    }
}