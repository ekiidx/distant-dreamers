class WorldMap {
    constructor(config) {
        this.world = null;
        this.gameObjects = {}; // live objects are in here
        this.configObjects = config.configObjects; // Configuration content

        this.sceneSpaces = config.sceneSpaces || {};
        this.walls = config.walls || {};

        this.lowerImage = new Image();
        this.lowerImage.src = config.lowerSrc;

        this.upperImage = new Image();
        this.upperImage.src = config.upperSrc;

        this.isScenePlaying = false;
        this.isPaused = false;
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
        const {x,y} = utils.nextPosition(currentX, currentY, direction);
        // Check if there are walls on the map
        if (this.walls[`${x},${y}`]) {
            return true;
        }
        // Check for game objects at this position
        return Object.values(this.gameObjects).find(obj => {
            if (obj.x === x && obj.y === y) { return true }
            if (obj.intentPosition && obj.intentPosition[0] === x && obj.intentPosition[1] === y) {
                return true;
            }
            return false;
        })
    }

    mountObjects() {
        Object.keys(this.configObjects).forEach(key => {
            // determine object mount
            let object = this.configObjects[key];
            object.id = key;

            let instance;
            if (object.type === "Character") {
                instance = new Character(object);
            }
            // Add items / shops here

            this.gameObjects[key] = instance;
            this.gameObjects[key].id = key;
            instance.mount(this);
        })
    }

    async startScene(events) {
        this.isScenePlaying = true;
    
        // Start loop of asynic events
        // await each one
        for (let i=0; i<events.length; i++) {
          const eventHandler = new WorldEvent({
            event: events[i],
            map: this,
          })
          const result = await eventHandler.init();
          //break out of loop if battle is lost
          if (result === "BATTLE_LOSE") {
            break;
          }
        }
        // when all events have played, set to false to continue on with the game
        this.isScenePlaying = false;

        // Reset NPCs to do idle behavior
        // Object.values(this.gameObjects).forEach(object => object.doBehaviorEvent(this))
      }

    // Check if there is action to be taken at a space
    checkForActionScene() {
        const hero = this.gameObjects["hero"]
        const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction)
        const match = Object.values(this.gameObjects).find(object => {
            return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
        });
        if (!this.isScenePlaying && match && match.talking.length) {

            const relevantScenario = match.talking.find(scenario => {
                return (scenario.required || []).every(sf => {
                    return playerState.storyFlags[sf]
                })
            })
            relevantScenario && this.startScene(relevantScenario.events)
        } 
    }

    checkForFootstepScene() {
        const hero = this.gameObjects["hero"];
        const match = this.sceneSpaces[ `${hero.x},${hero.y}` ];
        if (!this.isScenePlaying && match) {
            this.startScene( match[0].events )
        }
    }

    // addWall(x,y) {
    //     this.walls[`${x},${y}`] = true
    // }
    // removeWall(x,y) {
    //     delete this.walls[`${x},${y}`] 
    // }
    // moveWall(wasX, wasY, direction) {
    //     this.removeWall(wasX, wasY)
    //     const {x,y} = utils.nextPosition(wasX, wasY, direction)
    //     this.addWall(x,y)
    // }
}

