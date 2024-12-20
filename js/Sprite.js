class Sprite {
    constructor(config) {

        // Set up the image
        this.image = new Image();
        this.image.src = config.src;
        this.image.onload = () => {
            this.isLoaded = true;
        }

        // Shadow
        if (config.hasShadow) {
            this.shadow = new Image();
            this.shadow.src= "assets/img/characters/shadow.png";

            this.shadow.onload = () => {
                this.isShadowLoaded = true;
            }
        }

        // Configure animations and initial state
        this.animations = config.animations || {
            "idle-left" : [ [0, 3] ],
            "idle-down" : [ [0, 0] ],
            "idle-up"   : [ [0, 2] ],
            "idle-right": [ [0, 1] ],
            "walk-left" : [ [1, 3], [0, 3], [3, 3], [0, 3] ],
            "walk-down" : [ [1, 0], [0, 0], [3, 0], [0, 0] ],
            "walk-up"   : [ [1, 2], [0, 2], [3, 2], [0, 2] ],
            "walk-right": [ [1, 1], [0, 1], [3, 1], [0, 1] ]
        }
        this.currentAnimation = config.currentAnimation || "idle-down";
        this.currentAnimationFrame = 0;

        // Amount of frames per animation
        this.animationFrameLimit = config.animationFrameLimit || 8;
        this.animationFrameProgress = this.animationFrameLimit;

        // Reference game object
        this.gameObject = config.gameObject;
    }

    get frame() {
        return this.animations[this.currentAnimation][this.currentAnimationFrame];
    }

    setAnimation(key) {
        if (this.currentAnimation !== key) {
            this.currentAnimation = key;
            this.currentAnimationFrame = 0;
            this.animationFrameProgress = this.animationFrameLimit;
        }
    }

    updateAnimationProgress() {
        //Downtick frame progress
        if (this.animationFrameProgress > 0) {
            this.animationFrameProgress -= 1;
            return;
        }

        //Reset the counter
        this.animationFrameProgress = this.animationFrameLimit;
        this.currentAnimationFrame += 1;

        if (this.frame === undefined) {
            this.currentAnimationFrame = 0
        }
    }

    draw(ctx, cameraCharacter) {
        const x = this.gameObject.x - 8 + utils.withGrid(10.5) - cameraCharacter.x;
        const y = this.gameObject.y - 18 + utils.withGrid(6) - cameraCharacter.y;

        this.isShadowLoaded && ctx.drawImage(this.shadow, x, y);

        const [frameX, frameY] = this.frame;

        this.isLoaded && ctx.drawImage(this.image,
            frameX * 32, frameY * 32,
            32, 32,
            x, y,
            32, 32
        )
        this.updateAnimationProgress();
    }
}