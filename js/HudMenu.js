class HudMenu {
    constructor() {
        this.scoreboards = [];
        this.weaponsEquipped = window.playerState.weaponsEquipped;
    }

    update() {
        this.scoreboards.forEach(s => {
            s.update(window.playerState.fighters[s.id])
        });
    }

    updateWeapon(container) {
        this.weaponHud.remove();
        this.createWeaponHud();
        container.appendChild(this.weaponHud);
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

    createWeaponHud() {
        // if (this.weaponHud) {
        //     this.weaponHud.remove();
        // }
        // Create Weapon Hud
        this.weaponHud = document.createElement("span");
        this.weaponHud.classList.add("weapon-name");
        this.weaponHud.innerHTML = window.Weapons[this.weaponsEquipped[0].weaponId].name || "";
    }
    
    init(container) {
        this.createElement();
        container.appendChild(this.element);

        this.createWeaponHud();
        container.appendChild(this.weaponHud);

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