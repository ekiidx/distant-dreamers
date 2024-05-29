class GameObject {
    constructor(config) {
        this.id = null
        this.isMounted = false
        this.x = config.x || 0
        this.y = config.y || 0
        this.direction = config.direction || "down"
        this.sprite = new Sprite({
            gameObject: this,
            src: config.src || "assets/images/characters/hero.png",
        })

        this.behaviorLoop = config.behaviorLoop || []
        this.behaviorLoopIndex = 0
    }

    mount(map) {
        console.log('mounted')
        this.isMounted = true
        map.addWall(this.x, this.y)

          // Delay for behavior
          setTimeout(() => {
            this.doBehaviorEvent(map)
          }, 10)
    }

    update() {

    }

    async doBehaviorEvent(map) {

        // Stop if there is a scene or no scene config set (stop async events before they happen)
        if (map.isScenePlaying || this.behaviorLoop.length === 0 || this.isStanding) {
            return
        }

        // Setting up our next event with relavent info
        let eventConfig = this.behaviorLoop[this.behaviorLoopIndex]
        eventConfig.who = this.id

        // Create an event instance from our next event config
        const eventHandler = new WorldEvent({ map, event: eventConfig })
        await eventHandler.init()

        // fire this behavior loop after waiting on eventHandler.init()
        // Setting next event to fire
        this.behaviorLoopIndex += 1
        if (this.behaviorLoopIndex === this.behaviorLoop.length) {
            this.behaviorLoopIndex = 0
        }

         //Loop again
        this.doBehaviorEvent(map);
    }
}