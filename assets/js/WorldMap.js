class WorldMap {
    constructor(config) {
        this.gameObjects = config.gameObjects

        this.lowerImage = new Image()
        this.lowerImage.src = config.lowerSrc

        this.upperImage = new Image()
        this.upperImage.src = config.upperSrc
    }

    drawLowerImage(ctx, cameraCharacter) {
        ctx.drawImage(
            this.lowerImage, 
            utils.withGrid(10.5) - cameraCharacter.x,
            utils.withGrid(6) - cameraCharacter.y
        )
    }

    drawUpperImage(ctx, cameraCharacter) {
        ctx.drawImage(
            this.upperImage, 
            utils.withGrid(10.5) - cameraCharacter.x,
            utils.withGrid(6) - cameraCharacter.y
        )
    }
}

window.WorldMaps = {
    TestRoom: {
        lowerSrc: "assets/images/maps/test_room_lower.png",
        upperSrc: "assets/images/maps/test_room_upper.png",
        gameObjects: {
            hero: new Character({
                isPlayerControlled: true,
                x: utils.withGrid(5),
                y: utils.withGrid(6),
            }),
            npc1: new Character({
                x: utils.withGrid(7),
                y: utils.withGrid(9),
                src: "assets/images/characters/npc1.png"
            })
        }
    },
    TestRoom2: {
        lowerSrc: "assets/images/maps/test_room_lower_2.png",
        upperSrc: "assets/images/maps/test_room_upper2.png",
        gameObjects: {
            hero: new GameObject({
                x: 5,
                y: 6,
            }),
            npc1: new GameObject({
                x: 9,
                y: 2,
                src: "assets/images/characters/npc1.png"
            }),
            npc2: new GameObject({
                x:20,
                y: 2,
                src: "assets/images/characters/npc2.png"
            }),
        }
    },
}