window.WorldMaps = {
    TestRoom: {
        id: "TestRoom",
        lowerSrc: "assets/images/maps/test_room_lower.png",
        upperSrc: "assets/images/maps/test_room_upper.png",
        configObjects: {
            hero: {
                type: "Character",
                isPlayerControlled: true,
                x: utils.withGrid(5),
                y: utils.withGrid(6),
            },
            npc1: {
                type: "Character",
                x: utils.withGrid(7),
                y: utils.withGrid(9),
                src: "assets/images/characters/npc1.png",
                behaviorLoop: [
                    { type: "stand", direction: "left", time: 3800 },
                    { type: "stand", direction: "up", time: 1800 },
                    { type: "stand", direction: "right", time: 3200 },
                    { type: "stand", direction: "left", time: 4300 },
                ],
                talking: [
                    {
                        // use array to add multiple events that need to be completed in order for trigger
                        required: ["BATTLE_1_COMPLETE"],
                        events: [
                            { type: "message", text: "Dang, you are strong.", faceHero: "npc1" }
                        ]
                    },
                    {
                        events: [
                            { type: "message", text: "It's good to meet you.", faceHero: "npc1"},
                            { type: "message", text: "You can press 'Enter' to talk to others like me."},
                            { type: "message", text: "Some of us will even battle you!"},
                            { type: "battle", enemyId: "enemy_1" },
                            { type: "message", text: "Dang, you are strong.", faceHero: "npc1" },
                            { type: "addStoryFlag", flag: "BATTLE_1_COMPLETE" }
                        ]
                    }
                ]
            },
            npc2: {
                type: "Character",
                x: utils.withGrid(2),
                y: utils.withGrid(8),
                src: "assets/images/characters/npc1.png",
                talking: [
                    {
                        events: [
                            { type: "message", text: "That door down there takes you another room.", faceHero: "npc2" },
                        ]
                    }
                ],
                behaviorLoop: [
                    { type: "stand", direction: "up", time: 3000 },
                    { type: "stand", direction: "right", time: 3800 },
                ],
            }
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
            [utils.asGridCoord(3,11)] : true,
            [utils.asGridCoord(2,10)] : true,
            [utils.asGridCoord(1,10)] : true,
            [utils.asGridCoord(0,9)] : true,
            [utils.asGridCoord(0,8)] : true,
        },
        sceneSpaces: {
            [utils.asGridCoord(3,10)] : [
                {
                    events: [
                        // {who: "npc1", type: "walk", direction: "up"},
                        {
                            type: "changeMap", 
                            map: "TestRoom2",
                            x: utils.withGrid(3),
                            y: utils.withGrid(10),
                            direction: "up"
                        }
                    ]
                }
            ]
        }
    },
    TestRoom2: {
        id: "TestRoom2",
        lowerSrc: "assets/images/maps/test_room_lower.png",
        upperSrc: "assets/images/maps/test_room_upper.png",
        configObjects: {
            hero: {
                type: "Character",
                isPlayerControlled: true,
                x: utils.withGrid(5),
                y: utils.withGrid(10),
                // direction: "up"
            },
            boss: {
                type: "Character",
                x: utils.withGrid(8),
                y: utils.withGrid(3),
                src: "assets/images/characters/boss.png",
                talking: [
                    {
                        // use array to add multiple events that need to be completed in order for trigger
                        required: ["BOSS_BATTLE_1_COMPLETE"],
                        events: [
                            { type: "message", text: "You have defeated me!", faceHero: "boss" }
                        ]
                    },
                    {
                        events: [
                            { type: "message", text: "I am the boss. Get ready to fight!", faceHero: "boss"},
                            { type: "battle", enemyId: "boss_1" },
                            { type: "message", text: "You are truly strong. A worthy opponent indeed.", faceHero: "boss" },
                            { type: "addStoryFlag", flag: "BOSS_BATTLE_1_COMPLETE" }
                        ]
                    }
                ]
                // direction: "up"
            },
            // npc1: new Character({
            //     x: utils.withGrid(9),
            //     y: utils.withGrid(2),
            //     src: "assets/images/characters/npc1.png"
            // }),
            // npc2: new Character({
            //     x: utils.withGrid(20),
            //     y: utils.withgrid(2),
            //     src: "assets/images/characters/npc2.png"
            // })
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
            [utils.asGridCoord(3,11)] : true,
            [utils.asGridCoord(2,10)] : true,
            [utils.asGridCoord(1,10)] : true,
            [utils.asGridCoord(0,9)] : true,
            [utils.asGridCoord(0,8)] : true,
        },
        sceneSpaces: {
            [utils.asGridCoord(3,10)] : [
                {
                    events: [
                        // {who: "npc1", type: "walk", direction: "up"},
                        {
                            type: "changeMap", 
                            map: "TestRoom",
                            x: utils.withGrid(3),
                            y: utils.withGrid(10),
                            direction: "up"
                        }
                    ]
                }
            ]
        }
    }
}