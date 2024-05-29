class WorldMap {
    constructor(config) {
        this.gameObjects = config.gameObjects

        this.walls = config.walls || {}

        this.lowerImage = new Image()
        this.lowerImage.src = config.lowerSrc

        this.upperImage = new Image()
        this.upperImage.src = config.upperSrc

        this.isScenePlaying = false
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

    isSpaceTaken(currentX, currentY, direction) {
        const {x,y} = utils.nextPosition(currentX, currentY, direction)
        return this.walls[`${x},${y}`] || false
    }

    mountObjects() {
        Object.keys(this.gameObjects).forEach(key => {
            // determine object mount
            let object = this.gameObjects[key]
            object.id = key
            object.mount(this)
        })
    }

    async startScene(events) {
        this.isScenePlaying = true
    
        // Start loop of asynic events
        // await each one
        for (let i=0; i<events.length; i++) {
          const eventHandler = new WorldEvent({
            event: events[i],
            map: this,
          })
          await eventHandler.init()
        }
    
        // when all events have played, set to false to continue on with the game
        this.isScenePlaying = false

        // Reset NPCs to do idle behavior
        Object.values(this.gameObjects).forEach(object => object.doBehaviorEvent(this))
      }

    // Check is there is action to be taken at a space
    checkForActionScene() {
        const hero = this.gameObjects["hero"]
        const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction)
        const match = Object.values(this.gameObjects).find(object => {
            return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
        })
        if (!this.isScenePlaying && match && match.talking.length) {
            this.startScene(match.talking[0].events)
        } 
    }

    addWall(x,y) {
        this.walls[`${x},${y}`] = true
    }
    removeWall(x,y) {
        delete this.walls[`${x},${y}`] 
    }
    moveWall(wasX, wasY, direction) {
        this.removeWall(wasX, wasY)
        const {x,y} = utils.nextPosition(wasX, wasY, direction)
        this.addWall(x,y)
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
                src: "assets/images/characters/npc1.png",
                behaviorLoop: [
                    { type: "stand", direction: "left", time: 800 },
                    { type: "stand", direction: "up", time: 800 },
                    { type: "stand", direction: "right", time: 1200 },
                    { type: "stand", direction: "left", time: 300 },
                ],
                talking: [
                    {
                        events: [
                            { type: "message", text: "It's good to meet you.", faceHero: "npc1"},
                            { type: "message", text: "You can press 'Enter' to talk to others like me."}
                        ]
                    }
                ]
            }),
            npc2: new Character({
                x: utils.withGrid(2),
                y: utils.withGrid(8),
                src: "assets/images/characters/npc1.png",
                behaviorLoop: [
                    { type: "walk", direction: "right" },
                    { type: "walk", direction: "up" },
                    { type: "walk", direction: "left" },
                    { type: "walk", direction: "down" },
                ]
            })
        },
        walls: {
            //"16,16": true
            [utils.asGridCoord(0,3)] : true,
            [utils.asGridCoord(0,4)] : true,
            [utils.asGridCoord(0,5)] : true,
            [utils.asGridCoord(0,6)] : true,
            [utils.asGridCoord(0,7)] : true,
            [utils.asGridCoord(1,2)] : true,
            [utils.asGridCoord(2,2)] : true,
            [utils.asGridCoord(3,2)] : true,
            [utils.asGridCoord(4,2)] : true,
            [utils.asGridCoord(5,2)] : true,
            [utils.asGridCoord(6,2)] : true,
            [utils.asGridCoord(6,3)] : true,
            [utils.asGridCoord(7,3)] : true,
            [utils.asGridCoord(7,2)] : true,
            [utils.asGridCoord(7,1)] : true,
            [utils.asGridCoord(8,0)] : true,
            [utils.asGridCoord(9,1)] : true,
            [utils.asGridCoord(9,2)] : true,
            [utils.asGridCoord(9,3)] : true,
            [utils.asGridCoord(10,2)] : true,
            [utils.asGridCoord(11,2)] : true,
            [utils.asGridCoord(12,3)] : true,
            [utils.asGridCoord(12,4)] : true,
            [utils.asGridCoord(12,5)] : true,
            [utils.asGridCoord(12,6)] : true,
            [utils.asGridCoord(12,7)] : true,
            [utils.asGridCoord(12,8)] : true,
            [utils.asGridCoord(12,9)] : true,
            [utils.asGridCoord(11,10)] : true,
            [utils.asGridCoord(10,10)] : true,
            [utils.asGridCoord(9,10)] : true,
            [utils.asGridCoord(8,10)] : true,
            [utils.asGridCoord(7,10)] : true,
            [utils.asGridCoord(6,10)] : true,
            [utils.asGridCoord(5,10)] : true,
            [utils.asGridCoord(4,10)] : true,
            [utils.asGridCoord(4,11)] : true,
            [utils.asGridCoord(3,12)] : true,
            [utils.asGridCoord(2,11)] : true,
            [utils.asGridCoord(2,10)] : true,
            [utils.asGridCoord(1,10)] : true,
            [utils.asGridCoord(0,9)] : true,
            [utils.asGridCoord(0,8)] : true,
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
            })
        }
    },
}