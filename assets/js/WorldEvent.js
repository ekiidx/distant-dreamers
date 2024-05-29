class WorldEvent {
    constructor({ map, event}) {
        this.map = map
        this.event = event
    }

    stand(resolve) {
        const who = this.map.gameObjects[ this.event.who ]
        who.startBehavior({
          map: this.map
        }, {
          type: "stand",
          direction: this.event.direction,
          time: this.event.time
        })
    
        //Set up a handler to complete when correct char is done standing, then resolve the event
        const completeHandler = e => {
            if (e.detail.whoId === this.event.who) {
            document.removeEventListener("StandComplete", completeHandler)
            resolve()
            }
        }
        document.addEventListener("StandComplete", completeHandler)
    }



    walk(resolve) {
        const who = this.map.gameObjects[ this.event.who ]
        who.startBehavior({
            map: this.map
        }, {
            type: "walk",
            direction: this.event.direction,
            retry: true
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