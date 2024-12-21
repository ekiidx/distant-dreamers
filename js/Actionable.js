class Actionable extends GameObject {
    constructor(config) {
        super(config)
        this.multiSpaceEvent = config.multiSpaceEvent;
        this.matchX = config.matchX;
        this.matchY = config.matchY;
        this.actions = config.actions;
    }
    update() {
    }
}