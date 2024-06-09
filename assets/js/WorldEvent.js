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

    message(resolve) {
        if (this.event.faceHero) {
            const obj = this.map.gameObjects[this.event.faceHero]
            obj.direction = utils.oppositeDirection(this.map.gameObjects["hero"].direction)
        }
        const message = new Message({
            text: this.event.text,
            onComplete: () => resolve()
        })
        message.init( document.querySelector(".game-container"))
    }

    changeMap(resolve) {
        const sceneTransition = new SceneTransition()
        sceneTransition.init(document.querySelector(".game-container"), () => {
            this.map.world.startMap( window.WorldMaps[this.event.map])
            resolve()

            sceneTransition.fadeOut()
        })
    }

    battle(resolve) {
        const battle = new Battle({
            enemy: Enemies[this.event.enemyId],
            onComplete: () => {
                resolve()
            }
        })
        battle.init(document.querySelector(".game-container"))
    }

    pause(resolve) {
        this.map.isPaused = true
        const menu = new PauseMenu({
            onComplete: () => {
                resolve()
                this.map.isPaused = false
                this.map.world.startGameLoop()
            }
        })
        menu.init(document.querySelector(".game-container"))
    }

    init() {
        return new Promise(resolve => {
            this[this.event.type](resolve)
        })
    }
}