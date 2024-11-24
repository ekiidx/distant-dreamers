class Actionable extends GameObject {
    constructor(config) {
        super(config)
        this.actions = config.actions;
        // this.sprite = new Sprite({
        //     gameObject: this,
        //     src: "",
        // });
        // this.storyFlag = config.storyFlag;
        // this.item = config.item;

        // this.actions = [
        //     // {
        //     //     required: [this.storyFlag],
        //     //     events: [
        //     //        { type: "message", text: "Already opened." },
        //     //     ]
        //     // },
        //     // {
        //     //     events: [
        //     //         { type: "message", text: "You found an actionable!" },
        //     //     ]
        //     // }
        // ]
    }

    update() {
        // this.sprite.currentAnimation = playerState.storyFlags[this.storyFlag]
        // ? "chest-open" : "chest-closed";
    }
}