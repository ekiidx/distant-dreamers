class Collectable extends GameObject {
    constructor(config) {
        super(config)
        this.sprite = new this.sprite({
            gameObject: this,
            src: "/",
            animations: {
                "used" : [[0,0]],
                "unused" : [ [0,1]]
            },
            currentAnimation: "used"
        });
    }
}