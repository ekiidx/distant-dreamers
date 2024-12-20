class Collectable extends GameObject {
    constructor(config) {
        super(config)
        this.sprite = new Sprite({
            gameObject: this,
            src: config.src || "assets/img/objects/chest.png",
            animations: {
                "chest-closed" : [[1,0]],
                "chest-open" : [[0,0]]
            },
            currentAnimation: "chest-closed"
        });
        this.storyFlag = config.storyFlag;
        this.item = config.item;
        this.weapon = config.weapon;
        this.additionalText = config.additionalText;

        if (this.item ){
            this.actions = [
                {
                    required: [this.storyFlag],
                    events: [
                    //    { type: "message", text: "Already opened." },
                    ]
                },
                {
                    events: [
                        { type: "message", text: "You found a " + window.Actions[this.item.actionId].name + "." },
                        { type: "getItem", item: this.item },
                        { type: "addStoryFlag", flag: this.storyFlag }
                    ]
                }
            ]
        }

        if (this.weapon) {
            this.actions = [
                {
                    required: [this.storyFlag],
                    events: [
                    //    { type: "message", text: "Already opened." },
                    ]
                },
                {
                    events: [
                        { type: "message", text: "You found a " + window.Weapons[this.weapon.weaponId].name + "." },
                        // { type: "message", text: "You found a weapon." },
                        { type: "getItem", weapon: this.weapon },
                        { type: "addStoryFlag", flag: this.storyFlag }
                    ]
                }
            ]
        }
    }

    update() {
        this.sprite.currentAnimation = playerState.storyFlags[this.storyFlag]
        ? "chest-open" : "chest-closed";
    }
}