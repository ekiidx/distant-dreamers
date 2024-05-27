class WorldEvent {
    constructor({ map, event}) {
        this.map = map
        this.event = event
    }

    stand(resolve) {

    }

    walk(resolve) {
        const who = this.map.gameObjects[ this.event.who ]
        who.startBehavior({
            map: this.map
        }, {
            type: "walk",
            direction: this.event.direction
        })

        // Set up handler to complete when correct char is finished moving, then resolve event
        const completeHandler = e => {
            if (e.detail.whoId === this.event.who) {
                document.removeEventListener("WalkingComplete", completeHandler)
                resolve()
            }
        }

        document.addEventListener("WalkingComplete", completeHandler)
    }

    init() {
        return new Promise(resolve => {
            this[this.event.type](resolve)
        })
    }
}