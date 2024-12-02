class GameObject {
    constructor(config) {
        this.id = null;
        this.isMounted = false;
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.direction = config.direction || "down";
        this.sprite = new Sprite({
            gameObject: this,
            src: config.src || "",
            hasShadow: config.hasShadow
        });

        // These happen once on map startup
        this.behaviorLoop = config.behaviorLoop || [];
        this.behaviorLoopIndex = 0;
        this.actions = config.actions || [];
        this.retryTimeout = null;
    }

    mount(map) {
        this.isMounted = true;
        // map.addWall(this.x, this.y)

        // Delay for behavior
        setTimeout(() => {
            this.doBehaviorEvent(map);
        }, 10)
    }

    update() {
    }

    async doBehaviorEvent(map) {

        // Stop if there is a scene or no scene config set (stop async events before they happen)
        if (this.behaviorLoop.length === 0) {
            return;
        }

        if (map.isScenePlaying) {
            if (this.retryTimeout) {
                clearTimeout(this.retryTimeout);
            }
            this.retryTimeout = setTimeout(() => {
                this.doBehaviorEvent(map)
            }, 1000)
            return;
        }

        // Setting up our next event with relavent info
        let eventConfig = this.behaviorLoop[this.behaviorLoopIndex];
        eventConfig.who = this.id;

        // Create an event instance from our next event config
        const eventHandler = new WorldEvent({
            map,
            event: eventConfig
        });
        await eventHandler.init();

        // fire this behavior loop after waiting on eventHandler.init()
        // Setting next event to fire
        this.behaviorLoopIndex += 1;
        if (this.behaviorLoopIndex === this.behaviorLoop.length) {
            this.behaviorLoopIndex = 0;
        }

        //Loop again
        this.doBehaviorEvent(map);
    }
}