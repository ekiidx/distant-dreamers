class Hud {
    constructor() {
        this.scoreboards = [];
    }

    update() {
        this.scoreboards.forEach(s => {
            s.update(window.playerState.fighters[s.id])
        })
    }

    createElement() {
        if (this.element) {
            this.element.remove();
            this.scoreboards = [];
        }

        this.element = document.createElement("div");
        this.element.classList.add("hud");

        const {playerState} = window;

        playerState.lineup.forEach(key => {
            const fighter = playerState.fighters[key];
            const scoreboard = new Enemy({
                id: key,
                // grab fighter from the fighter list
                ...Fighters[fighter.fighterId],
                // gives us HP / XP ..etc
                ...fighter,
            }, null)
                scoreboard.createElement();
                this.scoreboards.push(scoreboard);
                this.element.appendChild(scoreboard.hudElement);
        })
    this.update();
    }
    
    init(container) {
        this.createElement();
        container.appendChild(this.element);

        // After battle PlayerStateUpdated is changed
        document.addEventListener("PlayerStateUpdated", () => {
            this.update();
        })

        document.addEventListener("LineupChanged", () => {
            this.createElement();
            container.appendChild(this.element);
        })
    }
}