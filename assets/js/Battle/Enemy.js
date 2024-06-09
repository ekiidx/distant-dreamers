class Enemy {
    constructor(config, battle) {
        Object.keys(config).forEach(key => {
            this[key] = config[key]
        })
        // Use maxHp if no hp was passed through
        this.hp = typeof(this.hp) === "undefined" ? this.maxHp : this.hp
        this.battle = battle;
    }
    get hpPercent() {
        const percent = this.hp / this.maxHp * 100
        return percent > 0 ? percent : 0
    }
    
    get xpPercent() {
        return this.xp / this.maxXp * 100
    }
    
    get isActive() {
        return this.battle?.activeCombatants[this.team] === this.id
    }

    get givesXp() {
        return this.level * 20
    }
    
    createElement() {
        this.hudElement = document.createElement("div")
        this.hudElement.classList.add("enemy")
        this.hudElement.setAttribute("data-combatant", this.id)
        this.hudElement.setAttribute("data-team", this.team)
        this.hudElement.innerHTML = (`
            <p class="enemy-name">${this.name}</p>
            <p class="enemy-level"></p>
            <div class="enemy-crop">
                <img class="enemy-character" alt="${this.name}" src="${this.src}">
            </div>
            <img class="enemy-type" src="${this.icon}" alt="${this.type}">
            <svg viewBox="0 0 26 3" class="enemy-hp-container">
              <rect x=0 y=0 width="0%" height=1 fill="#82ff71" />
              <rect x=0 y=1 width="0%" height=2 fill="#3ef126" />
            </svg>
            <svg viewBox="0 0 26 2" class="enemy-xp-container">
              <rect x=0 y=0 width="0%" height=1 fill="#66A8DE" />
              <rect x=0 y=1 width="0%" height=1 fill="#66A8DE" />
            </svg>
            <p class="enemy-status"></p>
        `)

        this.fighterElement = document.createElement("img");
        this.fighterElement.classList.add("fighter");
        this.fighterElement.setAttribute("src", this.src );
        this.fighterElement.setAttribute("alt", this.name );
        this.fighterElement.setAttribute("data-team", this.team );

        this.hpFills = this.hudElement.querySelectorAll(".enemy-hp-container > rect")
        this.xpFills = this.hudElement.querySelectorAll(".enemy-xp-container > rect")
    }
    update(changes={}) {
        //Update anything incoming
        Object.keys(changes).forEach(key => {
          this[key] = changes[key]
        })
    
        //Update active flag to show the correct hud
        this.hudElement.setAttribute("data-active", this.isActive)
        this.fighterElement.setAttribute("data-active", this.isActive);
    
        //Update HP & XP percent fills
        this.hpFills.forEach(rect => rect.style.width = `${this.hpPercent}%`)
        this.xpFills.forEach(rect => rect.style.width = `${this.xpPercent}%`)
    
        //Update level on screen
        this.hudElement.querySelector(".enemy-level").innerText = this.level

        //Update status
        const statusElement = this.hudElement.querySelector(".enemy-status")
        if (this.status) {
            statusElement.innerText = this.status.type
            statusElement.style.display = "block"
        } else {
            statusElement.innerText = ""
            statusElement.style.display = "none"
        }
    }

    getReplacedEvents(originalEvents) {
        if(this.status?.type === "fear" && utils.randomFromArray([true, false, false])) {
            return [
                { type: "textMessage", text: `${this.name} scared stiff!` },
            ]
        }
        return originalEvents
    }

    getPostEvents() {
        if(this.status?.type === "regen") {
            return [
                { type: "textMessage", text: "Healing!" },
                { type: "stateChange", recover: 5, onCaster: true }
            ]
        }
        return []
    }

    decrementStatus() {
        if (this.status?.expiresIn > 0) {
            this.status.expiresIn -= 1
            if (this.status.expiresIn === 0) {
                this.update({
                    status: null
                })
                return {
                    type: "textMessage",
                    text: "regen has stopped."
                }
            }
        }
        return null
    }

    init(container) {
        this.createElement()
        container.appendChild(this.hudElement)
        container.appendChild(this.fighterElement);
        this.update()
    }
}