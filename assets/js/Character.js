class Character extends GameObject {
    constructor(config) {
        super(config);
        this.movingProgressRemaining = 0;
        this.isStanding = false;
        this.intentPosition = null; // [x,y]

        this.isPlayerControlled = config.isPlayerControlled || false;

        this.directionUpdate = {
            "up": ["y", -1],
            "down": ["y", 1],
            "left": ["x", -1],
            "right": ["x", 1],
        }
        this.standBehaviorTimeout;
    }

    update(state) {
        if (this.movingProgressRemaining > 0) {
            this.updatePosition();
        } else {
            // More code for starting to walk
            // Keyboard ready and have key pressed
            if (!state.map.isScenePlaying && this.isPlayerControlled && state.arrow) {
                this.startBehavior(state, {
                    type: "walk",
                    direction: state.arrow
                })
            }
            this.updateSprite(state);
        }
    }

    startBehavior(state, behavior) {

        // Stop here if not mounted
        if (!this.isMounted) {
            return;
        }
        // Set character direction to whatever behavior has
        this.direction = behavior.direction;
        if (behavior.type === "walk") {
            // stop player movement if space in front is taken
            if (state.map.isSpaceTaken(this.x, this.y, this.direction)) {

                behavior.retry && setTimeout(() => {
                    this.startBehavior(state, behavior)
                }, 10);
                return;
            }
            // Ready to move
            // Reset the character wall during move
            // state.map.moveWall(this.x, this.y, this.direction)
            this.movingProgressRemaining = 16;

            // Add next position
            const intentPosition = utils.nextPosition(this.x, this.y, this.direction)
            this.intentPosition = [
                intentPosition.x,
                intentPosition.y
            ]
            this.updateSprite(state);
        }

        if (behavior.type === "stand") {
            this.isStanding = true;

            if (this.standBehaviorTimeout) {
                clearTimeout(this.standBehaviorTimeout);
                console.log("xlear")
              }

            this.standBehaviorTimeout = setTimeout(() => {
                utils.emitEvent("StandComplete", {
                    whoId: this.id
                })
                this.isStanding = false;
            }, behavior.time)
        }
    }

    updatePosition() {
        const [property, change] = this.directionUpdate[this.direction];
        this[property] += change;
        this.movingProgressRemaining -= 1;

        // we finished movement
        if (this.movingProgressRemaining === 0) {
            this.intentPosition = null;
            utils.emitEvent("WalkingComplete", {
                whoId: this.id
            })
        }
    }

    updateSprite() {
        if (this.movingProgressRemaining > 0) {
            this.sprite.setAnimation("walk-"+this.direction)
            return;
        }

        this.sprite.setAnimation("idle-"+this.direction)
    }
}