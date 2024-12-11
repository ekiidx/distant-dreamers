class HudMenu {
    constructor() {
        this.scoreboards = [];
        this.weaponsEquipped = window.playerState.fighters["p1"].weapon;
        this.mapName = window.WorldMaps[window.playerState.map].name;
        this.statusMenu = document.getElementsByClassName("status-menu")[0];
        this.hudMenu = document.getElementsByClassName("hud-menu")[0];
        this.weaponMenu = document.getElementsByClassName("weapon-menu")[0];
        this.locationMenu = document.getElementsByClassName("location-menu")[0];
    }

    update() {
        this.scoreboards.forEach(s => {
            s.update(window.playerState.fighters[s.id])
        });
    }

    updateWeapon() {
        this.weaponSpan.remove();
        this.createWeaponHud();
        this.weaponMenu.appendChild(this.weaponSpan);
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
        this.weaponSpan = document.createElement("span");
        this.weaponSpan.classList.add("weapon-name");
        this.weaponSpan.innerHTML = window.Weapons[this.weaponsEquipped[0].weaponId].name;
    }

    createLocationHud() {
        this.locationSpan = document.createElement("span");
        this.locationSpan.classList.add("location-name");
        this.locationSpan.innerHTML = this.mapName;
    }
    
    init(container) {
        this.createElement();
        this.hudMenu.appendChild(this.element);

        this.createWeaponHud();
        this.weaponMenu.appendChild(this.weaponSpan);

        this.createLocationHud();
        this.locationMenu.appendChild(this.locationSpan);

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