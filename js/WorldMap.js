class WorldMap {
    constructor(config) {
        this.world = null;
        this.gameObjects = {}; // live objects are in here
        this.configObjects = config.configObjects; // Configuration content
        this.openingScenes = config.openingScenes || {};
        this.sceneSpaces = config.sceneSpaces || {};
        this.battleSpaces = config.battleSpaces || {};
        this.walls = config.walls || {};

        this.wallImage = new Image();
        this.wallImage.src =  "assets/img/wall.png";

        this.lowerImage = new Image();
        this.lowerImage.src = config.lowerSrc;

        this.upperImage = new Image();
        this.upperImage.src = config.upperSrc;

        this.isScenePlaying = false;
        this.isPaused = false;
        this.isGameOver = false;
    }

    // Draw Bounding walls in red
    drawWalls(ctx, cameraCharacter) {
        const redWalls = Object.keys(this.walls);
        for ( let x = 0; x < redWalls.length; x++) {
            
            let splitRedWalls = redWalls[x].split(",");
            ctx.drawImage(
                this.wallImage,
                Number(splitRedWalls[0]) + utils.withGrid(10.5) - cameraCharacter.x,
                Number(splitRedWalls[1]) + utils.withGrid(6) - cameraCharacter.y
            )
        }
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
        const {
            x,
            y
        } = utils.nextPosition(currentX, currentY, direction);
        // Check if there are walls on the map
        if (this.walls[`${x},${y}`]) {
            return true;
        }
        // Check for game objects at this position
        return Object.values(this.gameObjects).find(obj => {
            if (obj.x === x && obj.y === y) {
                return true
            }
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

            if (object.type === "Collectable") {
                instance = new Collectable(object);
            }

            if (object.type === "Actionable") {
                instance = new Actionable(object);
            }
            
            this.gameObjects[key] = instance;
            this.gameObjects[key].id = key;
            instance.mount(this);
        })
    }

    async startScene(events) {
        this.isScenePlaying = true;

        // Start loop of async events
        // await each one
        for (let i = 0; i < events.length; i++) {
            const eventHandler = new WorldEvent({
                event: events[i],
                map: this,
            })
            const result = await eventHandler.init();
            //break out of loop if battle is lost
            if (result === "BATTLE_LOSE") {
                // this.isGameOver = true;
                // gameOver();
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
        if (!this.isScenePlaying && match && match.actions.length) {

            const relevantScenario = match.actions.find(scenario => {
                return (scenario.required || []).every(sf => {
                    return playerState.storyFlags[sf]
                })
            })
            this.startScene(relevantScenario.events);
        }
    }

    checkForFootstepScene() {
        const hero = this.gameObjects["hero"];
        const match = this.sceneSpaces[`${hero.x},${hero.y}`];
        if (!this.isScenePlaying && match && match[0].actions.length) {

            const relevantSpaceScenario = match[0].actions.find(scenario => {
                return (scenario.required || []).every(sf => {
                    return playerState.storyFlags[sf]
                })
            })
            // if(!relevantSpaceScenario.required) {
                this.startScene(relevantSpaceScenario.events);
            // }
        }
    }

    checkForBattleScene() {
        const hero = this.gameObjects["hero"];
        const match = this.battleSpaces[`${hero.x},${hero.y}`];
        if (!this.isScenePlaying && match && match[0].actions.length) {

            const relevantBattleScenario = match[0].actions.find(scenario => {
                return (scenario.required || []).every(sf => {
                    return playerState.storyFlags[sf]
                })
            })

            if(!relevantBattleScenario.required) {
                this.startScene(relevantBattleScenario.events);
            }
        }
    }

    // Check if there are any opening scenes when changing maps
    checkForOpeningScenes() {
        const match = this.openingScenes;
        if (!this.isScenePlaying) {
            this.startScene(match.events);
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
    BlackRoom: {
        id: "BlackRoom",
        name: "Black Room",
        lowerSrc: "",
        upperSrc: "",
        configObjects: {
            hero: {
                type: "Character",
                isPlayerControlled: true,
                hasShadow: true,
                x: utils.withGrid(3),
                y: utils.withGrid(10),
                src: "assets/img/characters/hero.png"
            },
        //     npc1: {
        //         type: "Character",
        //         x: utils.withGrid(7),
        //         y: utils.withGrid(9),
        //         src: "assets/img/characters/npc1.png",
        //         behaviorLoop: [{
        //                 type: "stand",
        //                 direction: "left",
        //                 time: 3800
        //             },
        //             {
        //                 type: "stand",
        //                 direction: "up",
        //                 time: 1800
        //             },
        //             {
        //                 type: "stand",
        //                 direction: "right",
        //                 time: 3200
        //             },
        //             {
        //                 type: "stand",
        //                 direction: "left",
        //                 time: 4300
        //             },
        //         ],
        //         actions: [{
        //                 // use array to add multiple events that need to be completed in order for trigger
        //                 required: ["BATTLE_1_COMPLETE"],
        //                 events: [{
        //                     type: "message",
        //                     text: "Dang, you are strong.",
        //                     faceHero: "npc1"
        //                 }]
        //             },
        //             {
        //                 events: [{
        //                         type: "message",
        //                         text: "It's good to meet you.",
        //                         faceHero: "npc1"
        //                     },
        //                     {
        //                         type: "message",
        //                         text: "You can press 'Enter' to talk to others like me."
        //                     },
        //                     {
        //                         type: "message",
        //                         text: "Some of us will even battle you!"
        //                     },
        //                     {
        //                         type: "battle",
        //                         enemyId: "enemy_1"
        //                     },
        //                     {
        //                         type: "message",
        //                         text: "Dang, you are strong.",
        //                         faceHero: "npc1"
        //                     },
        //                     {
        //                         type: "addStoryFlag",
        //                         flag: "BATTLE_1_COMPLETE"
        //                     }
        //                 ]
        //             }
        //         ]
        //     },
        //     npc2: {
        //         type: "Character",
        //         x: utils.withGrid(2),
        //         y: utils.withGrid(8),
        //         src: "assets/img/characters/npc1.png",
        //         actions: [{
        //             events: [{
        //                 type: "message",
        //                 text: "That door down there takes you another room.",
        //                 faceHero: "npc2"
        //             }, ]
        //         }],
        //         behaviorLoop: [{
        //                 type: "stand",
        //                 direction: "up",
        //                 time: 3000
        //             },
        //             {
        //                 type: "stand",
        //                 direction: "right",
        //                 time: 3800
        //             },
        //         ],
        //     }
        },
        // walls: {
        //     //"16,16": true
        // },
        sceneSpaces: {
            [utils.asGridCoord(3, 10)]: [{
                actions: [{
                    events: [
                        // {who: "npc1", type: "walk", direction: "up"},
                        {
                            type: "changeMap",
                            map: "Intro",
                            x: utils.withGrid(4),
                            y: utils.withGrid(10),
                            direction: "up"
                        },
                    ]
                }]
            }]
        },
        openingScenes: {
            events: [
                { type: "message",  text: "This is an opening scene." },
                { type: "addStoryFlag", flag: "BlackRoom_COMPLETE"}
            ]
        }
    },
    // TestRoom: {
    //     id: "TestRoom",
    //     name: "Test Room",
    //     lowerSrc: "assets/img/maps/test_room_lower.png",
    //     upperSrc: "assets/img/maps/test_room_upper.png",
    //     configObjects: {
    //         hero: {
    //             type: "Character",
    //             isPlayerControlled: true,
    //             hasShadow: true,
    //             x: utils.withGrid(5),
    //             y: utils.withGrid(6),
    //             src: "assets/img/characters/hero.png"
    //         },
    //         npc1: {
    //             type: "Character",
    //             hasShadow: true,
    //             x: utils.withGrid(7),
    //             y: utils.withGrid(9),
    //             src: "assets/img/characters/npc1.png",
    //             behaviorLoop: [{
    //                     type: "stand",
    //                     direction: "left",
    //                     time: 3800
    //                 },
    //                 {
    //                     type: "stand",
    //                     direction: "up",
    //                     time: 1800
    //                 },
    //                 {
    //                     type: "stand",
    //                     direction: "right",
    //                     time: 3200
    //                 },
    //                 {
    //                     type: "stand",
    //                     direction: "left",
    //                     time: 4300
    //                 },
    //             ],
    //             actions: [{
    //                     // use array to add multiple events that need to be completed in order for trigger
    //                     required: ["BATTLE_1_COMPLETE"],
    //                     events: [{
    //                         type: "message",
    //                         text: "Dang, you are strong.",
    //                         faceHero: "npc1"
    //                     }]
    //                 },
    //                 {
    //                     events: [{
    //                             type: "message",
    //                             text: "It's good to meet you.",
    //                             faceHero: "npc1"
    //                         },
    //                         {
    //                             type: "message",
    //                             text: "You can press 'Enter' to talk to others like me."
    //                         },
    //                         {
    //                             type: "message",
    //                             text: "Some of us will even battle you!"
    //                         },
    //                         {
    //                             type: "battle",
    //                             enemyId: "enemy_1"
    //                         },
    //                         {
    //                             type: "message",
    //                             text: "Dang, you are strong.",
    //                             faceHero: "npc1"
    //                         },
    //                         {
    //                             type: "addStoryFlag",
    //                             flag: "BATTLE_1_COMPLETE"
    //                         }
    //                     ]
    //                 }
    //             ]
    //         },
    //         npc2: {
    //             type: "Character",
    //             hasShadow: true,
    //             x: utils.withGrid(2),
    //             y: utils.withGrid(8),
    //             src: "assets/img/characters/npc1.png",
    //             actions: [{
    //                 events: [{
    //                     type: "message",
    //                     text: "That door down there takes you another room.",
    //                     faceHero: "npc2"
    //                 }, ]
    //             }],
    //             behaviorLoop: [{
    //                     type: "stand",
    //                     direction: "up",
    //                     time: 3000
    //                 },
    //                 {
    //                     type: "stand",
    //                     direction: "right",
    //                     time: 3800
    //                 },
    //             ],
    //         }
    //     },
    //     walls: {
    //         //"16,16": true
    //         [utils.asGridCoord(0, 3)]: true,
    //         [utils.asGridCoord(0, 4)]: true,
    //         [utils.asGridCoord(0, 5)]: true,
    //         [utils.asGridCoord(0, 6)]: true,
    //         [utils.asGridCoord(0, 7)]: true,
    //         [utils.asGridCoord(1, 2)]: true,
    //         [utils.asGridCoord(2, 2)]: true,
    //         [utils.asGridCoord(3, 2)]: true,
    //         [utils.asGridCoord(4, 2)]: true,
    //         [utils.asGridCoord(5, 2)]: true,
    //         [utils.asGridCoord(6, 2)]: true,
    //         [utils.asGridCoord(6, 3)]: true,
    //         [utils.asGridCoord(7, 3)]: true,
    //         [utils.asGridCoord(7, 2)]: true,
    //         [utils.asGridCoord(7, 1)]: true,
    //         [utils.asGridCoord(8, 0)]: true,
    //         [utils.asGridCoord(9, 1)]: true,
    //         [utils.asGridCoord(9, 2)]: true,
    //         [utils.asGridCoord(9, 3)]: true,
    //         [utils.asGridCoord(10, 2)]: true,
    //         [utils.asGridCoord(11, 2)]: true,
    //         [utils.asGridCoord(12, 3)]: true,
    //         [utils.asGridCoord(12, 4)]: true,
    //         [utils.asGridCoord(12, 5)]: true,
    //         [utils.asGridCoord(12, 6)]: true,
    //         [utils.asGridCoord(12, 7)]: true,
    //         [utils.asGridCoord(12, 8)]: true,
    //         [utils.asGridCoord(12, 9)]: true,
    //         [utils.asGridCoord(11, 10)]: true,
    //         [utils.asGridCoord(10, 10)]: true,
    //         [utils.asGridCoord(9, 10)]: true,
    //         [utils.asGridCoord(8, 10)]: true,
    //         [utils.asGridCoord(7, 10)]: true,
    //         [utils.asGridCoord(6, 10)]: true,
    //         [utils.asGridCoord(5, 10)]: true,
    //         [utils.asGridCoord(4, 10)]: true,
    //         [utils.asGridCoord(3, 11)]: true,
    //         [utils.asGridCoord(2, 10)]: true,
    //         [utils.asGridCoord(1, 10)]: true,
    //         [utils.asGridCoord(0, 9)]: true,
    //         [utils.asGridCoord(0, 8)]: true,
    //     },
    //     sceneSpaces: {
    //         [utils.asGridCoord(3, 10)]: [{
    //             actions: [{
    //                 events: [
    //                     // {who: "npc1", type: "walk", direction: "up"},
    //                     {
    //                         type: "changeMap",
    //                         map: "TestRoom2",
    //                         x: utils.withGrid(3),
    //                         y: utils.withGrid(10),
    //                         direction: "up"
    //                     }
    //                 ]
    //             }]
    //         }]
    //     }
    // },
    // TestRoom2: {
    //     id: "TestRoom2",
    //     name: "Test Room 2",
    //     lowerSrc: "assets/img/maps/test_room_lower.png",
    //     upperSrc: "assets/img/maps/test_room_upper.png",
    //     configObjects: {
    //         hero: {
    //             type: "Character",
    //             isPlayerControlled: true,
    //             hasShadow: true,
    //             x: utils.withGrid(5),
    //             y: utils.withGrid(5),
    //             src: "assets/img/characters/hero.png"
    //             // direction: "up"
    //         },
    //         boss: {
    //             type: "Character",
    //             hasShadow: true,
    //             x: utils.withGrid(8),
    //             y: utils.withGrid(3),
    //             src: "assets/img/characters/boss.png",
    //             actions: [{
    //                     // use array to add multiple events that need to be completed in order for trigger
    //                     required: ["BOSS_BATTLE_1_COMPLETE"],
    //                     events: [{
    //                         type: "message",
    //                         text: "You have defeated me!",
    //                         faceHero: "boss"
    //                     }]
    //                 },
    //                 {
    //                     events: [{
    //                             type: "message",
    //                             text: "I am the boss. Get ready to fight!",
    //                             faceHero: "boss"
    //                         },
    //                         {
    //                             type: "battle",
    //                             enemyId: "boss_1"
    //                         },
    //                         {
    //                             type: "message",
    //                             text: "You are truly strong. A worthy opponent indeed.",
    //                             faceHero: "boss"
    //                         },
    //                         {
    //                             type: "addStoryFlag",
    //                             flag: "BOSS_BATTLE_1_COMPLETE"
    //                         }
    //                     ]
    //                 }
    //             ]
    //             // direction: "up"
    //         },
    //         chest: {
    //             type: "Collectable",
    //             x: utils.withGrid(3),
    //             y: utils.withGrid(5),
    //             item: { actionId: "item_recoverStatus", instanceId: "item29329" },
    //             storyFlag: "USED_CHEST"
    //         },
    //         // npc1: new Character({
    //         //     x: utils.withGrid(9),
    //         //     y: utils.withGrid(2),
    //         //     src: "assets/img/characters/npc1.png"
    //         // }),
    //         // npc2: new Character({
    //         //     x: utils.withGrid(20),
    //         //     y: utils.withgrid(2),
    //         //     src: "assets/img/characters/npc2.png"
    //         // })
    //     },
    //     walls: {
    //         //"16,16": true
    //         [utils.asGridCoord(0, 3)]: true,
    //         [utils.asGridCoord(0, 4)]: true,
    //         [utils.asGridCoord(0, 5)]: true,
    //         [utils.asGridCoord(0, 6)]: true,
    //         [utils.asGridCoord(0, 7)]: true,
    //         [utils.asGridCoord(1, 2)]: true,
    //         [utils.asGridCoord(2, 2)]: true,
    //         [utils.asGridCoord(3, 2)]: true,
    //         [utils.asGridCoord(4, 2)]: true,
    //         [utils.asGridCoord(5, 2)]: true,
    //         [utils.asGridCoord(6, 2)]: true,
    //         [utils.asGridCoord(6, 3)]: true,
    //         [utils.asGridCoord(7, 3)]: true,
    //         [utils.asGridCoord(7, 2)]: true,
    //         [utils.asGridCoord(7, 1)]: true,
    //         [utils.asGridCoord(8, 0)]: true,
    //         [utils.asGridCoord(9, 1)]: true,
    //         [utils.asGridCoord(9, 2)]: true,
    //         [utils.asGridCoord(9, 3)]: true,
    //         [utils.asGridCoord(10, 2)]: true,
    //         [utils.asGridCoord(11, 2)]: true,
    //         [utils.asGridCoord(12, 3)]: true,
    //         [utils.asGridCoord(12, 4)]: true,
    //         [utils.asGridCoord(12, 5)]: true,
    //         [utils.asGridCoord(12, 6)]: true,
    //         [utils.asGridCoord(12, 7)]: true,
    //         [utils.asGridCoord(12, 8)]: true,
    //         [utils.asGridCoord(12, 9)]: true,
    //         [utils.asGridCoord(11, 10)]: true,
    //         [utils.asGridCoord(10, 10)]: true,
    //         [utils.asGridCoord(9, 10)]: true,
    //         [utils.asGridCoord(8, 10)]: true,
    //         [utils.asGridCoord(7, 10)]: true,
    //         [utils.asGridCoord(6, 10)]: true,
    //         [utils.asGridCoord(5, 10)]: true,
    //         [utils.asGridCoord(4, 10)]: true,
    //         [utils.asGridCoord(3, 11)]: true,
    //         [utils.asGridCoord(2, 10)]: true,
    //         [utils.asGridCoord(1, 10)]: true,
    //         [utils.asGridCoord(0, 9)]: true,
    //         [utils.asGridCoord(0, 8)]: true,
    //     },
    //     sceneSpaces: {
    //         [utils.asGridCoord(3, 10)]: [{
    //             actions: [{
    //                 events: [
    //                     // {who: "npc1", type: "walk", direction: "up"},
    //                     {
    //                         type: "changeMap",
    //                         map: "TestRoom",
    //                         x: utils.withGrid(3),
    //                         y: utils.withGrid(10),
    //                         direction: "up"
    //                     }
    //                 ]
    //             }]
    //         }]
    //     }
    // },
    // Street: {
    //     id: "TestRoom",
    //     name: "Street",
    //     lowerSrc: "assets/img/maps/street_lower.png",
    //     upperSrc: "assets/img/maps/street_upper.png",
    //     configObjects: {
    //         hero: {
    //             type: "Character",
    //             isPlayerControlled: true,
    //             hasShadow: true,
    //             x: utils.withGrid(17),
    //             y: utils.withGrid(50),
    //             src: "assets/img/characters/hero.png"
    //         },
    //         // npc1: {
    //         //     type: "Character",
    //         //     x: utils.withGrid(7),
    //         //     y: utils.withGrid(9),
    //         //     src: "assets/img/characters/npc1.png",
    //         //     behaviorLoop: [{
    //         //             type: "stand",
    //         //             direction: "left",
    //         //             time: 3800
    //         //         },
    //         //         {
    //         //             type: "stand",
    //         //             direction: "up",
    //         //             time: 1800
    //         //         },
    //         //         {
    //         //             type: "stand",
    //         //             direction: "right",
    //         //             time: 3200
    //         //         },
    //         //         {
    //         //             type: "stand",
    //         //             direction: "left",
    //         //             time: 4300
    //         //         },
    //         //     ],
    //         //     actions: [{
    //         //             // use array to add multiple events that need to be completed in order for trigger
    //         //             required: ["BATTLE_1_COMPLETE"],
    //         //             events: [{
    //         //                 type: "message",
    //         //                 text: "Dang, you are strong.",
    //         //                 faceHero: "npc1"
    //         //             }]
    //         //         },
    //         //         {
    //         //             events: [{
    //         //                     type: "message",
    //         //                     text: "It's good to meet you.",
    //         //                     faceHero: "npc1"
    //         //                 },
    //         //                 {
    //         //                     type: "message",
    //         //                     text: "You can press 'Enter' to talk to others like me."
    //         //                 },
    //         //                 {
    //         //                     type: "message",
    //         //                     text: "Some of us will even battle you!"
    //         //                 },
    //         //                 {
    //         //                     type: "battle",
    //         //                     enemyId: "enemy_1"
    //         //                 },
    //         //                 {
    //         //                     type: "message",
    //         //                     text: "Dang, you are strong.",
    //         //                     faceHero: "npc1"
    //         //                 },
    //         //                 {
    //         //                     type: "addStoryFlag",
    //         //                     flag: "BATTLE_1_COMPLETE"
    //         //                 }
    //         //             ]
    //         //         }
    //         //     ]
    //         // },
    //         // npc2: {
    //         //     type: "Character",
    //         //     x: utils.withGrid(2),
    //         //     y: utils.withGrid(8),
    //         //     src: "assets/img/characters/npc1.png",
    //         //     actions: [{
    //         //         events: [{
    //         //             type: "message",
    //         //             text: "That door down there takes you another room.",
    //         //             faceHero: "npc2"
    //         //         }, ]
    //         //     }],
    //         //     behaviorLoop: [{
    //         //             type: "stand",
    //         //             direction: "up",
    //         //             time: 3000
    //         //         },
    //         //         {
    //         //             type: "stand",
    //         //             direction: "right",
    //         //             time: 3800
    //         //         },
    //         //     ],
    //         // },
    //         // collectableItem: new Collectable ({
    //         //     x: utils.withGrid(4),
    //         //     y: utils.withGrid(10)
    //         // }),
    //     },
    //     walls: {
    //         //"16,16": true
    //         // [utils.asGridCoord(0, 8)]: true,
    //     },
    //     sceneSpaces: {
    //         [utils.asGridCoord(3, 10)]: [{
    //             actions: [{
    //                 events: [
    //                     // {who: "npc1", type: "walk", direction: "up"},
    //                     {
    //                         type: "changeMap",
    //                         map: "TestRoom2",
    //                         x: utils.withGrid(3),
    //                         y: utils.withGrid(10),
    //                         direction: "up"
    //                     }
    //                 ]
    //             }]
    //         }]
    //     }
    // },
    Intro: {
        id: "Intro",
        name: "Intro",
        lowerSrc: "assets/img/maps/intro_lower.png",
        upperSrc: "assets/img/maps/intro_upper.png",
        configObjects: {
            hero: {
                type: "Character",
                isPlayerControlled: true,
                hasShadow: true,
                x: utils.withGrid(4),
                y: utils.withGrid(10),
                src: "assets/img/characters/hero.png"
            },
            penny: {
                type: "Character",
                hasShadow: true,
                x: utils.withGrid(5),
                y: utils.withGrid(6),
                src: "assets/img/characters/penny.png",
                // behaviorLoop: [{
                //         type: "walk",
                //         direction: "up",
                //     },
                //     {
                //         type: "walk",
                //         direction: "left",
                //     },
            //         {
            //             type: "stand",
            //             direction: "right",
            //             time: 3200
            //         },
            //         {
            //             type: "stand",
            //             direction: "left",
            //             time: 4300
            //         },
                // ],
                actions: [{
            //             // use array to add multiple events that need to be completed in order for trigger
            //             required: ["BATTLE_1_COMPLETE"],
            //             events: [{
            //                 type: "message",
            //                 text: "Dang, you are strong.",
            //                 faceHero: "npc1"
            //             }]
            //         },
            //         {
                        events: [{
                                type: "message",
                                text: "It's good to meet you.",
                                faceHero: "penny"
                            },
            //                 {
            //                     type: "message",
            //                     text: "You can press 'Enter' to talk to others like me."
            //                 },
            //                 {
            //                     type: "message",
            //                     text: "Some of us will even battle you!"
            //                 },
            //                 {
            //                     type: "battle",
            //                     enemyId: "enemy_1"
            //                 },
            //                 {
            //                     type: "message",
            //                     text: "Dang, you are strong.",
            //                     faceHero: "npc1"
            //                 },
            //                 {
            //                     type: "addStoryFlag",
            //                     flag: "BATTLE_1_COMPLETE"
            //                 }
                        ]
                    }
                ]
            },
            lucy: {
                type: "Character",
                hasShadow: true,
                x: utils.withGrid(5),
                y: utils.withGrid(10),
                src: "assets/img/characters/lucy.png",
                behaviorLoop: [{
                        type: "stand",
                        direction: "left",
                        time: 3800
                    },
                    {
                        type: "stand",
                        direction: "up",
                        time: 1800
                    },
                    {
                        type: "stand",
                        direction: "left",
                        time: 3200
                    },
                    {
                        type: "stand",
                        direction: "down",
                        time: 4300
                    },
                ],
                actions: [{
                    events: [{
                        type: "message",
                        text: "I have a strange feeling about this place.",
                        faceHero: "lucy"
                    }, ]
                }],
            },
            chad: {
                type: "Character",
                hasShadow: true,
                x: utils.withGrid(6),
                y: utils.withGrid(10),
                src: "assets/img/characters/chad.png",
                behaviorLoop: [{
                        type: "stand",
                        direction: "left",
                        time: 9800
                    },
                ],
                actions: [{
                    events: [{
                        type: "message",
                        text: "This place is weird.",
                        faceHero: "chad"
                    }, ]
                }],
            },
            reese: {
                type: "Character",
                hasShadow: true,
                x: utils.withGrid(7),
                y: utils.withGrid(10),
                src: "assets/img/characters/reese.png",
                behaviorLoop: [{
                        type: "stand",
                        direction: "left",
                        time: 2800
                    },
                    {
                        type: "stand",
                        direction: "up",
                        time: 5800
                    },
                    {
                        type: "stand",
                        direction: "left",
                        time: 9200
                    },
                ],
                actions: [{
                    events: [{
                        type: "message",
                        text: "... ... ...",
                        faceHero: "reese"
                    }, ]
                }],
            },
            paisley: {
                type: "Character",
                hasShadow: true,
                x: utils.withGrid(7),
                y: utils.withGrid(11),
                src: "assets/img/characters/paisley.png",
                behaviorLoop: [{
                        type: "stand",
                        direction: "up",
                        time: 9800
                    },
                ],
                actions: [{
                    events: [{
                        type: "message",
                        text: "What is this place? Where am I? All I remember playing a video game and then...",
                        faceHero: "paisley"
                    }, ]
                }],
            },
            alexander: {
                type: "Character",
                hasShadow: true,
                x: utils.withGrid(7),
                y: utils.withGrid(12),
                src: "assets/img/characters/alexander.png",
                behaviorLoop: [{
                        type: "stand",
                        direction: "up",
                        time: 6800
                    },
                    {
                        type: "stand",
                        direction: "right",
                        time: 1200
                    },
                    {
                        type: "stand",
                        direction: "up",
                        time: 7300
                    },
                ],
                actions: [{
                    events: [{
                        type: "message",
                        text: "I think that lady in a white coat is waiting for you.",
                        faceHero: "alexander"
                    }, ]
                }],
            },
            reese2: {
                type: "Character",
                hasShadow: true,
                x: utils.withGrid(6),
                y: utils.withGrid(12),
                src: "assets/img/characters/reese.png",
                behaviorLoop: [{
                        type: "stand",
                        direction: "right",
                        time: 9800
                    },
                    {
                        type: "stand",
                        direction: "up",
                        time: 1800
                    },
                ],
                actions: [{
                    events: [{
                        type: "message",
                        text: "I hope this doesn't take long, I need to walk my dog soon.",
                        faceHero: "reese2"
                    }], 
                }],
            },
            // collectableItem: new Collectable ({
            //     x: utils.withGrid(4),
            //     y: utils.withGrid(10)
            // }),
        },
        walls: {
            //"16,16": true
            [utils.asGridCoord(0, 3)]: true,
            [utils.asGridCoord(1, 4)]: true,
            [utils.asGridCoord(0, 5)]: true,
            [utils.asGridCoord(0, 6)]: true,
            [utils.asGridCoord(1, 7)]: true,
            [utils.asGridCoord(0, 8)]: true,
            [utils.asGridCoord(0, 9)]: true,
            [utils.asGridCoord(1, 2)]: true,
            [utils.asGridCoord(2, 2)]: true,
            [utils.asGridCoord(3, 3)]: true,
            [utils.asGridCoord(4, 3)]: true,
            [utils.asGridCoord(5, 3)]: true,
            [utils.asGridCoord(6, 3)]: true,
            [utils.asGridCoord(7, 3)]: true,
            [utils.asGridCoord(8, 3)]: true,
            [utils.asGridCoord(9, 4)]: true,
            [utils.asGridCoord(10, 5)]: true,
            [utils.asGridCoord(10, 6)]: true,
            [utils.asGridCoord(9, 7)]: true,
            [utils.asGridCoord(10, 8)]: true,
            [utils.asGridCoord(10, 9)]: true,
            [utils.asGridCoord(9, 10)]: true,
            [utils.asGridCoord(10, 11)]: true,
            [utils.asGridCoord(10, 12)]: true,
            [utils.asGridCoord(9, 13)]: true,
            [utils.asGridCoord(10, 14)]: true,
            [utils.asGridCoord(10, 15)]: true,
            [utils.asGridCoord(9, 16)]: true,
            [utils.asGridCoord(8, 16)]: true,
            [utils.asGridCoord(7, 16)]: true,
            [utils.asGridCoord(6, 16)]: true,
            [utils.asGridCoord(5, 17)]: true,
            [utils.asGridCoord(4, 16)]: true,
            [utils.asGridCoord(3, 16)]: true,
            [utils.asGridCoord(2, 16)]: true,
            [utils.asGridCoord(1, 16)]: true,
            [utils.asGridCoord(0, 15)]: true,
            [utils.asGridCoord(0, 14)]: true,
            [utils.asGridCoord(1, 13)]: true,
            [utils.asGridCoord(0, 12)]: true,
            [utils.asGridCoord(0, 11)]: true,
            [utils.asGridCoord(1, 10)]: true,
            // Desk
            [utils.asGridCoord(4, 6)]: true,
            [utils.asGridCoord(4, 7)]: true,
            [utils.asGridCoord(5, 7)]: true,
            [utils.asGridCoord(6, 7)]: true,
            [utils.asGridCoord(6, 6)]: true,
            // Line Seperator 
            [utils.asGridCoord(4, 11)]: true,
            [utils.asGridCoord(5, 11)]: true,
            [utils.asGridCoord(6, 11)]: true,
            
        },
        sceneSpaces: {
            [utils.asGridCoord(5, 16)]: [{
                actions: [{
                    events: [
                        // {who: "hero", type: "walk", direction: "up"},
                        {
                            type: "changeMap",
                            map: "Room_1",
                            x: utils.withGrid(8),
                            y: utils.withGrid(3),
                            direction: "down"
                        }
                    ]
                }]
            }]
        },
        openingScenes: {
            events: [
                { who: "penny", type: "message",  text: "Next!" },
                { who: "penny", type: "message",  text: "I said NEXT!" },
                { who: "penny", type: "message",  text: "Hey you!" },
                { who: "penny", type: "message",  text: "Yeah you! Please approach my desk." },
                { who: "hero", type: "walk",  direction: "up"},
                { who: "hero", type: "walk",  direction: "up"},
                { who: "hero", type: "walk",  direction: "right"},
                { who: "hero", type: "stand",  direction: "up"},

                // Line moves forward
                { who: "lucy", type: "walk",  direction: "left" },
                { who: "chad", type: "walk",  direction: "left" },
                { who: "reese", type: "walk",  direction: "left" },
                { who: "paisley", type: "walk",  direction: "up" },
                { who: "alexander", type: "walk",  direction: "up" },
                { who: "reese2", type: "walk",  direction: "right" },
                { who: "reese2", type: "stand",  direction: "up" },

                { who: "penny", type: "message",  text: "I have a task for you." },
                { who: "penny", type: "message",  text: "Please follow me." },

                { who: "penny", type: "walk",  direction: "up" },
                { who: "penny", type: "walk",  direction: "left" },
                { who: "penny", type: "walk",  direction: "left" },
                { who: "penny", type: "walk",  direction: "down" },
                { who: "penny", type: "walk",  direction: "down" },
                { who: "penny", type: "walk",  direction: "down" },
                { who: "penny", type: "walk",  direction: "down" },
                { who: "penny", type: "walk",  direction: "down" },
                { who: "penny", type: "walk",  direction: "down" },
                { who: "penny", type: "walk",  direction: "down" },
                { who: "penny", type: "walk",  direction: "down" },
                { who: "penny", type: "walk",  direction: "down" },
                { who: "penny", type: "walk",  direction: "down" },
                { who: "penny", type: "stand",  direction: "down", time: 1000 },
                { who: "penny", type: "walk",  direction: "up" },
                { who: "penny", type: "walk",  direction: "up" },
                { who: "penny", type: "walk",  direction: "up" },
                { who: "penny", type: "walk",  direction: "up" },
                { who: "penny", type: "walk",  direction: "up" },
                { who: "penny", type: "message",  text: "Are you coming?" },
                { who: "penny", type: "walk",  direction: "down" },
                { who: "penny", type: "walk",  direction: "down" },
                { who: "penny", type: "walk",  direction: "down" },
                { who: "penny", type: "walk",  direction: "down" },
                { who: "penny", type: "walk",  direction: "down" },
                { who: "penny", type: "walk",  direction: "right" },
                { who: "penny", type: "stand",  direction: "up" },
                { type: "addStoryFlag", flag: "Intro_COMPLETE"}
            ]
        }
    },
    Room_1: {
        id: "Room_1",
        name: "Room 1",
        lowerSrc: "assets/img/maps/room_1.png",
        upperSrc: "",
        configObjects: {
            hero: {
                type: "Character",
                isPlayerControlled: true,
                hasShadow: true,
                x: utils.withGrid(6),
                y: utils.withGrid(6),
                src: "assets/img/characters/hero.png",
                direction: "down"
            },
            npc1: {
                type: "Character",
                hasShadow: true,
                x: utils.withGrid(4),
                y: utils.withGrid(5),
                src: "assets/img/characters/npc1.png",
                required: ["BATTLE_1_COMPLETE"],
                actions: [{
                        // use array to add multiple events that need to be completed in order for trigger
                        required: ["BATTLE_2_COMPLETE"],
                        events: [{
                            type: "message",
                            text: "Dang.",
                            faceHero: "npc1"
                        }]
                    },
                    {
                        events: [{
                                type: "message",
                                text: "You can see me if you fight npc2",
                                faceHero: "npc1"
                            },
                            {
                                type: "battle",
                                enemyId: "enemy_1"
                            },
                            {
                                type: "message",
                                text: "Dang.",
                                faceHero: "npc1"
                            },
                            {
                                type: "addStoryFlag",
                                flag: "BATTLE_2_COMPLETE"
                            }
                        ]
                    }
                ]
            },
            npc2: {
                type: "Character",
                hasShadow: true,
                x: utils.withGrid(7),
                y: utils.withGrid(9),
                src: "assets/img/characters/npc1.png",
                behaviorLoop: [{
                        type: "stand",
                        direction: "left",
                        time: 3800
                    },
                    {
                        type: "stand",
                        direction: "up",
                        time: 1800
                    },
                    {
                        type: "stand",
                        direction: "right",
                        time: 3200
                    },
                    {
                        type: "stand",
                        direction: "left",
                        time: 4300
                    },
                ],
                actions: [{
                        // use array to add multiple events that need to be completed in order for trigger
                        required: ["BATTLE_1_COMPLETE"],
                        events: [{
                            type: "message",
                            text: "Dang, you are strong.",
                            faceHero: "npc2"
                        }]
                    },
                    {
                        events: [{
                                type: "message",
                                text: "It's good to meet you.",
                                faceHero: "npc2"
                            },
                            {
                                type: "message",
                                text: "You can press 'Enter' to talk to others like me."
                            },
                            {
                                type: "message",
                                text: "Some of us will even battle you!"
                            },
                            {
                                type: "battle",
                                enemyId: "enemy_1"
                            },
                            {
                                type: "message",
                                text: "Dang, you are strong.",
                                faceHero: "npc2"
                            },
                            {
                                type: "addStoryFlag",
                                flag: "BATTLE_1_COMPLETE"
                            }
                        ]
                    }
                ]
            },
        },
        walls: {
            //"16,16": true
            [utils.asGridCoord(2, 2)]: true,
            [utils.asGridCoord(3, 2)]: true,
            [utils.asGridCoord(4, 2)]: true,
            [utils.asGridCoord(5, 2)]: true,
            [utils.asGridCoord(6, 3)]: true,
            [utils.asGridCoord(7, 2)]: true,
            [utils.asGridCoord(8, 1)]: true,
            [utils.asGridCoord(9, 2)]: true,
            [utils.asGridCoord(10, 2)]: true,
            [utils.asGridCoord(11, 2)]: true,
            [utils.asGridCoord(12, 2)]: true,
            [utils.asGridCoord(13, 3)]: true,
            [utils.asGridCoord(13, 4)]: true,
            [utils.asGridCoord(13, 5)]: true,
            [utils.asGridCoord(13, 6)]: true,
            [utils.asGridCoord(14, 7)]: true,
            [utils.asGridCoord(13, 8)]: true,
            [utils.asGridCoord(13, 9)]: true,
            [utils.asGridCoord(12, 10)]: true,
            [utils.asGridCoord(11, 10)]: true,
            [utils.asGridCoord(10, 10)]: true,
            [utils.asGridCoord(9, 10)]: true,
            [utils.asGridCoord(8, 10)]: true,
            [utils.asGridCoord(7, 10)]: true,
            [utils.asGridCoord(6, 10)]: true,
            [utils.asGridCoord(5, 10)]: true,
            [utils.asGridCoord(4, 11)]: true,
            [utils.asGridCoord(3, 10)]: true,
            [utils.asGridCoord(2, 10)]: true,
            [utils.asGridCoord(1, 9)]: true,
            [utils.asGridCoord(1, 8)]: true,
            [utils.asGridCoord(1, 7)]: true,
            [utils.asGridCoord(1, 6)]: true,
            [utils.asGridCoord(0, 5)]: true,
            [utils.asGridCoord(1, 4)]: true,
            [utils.asGridCoord(1, 3)]: true,

        },
        sceneSpaces: {
            [utils.asGridCoord(8, 2)]: [{
                actions: [{
                    events: [
                        // {who: "hero", type: "walk", direction: "up"},
                        {
                            type: "changeMap",
                            map: "Intro",
                            x: utils.withGrid(5),
                            y: utils.withGrid(15),
                            direction: "up"
                        }
                    ]
                }]
            }],
            [utils.asGridCoord(13, 7)]: [{
                actions: [{
                    events: [
                        // {who: "hero", type: "walk", direction: "up"},
                        {
                            type: "changeMap",
                            map: "Library_Room",
                            x: utils.withGrid(1),
                            y: utils.withGrid(5),
                            direction: "right"
                        }
                    ]
                }]
            }],
            [utils.asGridCoord(1, 5)]: [{
                actions: [{
                    events: [
                        // {who: "hero", type: "walk", direction: "up"},
                        {
                            type: "changeMap",
                            map: "Lamp_Room_Light",
                            x: utils.withGrid(13),
                            y: utils.withGrid(7),
                            direction: "left"
                        }
                    ]
                }]
            }],
            [utils.asGridCoord(4, 10)]: [{
                actions: [{
                    required: ["BATTLE_1_COMPLETE"],
                    events: [
                        {
                            type: "changeMap",
                            map: "Room_4",
                            x: utils.withGrid(8),
                            y: utils.withGrid(2),
                            direction: "down"
                        }
                    ]
                },
                {
                  events: [
                    {
                        type: "changeMap",
                        map: "Foliage_Room",
                        x: utils.withGrid(8),
                        y: utils.withGrid(2),
                        direction: "down"
                    }
                  ]  
                }]
            }],
        },
        openingScenes: {
            events: [
                { type: "message",  text: "Room 1" },
                { type: "addStoryFlag", flag: "Room_1_COMPLETE"}
            ]
        }
    },
    Room_2: {
        id: "Room_2",
        name: "Room 2",
        lowerSrc: "assets/img/maps/room_1.png",
        upperSrc: "",
        configObjects: {
            hero: {
                type: "Character",
                isPlayerControlled: true,
                hasShadow: true,
                x: utils.withGrid(5),
                y: utils.withGrid(10),
                src: "assets/img/characters/hero.png",
                direction: "up"
            },
            npc1: {
                type: "Character",
                hasShadow: true,
                x: utils.withGrid(7),
                y: utils.withGrid(9),
                src: "assets/img/characters/npc1.png",
                behaviorLoop: [{
                        type: "stand",
                        direction: "left",
                        time: 3800
                    },
                    {
                        type: "stand",
                        direction: "up",
                        time: 1800
                    },
                    {
                        type: "stand",
                        direction: "right",
                        time: 3200
                    },
                    {
                        type: "stand",
                        direction: "left",
                        time: 4300
                    },
                ],
                actions: [{
                        // use array to add multiple events that need to be completed in order for trigger
                        required: ["BATTLE_1_COMPLETE"],
                        events: [{
                            type: "message",
                            text: "Dang, you are strong.",
                            faceHero: "npc1"
                        }]
                    },
                    {
                        events: [{
                                type: "message",
                                text: "It's good to meet you.",
                                faceHero: "npc1"
                            },
                            {
                                type: "message",
                                text: "You can press 'Enter' to talk to others like me."
                            },
                            {
                                type: "message",
                                text: "Some of us will even battle you!"
                            },
                            {
                                type: "battle",
                                enemyId: "enemy_1"
                            },
                            {
                                type: "message",
                                text: "Dang, you are strong.",
                                faceHero: "npc1"
                            },
                            {
                                type: "addStoryFlag",
                                flag: "BATTLE_1_COMPLETE"
                            }
                        ]
                    }
                ]
            },
        },
        walls: {
            //"16,16": true
            [utils.asGridCoord(2, 2)]: true,
            [utils.asGridCoord(3, 2)]: true,
            [utils.asGridCoord(4, 2)]: true,
            [utils.asGridCoord(5, 2)]: true,
            [utils.asGridCoord(6, 3)]: true,
            [utils.asGridCoord(7, 2)]: true,
            [utils.asGridCoord(8, 1)]: true,
            [utils.asGridCoord(9, 2)]: true,
            [utils.asGridCoord(10, 2)]: true,
            [utils.asGridCoord(11, 2)]: true,
            [utils.asGridCoord(12, 2)]: true,
            [utils.asGridCoord(13, 3)]: true,
            [utils.asGridCoord(13, 4)]: true,
            [utils.asGridCoord(13, 5)]: true,
            [utils.asGridCoord(13, 6)]: true,
            [utils.asGridCoord(14, 7)]: true,
            [utils.asGridCoord(13, 8)]: true,
            [utils.asGridCoord(13, 9)]: true,
            [utils.asGridCoord(12, 10)]: true,
            [utils.asGridCoord(11, 10)]: true,
            [utils.asGridCoord(10, 10)]: true,
            [utils.asGridCoord(9, 10)]: true,
            [utils.asGridCoord(8, 10)]: true,
            [utils.asGridCoord(7, 10)]: true,
            [utils.asGridCoord(6, 10)]: true,
            [utils.asGridCoord(5, 10)]: true,
            [utils.asGridCoord(4, 11)]: true,
            [utils.asGridCoord(3, 10)]: true,
            [utils.asGridCoord(2, 10)]: true,
            [utils.asGridCoord(1, 9)]: true,
            [utils.asGridCoord(1, 8)]: true,
            [utils.asGridCoord(1, 7)]: true,
            [utils.asGridCoord(1, 6)]: true,
            [utils.asGridCoord(0, 5)]: true,
            [utils.asGridCoord(1, 4)]: true,
            [utils.asGridCoord(1, 3)]: true,

        },
        sceneSpaces: {
            [utils.asGridCoord(8, 2)]: [{
                actions: [{
                    events: [
                        // {who: "hero", type: "walk", direction: "up"},
                        {
                            type: "changeMap",
                            map: "Intro",
                            x: utils.withGrid(5),
                            y: utils.withGrid(15),
                            direction: "up"
                        }
                    ]
                }]
            }]
        },
        openingScenes: {
            events: [
                { type: "message",  text: "Room 1" },
                { type: "addStoryFlag", flag: "Room_1_COMPLETE"}
            ]
        }
    },
    Room_3: {
        id: "Room_3",
        name: "Room 3",
        lowerSrc: "assets/img/maps/room_1.png",
        upperSrc: "",
        configObjects: {
            hero: {
                type: "Character",
                isPlayerControlled: true,
                hasShadow: true,
                x: utils.withGrid(5),
                y: utils.withGrid(10),
                src: "assets/img/characters/hero.png",
                direction: "up"
            },
            npc1: {
                type: "Character",
                hasShadow: true,
                x: utils.withGrid(7),
                y: utils.withGrid(9),
                src: "assets/img/characters/npc1.png",
                behaviorLoop: [{
                        type: "stand",
                        direction: "left",
                        time: 3800
                    },
                    {
                        type: "stand",
                        direction: "up",
                        time: 1800
                    },
                    {
                        type: "stand",
                        direction: "right",
                        time: 3200
                    },
                    {
                        type: "stand",
                        direction: "left",
                        time: 4300
                    },
                ],
                actions: [{
                        // use array to add multiple events that need to be completed in order for trigger
                        required: ["BATTLE_1_COMPLETE"],
                        events: [{
                            type: "message",
                            text: "Dang, you are strong.",
                            faceHero: "npc1"
                        }]
                    },
                    {
                        events: [{
                                type: "message",
                                text: "It's good to meet you.",
                                faceHero: "npc1"
                            },
                            {
                                type: "message",
                                text: "You can press 'Enter' to talk to others like me."
                            },
                            {
                                type: "message",
                                text: "Some of us will even battle you!"
                            },
                            {
                                type: "battle",
                                enemyId: "enemy_1"
                            },
                            {
                                type: "message",
                                text: "Dang, you are strong.",
                                faceHero: "npc1"
                            },
                            {
                                type: "addStoryFlag",
                                flag: "BATTLE_1_COMPLETE"
                            }
                        ]
                    }
                ]
            },
        },
        walls: {
            //"16,16": true
            [utils.asGridCoord(2, 2)]: true,
            [utils.asGridCoord(3, 2)]: true,
            [utils.asGridCoord(4, 2)]: true,
            [utils.asGridCoord(5, 2)]: true,
            [utils.asGridCoord(6, 3)]: true,
            [utils.asGridCoord(7, 2)]: true,
            [utils.asGridCoord(8, 1)]: true,
            [utils.asGridCoord(9, 2)]: true,
            [utils.asGridCoord(10, 2)]: true,
            [utils.asGridCoord(11, 2)]: true,
            [utils.asGridCoord(12, 2)]: true,
            [utils.asGridCoord(13, 3)]: true,
            [utils.asGridCoord(13, 4)]: true,
            [utils.asGridCoord(13, 5)]: true,
            [utils.asGridCoord(13, 6)]: true,
            [utils.asGridCoord(14, 7)]: true,
            [utils.asGridCoord(13, 8)]: true,
            [utils.asGridCoord(13, 9)]: true,
            [utils.asGridCoord(12, 10)]: true,
            [utils.asGridCoord(11, 10)]: true,
            [utils.asGridCoord(10, 10)]: true,
            [utils.asGridCoord(9, 10)]: true,
            [utils.asGridCoord(8, 10)]: true,
            [utils.asGridCoord(7, 10)]: true,
            [utils.asGridCoord(6, 10)]: true,
            [utils.asGridCoord(5, 10)]: true,
            [utils.asGridCoord(4, 11)]: true,
            [utils.asGridCoord(3, 10)]: true,
            [utils.asGridCoord(2, 10)]: true,
            [utils.asGridCoord(1, 9)]: true,
            [utils.asGridCoord(1, 8)]: true,
            [utils.asGridCoord(1, 7)]: true,
            [utils.asGridCoord(1, 6)]: true,
            [utils.asGridCoord(0, 5)]: true,
            [utils.asGridCoord(1, 4)]: true,
            [utils.asGridCoord(1, 3)]: true,

        },
        sceneSpaces: {
            [utils.asGridCoord(8, 2)]: [{
                actions: [{
                    events: [
                        // {who: "hero", type: "walk", direction: "up"},
                        {
                            type: "changeMap",
                            map: "Intro",
                            x: utils.withGrid(5),
                            y: utils.withGrid(15),
                            direction: "up"
                        }
                    ]
                }]
            }]
        },
        openingScenes: {
            events: [
                { type: "message",  text: "Room 1" },
                { type: "addStoryFlag", flag: "Room_1_COMPLETE"}
            ]
        }
    },
    Room_4: {
        id: "Room_4",
        name: "Room 4",
        lowerSrc: "assets/img/maps/room_4_lower.png",
        upperSrc: "assets/img/maps/room_4_upper.png",
        configObjects: {
            hero: {
                type: "Character",
                isPlayerControlled: true,
                hasShadow: true,
                x: utils.withGrid(5),
                y: utils.withGrid(10),
                src: "assets/img/characters/hero.png",
                direction: "up"
            }
        },
        walls: {
            //"16,16": true
            [utils.asGridCoord(1, 2)]: true,
            [utils.asGridCoord(2, 2)]: true,
            [utils.asGridCoord(3, 2)]: true,
            [utils.asGridCoord(4, 2)]: true,
            [utils.asGridCoord(5, 2)]: true,
            [utils.asGridCoord(6, 3)]: true,
            [utils.asGridCoord(7, 3)]: true,
            [utils.asGridCoord(7, 2)]: true,
            [utils.asGridCoord(8, 1)]: true,
            [utils.asGridCoord(9, 2)]: true,
            [utils.asGridCoord(9, 3)]: true,
            [utils.asGridCoord(10, 2)]: true,
            [utils.asGridCoord(11, 2)]: true,
            [utils.asGridCoord(12, 3)]: true,
            [utils.asGridCoord(12, 4)]: true,
            [utils.asGridCoord(12, 5)]: true,
            [utils.asGridCoord(12, 6)]: true,
            [utils.asGridCoord(12, 7)]: true,
            [utils.asGridCoord(12, 8)]: true,
            [utils.asGridCoord(12, 9)]: true,
            [utils.asGridCoord(11, 10)]: true,
            [utils.asGridCoord(10, 10)]: true,
            [utils.asGridCoord(9, 10)]: true,
            [utils.asGridCoord(8, 10)]: true,
            [utils.asGridCoord(7, 10)]: true,
            [utils.asGridCoord(6, 10)]: true,
            [utils.asGridCoord(5, 10)]: true,
            [utils.asGridCoord(4, 10)]: true,
            [utils.asGridCoord(3, 11)]: true,
            [utils.asGridCoord(2, 10)]: true,
            [utils.asGridCoord(1, 10)]: true,
            [utils.asGridCoord(0, 9)]: true,
            [utils.asGridCoord(0, 8)]: true,
            [utils.asGridCoord(0, 7)]: true,
            [utils.asGridCoord(0, 6)]: true,
            [utils.asGridCoord(0, 5)]: true,
            [utils.asGridCoord(0, 4)]: true,
            [utils.asGridCoord(0, 3)]: true,
        },
        sceneSpaces: {
            [utils.asGridCoord(8, 2)]: [{
                actions: [{
                    events: [
                        // {who: "hero", type: "walk", direction: "up"},
                        {
                            type: "changeMap",
                            map: "Room_1",
                            x: utils.withGrid(4),
                            y: utils.withGrid(10),
                            direction: "up"
                        }
                    ]
                }]
            }]
        },
        openingScenes: {
            events: [
                { type: "message",  text: "Room 4" },
                { type: "addStoryFlag", flag: "Room_4_COMPLETE"}
            ]
        }
    },
    Lamp_Room_Light: {
        id: "Lamp_Room_Light",
        name: "Lamp Room",
        lowerSrc: "assets/img/maps/lamp_room_light_lower.png",
        upperSrc: "assets/img/maps/lamp_room_light_upper.png",
        configObjects: {
            hero: {
                type: "Character",
                isPlayerControlled: true,
                hasShadow: true,
                x: utils.withGrid(5),
                y: utils.withGrid(10),
                src: "assets/img/characters/hero.png",
                direction: "up"
            },
        },
        walls: {
            //"16,16": true
            [utils.asGridCoord(2, 2)]: true,
            [utils.asGridCoord(3, 2)]: true,
            [utils.asGridCoord(4, 2)]: true,
            [utils.asGridCoord(5, 2)]: true,
            [utils.asGridCoord(6, 2)]: true,
            [utils.asGridCoord(7, 2)]: true,
            [utils.asGridCoord(8, 1)]: true,
            [utils.asGridCoord(9, 2)]: true,
            [utils.asGridCoord(10, 2)]: true,
            [utils.asGridCoord(11, 2)]: true,
            [utils.asGridCoord(12, 2)]: true,
            [utils.asGridCoord(13, 3)]: true,
            [utils.asGridCoord(13, 4)]: true,
            [utils.asGridCoord(13, 5)]: true,
            [utils.asGridCoord(13, 6)]: true,
            [utils.asGridCoord(14, 7)]: true,
            [utils.asGridCoord(13, 8)]: true,
            [utils.asGridCoord(13, 9)]: true,
            [utils.asGridCoord(13, 10)]: true,
            [utils.asGridCoord(13, 11)]: true,
            [utils.asGridCoord(13, 12)]: true,
            [utils.asGridCoord(12, 13)]: true,
            [utils.asGridCoord(11, 13)]: true,
            [utils.asGridCoord(10, 13)]: true,
            [utils.asGridCoord(9, 13)]: true,
            [utils.asGridCoord(8, 13)]: true,
            [utils.asGridCoord(7, 13)]: true,
            [utils.asGridCoord(6, 13)]: true,
            [utils.asGridCoord(5, 13)]: true,
            [utils.asGridCoord(4, 13)]: true,
            [utils.asGridCoord(3, 13)]: true,
            [utils.asGridCoord(2, 13)]: true,
            [utils.asGridCoord(1, 12)]: true,
            [utils.asGridCoord(1, 11)]: true,
            [utils.asGridCoord(1, 10)]: true,
            [utils.asGridCoord(1, 9)]: true,
            [utils.asGridCoord(1, 8)]: true,
            [utils.asGridCoord(0, 7)]: true,
            [utils.asGridCoord(1, 6)]: true,
            [utils.asGridCoord(1, 5)]: true,
            [utils.asGridCoord(1, 4)]: true,
            [utils.asGridCoord(1, 3)]: true,
        },
        sceneSpaces: {
            [utils.asGridCoord(13, 7)]: [{
                actions: [{
                    events: [
                        // {who: "hero", type: "walk", direction: "up"},
                        {
                            type: "changeMap",
                            map: "Room_1",
                            x: utils.withGrid(1),
                            y: utils.withGrid(5),
                            direction: "right"
                        }
                    ]
                }]
            }],
            [utils.asGridCoord(1, 7)]: [{
                actions: [{
                    events: [
                        // {who: "hero", type: "walk", direction: "up"},
                        {
                            type: "changeMap",
                            map: "Foliage_Room",
                            x: utils.withGrid(15),
                            y: utils.withGrid(6),
                            direction: "left"
                        }
                    ]
                }]
            }]
        },
        openingScenes: {
            events: [
                { type: "message",  text: "Lamp Room" },
                { type: "addStoryFlag", flag: "Lamp_Room_Light_COMPLETE"}
            ]
        }
    },
    Lamp_Room_Dark: {
        id: "Lamp_Room_Dark",
        name: "Lamp Room",
        lowerSrc: "assets/img/maps/lamp_room_dark_lower.png",
        upperSrc: "assets/img/maps/lamp_room_dark_upper.png",
        configObjects: {
            hero: {
                type: "Character",
                isPlayerControlled: true,
                hasShadow: true,
                x: utils.withGrid(5),
                y: utils.withGrid(10),
                src: "assets/img/characters/hero.png",
                direction: "up"
            },
        },
        walls: {
            //"16,16": true
            [utils.asGridCoord(2, 2)]: true,
            [utils.asGridCoord(3, 2)]: true,
            [utils.asGridCoord(4, 2)]: true,
            [utils.asGridCoord(5, 2)]: true,
            [utils.asGridCoord(6, 2)]: true,
            [utils.asGridCoord(7, 2)]: true,
            [utils.asGridCoord(8, 1)]: true,
            [utils.asGridCoord(9, 2)]: true,
            [utils.asGridCoord(10, 2)]: true,
            [utils.asGridCoord(11, 2)]: true,
            [utils.asGridCoord(12, 2)]: true,
            [utils.asGridCoord(13, 3)]: true,
            [utils.asGridCoord(13, 4)]: true,
            [utils.asGridCoord(13, 5)]: true,
            [utils.asGridCoord(13, 6)]: true,
            [utils.asGridCoord(14, 7)]: true,
            [utils.asGridCoord(13, 8)]: true,
            [utils.asGridCoord(13, 9)]: true,
            [utils.asGridCoord(13, 10)]: true,
            [utils.asGridCoord(13, 11)]: true,
            [utils.asGridCoord(13, 12)]: true,
            [utils.asGridCoord(12, 13)]: true,
            [utils.asGridCoord(11, 13)]: true,
            [utils.asGridCoord(10, 13)]: true,
            [utils.asGridCoord(9, 13)]: true,
            [utils.asGridCoord(8, 13)]: true,
            [utils.asGridCoord(7, 13)]: true,
            [utils.asGridCoord(6, 13)]: true,
            [utils.asGridCoord(5, 13)]: true,
            [utils.asGridCoord(4, 13)]: true,
            [utils.asGridCoord(3, 13)]: true,
            [utils.asGridCoord(2, 13)]: true,
            [utils.asGridCoord(1, 12)]: true,
            [utils.asGridCoord(1, 11)]: true,
            [utils.asGridCoord(1, 10)]: true,
            [utils.asGridCoord(1, 9)]: true,
            [utils.asGridCoord(1, 8)]: true,
            [utils.asGridCoord(0, 7)]: true,
            [utils.asGridCoord(1, 6)]: true,
            [utils.asGridCoord(1, 5)]: true,
            [utils.asGridCoord(1, 4)]: true,
            [utils.asGridCoord(1, 3)]: true,
        },
        sceneSpaces: {
            [utils.asGridCoord(13, 7)]: [{
                actions: [{
                    events: [
                        // {who: "hero", type: "walk", direction: "up"},
                        {
                            type: "changeMap",
                            map: "Room_1",
                            x: utils.withGrid(1),
                            y: utils.withGrid(5),
                            direction: "right"
                        }
                    ]
                }]
            }],
            [utils.asGridCoord(1, 7)]: [{
                actions: [{
                    events: [
                        // {who: "hero", type: "walk", direction: "up"},
                        {
                            type: "changeMap",
                            map: "Foliage_Room",
                            x: utils.withGrid(15),
                            y: utils.withGrid(6),
                            direction: "left"
                        }
                    ]
                }]
            }],
        },
        openingScenes: {
            events: [
                { type: "message",  text: "Lamp Room" },
                { type: "addStoryFlag", flag: "Lamp_Room_Dark_COMPLETE"}
            ]
        }
    },
    Library_Room: {
        id: "Library_Room",
        name: "Library Room",
        lowerSrc: "assets/img/maps/library_room_lower.png",
        upperSrc: "assets/img/maps/library_room_upper.png",
        configObjects: {
            hero: {
                type: "Character",
                isPlayerControlled: true,
                hasShadow: true,
                x: utils.withGrid(5),
                y: utils.withGrid(10),
                src: "assets/img/characters/hero.png",
                direction: "up"
            },
            books1: {
                type: "Actionable",
                x: utils.withGrid(3),
                y: utils.withGrid(3),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "There are lots of weird books.",
                    }, ]
                }],
            },
            books2: {
                type: "Actionable",
                x: utils.withGrid(4),
                y: utils.withGrid(3),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "There are lots of weird books.",
                    }, ]
                }],
            },
            books3: {
                type: "Actionable",
                x: utils.withGrid(5),
                y: utils.withGrid(3),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "There are lots of weird books.",
                    }, ]
                }],
            },
            books4: {
                type: "Actionable",
                x: utils.withGrid(7),
                y: utils.withGrid(3),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "There are lots of weird books.",
                    }, ]
                }],
            },
            books5: {
                type: "Actionable",
                x: utils.withGrid(8),
                y: utils.withGrid(3),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "There are lots of weird books.",
                    }, ]
                }],
            },
            books6: {
                type: "Actionable",
                x: utils.withGrid(9),
                y: utils.withGrid(3),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "There are lots of weird books.",
                    }, ]
                }],
            },
            books7: {
                type: "Actionable",
                x: utils.withGrid(11),
                y: utils.withGrid(3),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "There are lots of weird books.",
                    }, ]
                }],
            },
            books8: {
                type: "Actionable",
                x: utils.withGrid(12),
                y: utils.withGrid(3),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "There are lots of weird books.",
                    }, ]
                }],
            },
            books9: {
                type: "Actionable",
                x: utils.withGrid(13),
                y: utils.withGrid(3),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "There are lots of weird books.",
                    }, ]
                }],
            },
            books10: {
                type: "Actionable",
                x: utils.withGrid(3),
                y: utils.withGrid(6),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "There are lots of weird books.",
                    }, ]
                }],
            },
            books11: {
                type: "Actionable",
                x: utils.withGrid(4),
                y: utils.withGrid(6),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "There are lots of weird books.",
                    }, ]
                }],
            },
            books12: {
                type: "Actionable",
                x: utils.withGrid(5),
                y: utils.withGrid(6),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "There are lots of weird books.",
                    }, ]
                }],
            },
            books13: {
                type: "Actionable",
                x: utils.withGrid(7),
                y: utils.withGrid(6),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "There are lots of weird books.",
                    }, ]
                }],
            },
            books14: {
                type: "Actionable",
                x: utils.withGrid(8),
                y: utils.withGrid(6),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "There are lots of weird books.",
                    }, ]
                }],
            },
            books15: {
                type: "Actionable",
                x: utils.withGrid(9),
                y: utils.withGrid(6),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "There are lots of weird books.",
                    }, ]
                }],
            },
            books16: {
                type: "Actionable",
                x: utils.withGrid(11),
                y: utils.withGrid(6),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "There are lots of weird books.",
                    }, ]
                }],
            },
            books17: {
                type: "Actionable",
                x: utils.withGrid(12),
                y: utils.withGrid(6),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "There are lots of weird books.",
                    }, ]
                }],
            },
            books18: {
                type: "Actionable",
                x: utils.withGrid(13),
                y: utils.withGrid(6),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "There are lots of weird books.",
                    }, ]
                }],
            },
            books19: {
                type: "Actionable",
                x: utils.withGrid(3),
                y: utils.withGrid(9),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "There are lots of weird books.",
                    }, ]
                }],
            },
            books20: {
                type: "Actionable",
                x: utils.withGrid(4),
                y: utils.withGrid(9),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "There are lots of weird books.",
                    }, ]
                }],
            },
            books21: {
                type: "Actionable",
                x: utils.withGrid(5),
                y: utils.withGrid(9),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "There are lots of weird books.",
                    }, ]
                }],
            },
            books22: {
                type: "Actionable",
                x: utils.withGrid(7),
                y: utils.withGrid(9),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "There are lots of weird books.",
                    }, ]
                }],
            },
            books23: {
                type: "Actionable",
                x: utils.withGrid(8),
                y: utils.withGrid(9),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "There are lots of weird books.",
                    }, ]
                }],
            },
            books24: {
                type: "Actionable",
                x: utils.withGrid(9),
                y: utils.withGrid(9),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "There are lots of weird books.",
                    }, ]
                }],
            },
            books25: {
                type: "Actionable",
                x: utils.withGrid(11),
                y: utils.withGrid(9),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "There are lots of weird books.",
                    }, ]
                }],
            },
            books26: {
                type: "Actionable",
                x: utils.withGrid(12),
                y: utils.withGrid(9),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "There are lots of weird books.",
                    }, ]
                }],
            },
            books27: {
                type: "Actionable",
                x: utils.withGrid(13),
                y: utils.withGrid(9),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "There are lots of weird books.",
                    }, ]
                }],
            },
            bush1: {
                type: "Actionable",
                x: utils.withGrid(10),
                y: utils.withGrid(3),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a bush.",
                    }, ]
                }],
            },
            bush2: {
                type: "Actionable",
                x: utils.withGrid(6),
                y: utils.withGrid(9),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a bush.",
                    }, ]
                }],
            },
        },
        walls: {
            //"16,16": true
            [utils.asGridCoord(2, 2)]: true,
            [utils.asGridCoord(3, 2)]: true,
            [utils.asGridCoord(4, 2)]: true,
            [utils.asGridCoord(5, 2)]: true,
            [utils.asGridCoord(6, 2)]: true,
            [utils.asGridCoord(7, 2)]: true,
            [utils.asGridCoord(8, 2)]: true,
            [utils.asGridCoord(9, 2)]: true,
            [utils.asGridCoord(10, 2)]: true,
            [utils.asGridCoord(11, 2)]: true,
            [utils.asGridCoord(12, 2)]: true,
            [utils.asGridCoord(13, 2)]: true,
            [utils.asGridCoord(14, 2)]: true,
            [utils.asGridCoord(15, 3)]: true,
            [utils.asGridCoord(15, 4)]: true,
            [utils.asGridCoord(15, 5)]: true,
            [utils.asGridCoord(15, 6)]: true,
            [utils.asGridCoord(15, 7)]: true,
            [utils.asGridCoord(15, 8)]: true,
            [utils.asGridCoord(15, 9)]: true,
            [utils.asGridCoord(15, 10)]: true,
            [utils.asGridCoord(14, 11)]: true,
            [utils.asGridCoord(13, 11)]: true,
            [utils.asGridCoord(12, 11)]: true,
            [utils.asGridCoord(11, 11)]: true,
            [utils.asGridCoord(10, 11)]: true,
            [utils.asGridCoord(9, 11)]: true,
            [utils.asGridCoord(8, 11)]: true,
            [utils.asGridCoord(7, 11)]: true,
            [utils.asGridCoord(6, 11)]: true,
            [utils.asGridCoord(5, 11)]: true,
            [utils.asGridCoord(4, 11)]: true,
            [utils.asGridCoord(3, 11)]: true,
            [utils.asGridCoord(2, 11)]: true,
            [utils.asGridCoord(1, 10)]: true,
            [utils.asGridCoord(1, 9)]: true,
            [utils.asGridCoord(1, 8)]: true,
            [utils.asGridCoord(1, 7)]: true,
            [utils.asGridCoord(1, 6)]: true,
            [utils.asGridCoord(0, 5)]: true,
            [utils.asGridCoord(1, 4)]: true,
            [utils.asGridCoord(1, 3)]: true,
        },
        sceneSpaces: {
            [utils.asGridCoord(1, 5)]: [{
                actions: [{
                    events: [
                        {
                            type: "changeMap",
                            map: "Room_1",
                            x: utils.withGrid(13),
                            y: utils.withGrid(7),
                            direction: "left"
                        }
                    ]
                }]
            }],
        },
        openingScenes: {
            events: [
                { type: "message",  text: "Library Room" },
                { type: "addStoryFlag", flag: "Library_Room_COMPLETE"}
            ]
        }
    },
    Foliage_Room: {
        id: "Foliage_Room",
        name: "Foliage Room",
        lowerSrc: "assets/img/maps/foliage_room_lower.png",
        upperSrc: "assets/img/maps/foliage_room_upper.png",
        configObjects: {
            hero: {
                type: "Character",
                isPlayerControlled: true,
                hasShadow: true,
                x: utils.withGrid(5),
                y: utils.withGrid(10),
                src: "assets/img/characters/hero.png",
                direction: "up"
            },
            npc1: {
                type: "Character",
                hasShadow: true,
                x: utils.withGrid(13),
                y: utils.withGrid(3),
                src: "assets/img/characters/chad.png",
                direction: "down",
                actions: [{
                    // use array to add multiple events that need to be completed in order for trigger
                    required: ["Foliage_Room_BATTLE_1_COMPLETE"],
                    events: [{
                        type: "message",
                        text: "I need to water some more plants.",
                        faceHero: "npc1"
                    }]
                },
                {
                    events: [{
                            type: "message",
                            text: "Help I'm lost!",
                            faceHero: "npc1"
                        },
                        {
                            type: "battle",
                            enemyId: "enemy_1"
                        },
                        {
                            type: "message",
                            text: "I need to water some more plants.",
                            faceHero: "npc1"
                        },
                        {
                            type: "addStoryFlag",
                            flag: "Foliage_Room_BATTLE_1_COMPLETE"
                        }
                    ]
                }
            ]
            },
            npc2: {
                type: "Character",
                hasShadow: true,
                x: utils.withGrid(9),
                y: utils.withGrid(5),
                src: "assets/img/characters/chad.png",
                direction: "down"
            },
            npc3: {
                type: "Character",
                hasShadow: true,
                x: utils.withGrid(7),
                y: utils.withGrid(6),
                src: "assets/img/characters/chad.png",
                direction: "right"
            },
            npc4: {
                type: "Character",
                hasShadow: true,
                x: utils.withGrid(2),
                y: utils.withGrid(7),
                src: "assets/img/characters/chad.png",
                direction: "right"
            },
            npc5: {
                type: "Character",
                hasShadow: true,
                x: utils.withGrid(11),
                y: utils.withGrid(8),
                src: "assets/img/characters/chad.png",
                direction: "left"
            },
            npc6: {
                type: "Character",
                hasShadow: true,
                x: utils.withGrid(2),
                y: utils.withGrid(9),
                src: "assets/img/characters/chad.png",
                direction: "right"
            },
            npc7: {
                type: "Character",
                hasShadow: true,
                x: utils.withGrid(12),
                y: utils.withGrid(10),
                src: "assets/img/characters/chad.png",
                direction: "up"
            },
            books1: {
                type: "Actionable",
                x: utils.withGrid(3),
                y: utils.withGrid(3),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "There are lots of weird books.",
                    }, ]
                }],
            },
            books2: {
                type: "Actionable",
                x: utils.withGrid(4),
                y: utils.withGrid(3),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "There are lots of weird books.",
                    }, ]
                }],
            },
            books3: {
                type: "Actionable",
                x: utils.withGrid(5),
                y: utils.withGrid(3),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "There are lots of weird books.",
                    }, ]
                }],
            },
            bush1: {
                type: "Actionable",
                x: utils.withGrid(2),
                y: utils.withGrid(3),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a bush.",
                    }, ]
                }],
            },
            plant1: {
                type: "Actionable",
                x: utils.withGrid(11),
                y: utils.withGrid(3),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a potted plant.",
                    }, ]
                }],
            },
            plant2: {
                type: "Actionable",
                x: utils.withGrid(12),
                y: utils.withGrid(3),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a potted plant.",
                    }, ]
                }],
            },
            bush2: {
                type: "Actionable",
                x: utils.withGrid(14),
                y: utils.withGrid(3),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a bush.",
                    }, ]
                }],
            },
            plant3: {
                type: "Actionable",
                x: utils.withGrid(8),
                y: utils.withGrid(4),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a potted plant.",
                    }, ]
                }],
            },
            plant4: {
                type: "Actionable",
                x: utils.withGrid(9),
                y: utils.withGrid(4),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a potted plant.",
                    }, ]
                }],
            },
            plant5: {
                type: "Actionable",
                x: utils.withGrid(11),
                y: utils.withGrid(4),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a potted plant.",
                    }, ]
                }],
            },
            plant6: {
                type: "Actionable",
                x: utils.withGrid(7),
                y: utils.withGrid(5),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a potted plant.",
                    }, ]
                }],
            },
            plant7: {
                type: "Actionable",
                x: utils.withGrid(8),
                y: utils.withGrid(5),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a potted plant.",
                    }, ]
                }],
            },
            plant8: {
                type: "Actionable",
                x: utils.withGrid(10),
                y: utils.withGrid(5),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a potted plant.",
                    }, ]
                }],
            },
            plant9: {
                type: "Actionable",
                x: utils.withGrid(13),
                y: utils.withGrid(5),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a potted plant.",
                    }, ]
                }],
            },
            plant10: {
                type: "Actionable",
                x: utils.withGrid(6),
                y: utils.withGrid(6),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a potted plant.",
                    }, ]
                }],
            },
            plant11: {
                type: "Actionable",
                x: utils.withGrid(11),
                y: utils.withGrid(6),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a potted plant.",
                    }, ]
                }],
            },
            plant12: {
                type: "Actionable",
                x: utils.withGrid(13),
                y: utils.withGrid(6),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a potted plant.",
                    }, ]
                }],
            },
            plant13: {
                type: "Actionable",
                x: utils.withGrid(4),
                y: utils.withGrid(7),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a potted plant.",
                    }, ]
                }],
            },
            plant14: {
                type: "Actionable",
                x: utils.withGrid(6),
                y: utils.withGrid(7),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a potted plant.",
                    }, ]
                }],
            },
            plant15: {
                type: "Actionable",
                x: utils.withGrid(7),
                y: utils.withGrid(7),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a potted plant.",
                    }, ]
                }],
            },
            plant16: {
                type: "Actionable",
                x: utils.withGrid(9),
                y: utils.withGrid(7),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a potted plant.",
                    }, ]
                }],
            },
            plant17: {
                type: "Actionable",
                x: utils.withGrid(11),
                y: utils.withGrid(7),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a potted plant.",
                    }, ]
                }],
            },
            plant18: {
                type: "Actionable",
                x: utils.withGrid(14),
                y: utils.withGrid(7),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a potted plant.",
                    }, ]
                }],
            },
            plant19: {
                type: "Actionable",
                x: utils.withGrid(2),
                y: utils.withGrid(8),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a potted plant.",
                    }, ]
                }],
            },
            plant20: {
                type: "Actionable",
                x: utils.withGrid(4),
                y: utils.withGrid(8),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a potted plant.",
                    }, ]
                }],
            },
            plant21: {
                type: "Actionable",
                x: utils.withGrid(7),
                y: utils.withGrid(8),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a potted plant.",
                    }, ]
                }],
            },
            plant22: {
                type: "Actionable",
                x: utils.withGrid(9),
                y: utils.withGrid(8),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a potted plant.",
                    }, ]
                }],
            },
            plant23: {
                type: "Actionable",
                x: utils.withGrid(12),
                y: utils.withGrid(8),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a potted plant.",
                    }, ]
                }],
            },
            plant24: {
                type: "Actionable",
                x: utils.withGrid(14),
                y: utils.withGrid(8),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a potted plant.",
                    }, ]
                }],
            },
            plant25: {
                type: "Actionable",
                x: utils.withGrid(9),
                y: utils.withGrid(9),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a potted plant.",
                    }, ]
                }],
            },
            plant26: {
                type: "Actionable",
                x: utils.withGrid(4),
                y: utils.withGrid(9),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a potted plant.",
                    }, ]
                }],
            },
            plant27: {
                type: "Actionable",
                x: utils.withGrid(5),
                y: utils.withGrid(9),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a potted plant.",
                    }, ]
                }],
            },
            plant28: {
                type: "Actionable",
                x: utils.withGrid(7),
                y: utils.withGrid(9),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a potted plant.",
                    }, ]
                }],
            },
            bush3: {
                type: "Actionable",
                x: utils.withGrid(2),
                y: utils.withGrid(10),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a bush.",
                    }, ]
                }],
            },
            plant29: {
                type: "Actionable",
                x: utils.withGrid(5),
                y: utils.withGrid(10),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a potted plant.",
                    }, ]
                }],
            },
            plant30: {
                type: "Actionable",
                x: utils.withGrid(9),
                y: utils.withGrid(10),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a potted plant.",
                    }, ]
                }],
            },
            plant31: {
                type: "Actionable",
                x: utils.withGrid(11),
                y: utils.withGrid(10),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a potted plant.",
                    }, ]
                }],
            },
            plant32: {
                type: "Actionable",
                x: utils.withGrid(13),
                y: utils.withGrid(10),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a potted plant.",
                    }, ]
                }],
            },
            bush4: {
                type: "Actionable",
                x: utils.withGrid(14),
                y: utils.withGrid(10),
                // src: "",
                actions: [{
                    events: [{
                        type: "message",
                        text: "It's a bush.",
                    }, ]
                }],
            },
            chest1: {
                type: "Collectable",
                x: utils.withGrid(10),
                y: utils.withGrid(4),
                item: { actionId: "item_recoverHp", instanceId: "item298" },
                storyFlag: "Foliage_Room_Chest1_COMPLETE"
            },
            chest2: {
                type: "Collectable",
                x: utils.withGrid(14),
                y: utils.withGrid(9),
                item: { actionId: "item_recoverStatus", instanceId: "item299" },
                storyFlag: "Foliage_Room_Chest2_COMPLETE"
            },
            chest3: {
                type: "Collectable",
                x: utils.withGrid(4),
                y: utils.withGrid(10),
                item: { actionId: "item_recoverStatus", instanceId: "item300" },
                storyFlag: "Foliage_Room_Chest3_COMPLETE"
            },
            chest4: {
                type: "Collectable",
                x: utils.withGrid(10),
                y: utils.withGrid(10),
                item: { actionId: "item_recoverStatus", instanceId: "item301" },
                storyFlag: "Foliage_Room_Chest4_COMPLETE"
            },
        },
        walls: {
            //"16,16": true
            [utils.asGridCoord(2, 2)]: true,
            [utils.asGridCoord(3, 2)]: true,
            [utils.asGridCoord(4, 2)]: true,
            [utils.asGridCoord(5, 2)]: true,
            [utils.asGridCoord(6, 2)]: true,
            [utils.asGridCoord(7, 2)]: true,
            [utils.asGridCoord(8, 2)]: true,
            [utils.asGridCoord(9, 2)]: true,
            [utils.asGridCoord(10, 2)]: true,
            [utils.asGridCoord(11, 2)]: true,
            [utils.asGridCoord(12, 2)]: true,
            [utils.asGridCoord(13, 2)]: true,
            [utils.asGridCoord(14, 2)]: true,
            [utils.asGridCoord(15, 3)]: true,
            [utils.asGridCoord(15, 4)]: true,
            [utils.asGridCoord(15, 5)]: true,
            [utils.asGridCoord(16, 6)]: true,
            [utils.asGridCoord(15, 7)]: true,
            [utils.asGridCoord(15, 8)]: true,
            [utils.asGridCoord(15, 9)]: true,
            [utils.asGridCoord(15, 10)]: true,
            [utils.asGridCoord(14, 11)]: true,
            [utils.asGridCoord(13, 11)]: true,
            [utils.asGridCoord(12, 11)]: true,
            [utils.asGridCoord(11, 11)]: true,
            [utils.asGridCoord(10, 11)]: true,
            [utils.asGridCoord(9, 11)]: true,
            [utils.asGridCoord(8, 11)]: true,
            [utils.asGridCoord(7, 11)]: true,
            [utils.asGridCoord(6, 11)]: true,
            [utils.asGridCoord(5, 11)]: true,
            [utils.asGridCoord(4, 11)]: true,
            [utils.asGridCoord(3, 11)]: true,
            [utils.asGridCoord(2, 11)]: true,
            [utils.asGridCoord(1, 10)]: true,
            [utils.asGridCoord(1, 9)]: true,
            [utils.asGridCoord(1, 8)]: true,
            [utils.asGridCoord(1, 7)]: true,
            [utils.asGridCoord(1, 6)]: true,
            [utils.asGridCoord(1, 5)]: true,
            [utils.asGridCoord(0, 4)]: true,
            [utils.asGridCoord(1, 3)]: true,
        },
        sceneSpaces: {
            [utils.asGridCoord(15, 6)]: [{
                actions: [{
                    events: [
                        {
                            type: "changeMap",
                            map: "Lamp_Room_Dark",
                            x: utils.withGrid(1),
                            y: utils.withGrid(7),
                            direction: "right"
                        }
                    ]
                }]
            }],
        },
        battleSpaces: {
            [utils.asGridCoord(13, 4)]: [{
                actions: [{
                    required: ["Foliage_Room_BATTLE_1_COMPLETE"],
                    events: [
                        {
                            type: "message",
                            text: "I need to water some more plants.",
                            // faceHero: "hero"
                        }
                    ]
                },
                {
                    events: [
                        {
                            type: "message",
                            text: "Help I'm lost!",
                            // faceHero: "n"
                        },
                        {
                            type: "battle",
                            enemyId: "enemy_1"
                        },
                        {
                            type: "message",
                            text: "I need to water some more plants.",
                            // faceHero: "hero"
                        },
                        {
                            type: "addStoryFlag",
                            flag: "Foliage_Room_BATTLE_1_COMPLETE"
                        }
                    ]
                }]
            }],
            [utils.asGridCoord(9, 6)]: [{
                actions: [{
                    required: ["Foliage_Room_BATTLE_2_COMPLETE"],
                    events: [
                        {
                            type: "message",
                            text: "Oof.",
                            // faceHero: "hero"
                        }
                    ]
                },
                {
                    events: [
                        {
                            type: "message",
                            text: "Who are you?",
                            // faceHero: "n"
                        },
                        {
                            type: "battle",
                            enemyId: "enemy_1"
                        },
                        {
                            type: "message",
                            text: "Oof.",
                            // faceHero: "hero"
                        },
                        {
                            type: "addStoryFlag",
                            flag: "Foliage_Room_BATTLE_2_COMPLETE"
                        }
                    ]
                }]
            }],
            [utils.asGridCoord(8, 6)]: [{
                actions: [{
                    required: ["Foliage_Room_BATTLE_3_COMPLETE"],
                    events: [
                        {
                            type: "message",
                            text: "I need a vacation.",
                            // faceHero: "hero"
                        }
                    ]
                },
                {
                    events: [
                        {
                            type: "message",
                            text: "Doesn't this room smell nice?",
                            // faceHero: "n"
                        },
                        {
                            type: "battle",
                            enemyId: "enemy_1"
                        },
                        {
                            type: "message",
                            text: "I need a vacation.",
                            // faceHero: "hero"
                        },
                        {
                            type: "addStoryFlag",
                            flag: "Foliage_Room_BATTLE_3_COMPLETE"
                        }
                    ]
                }]
            }],
            [utils.asGridCoord(3, 7)]: [{
                actions: [{
                    required: ["Foliage_Room_BATTLE_4_COMPLETE"],
                    events: [
                        {
                            type: "message",
                            text: "You're pretty good.",
                            // faceHero: "hero"
                        }
                    ]
                },
                {
                    events: [
                        {
                            type: "message",
                            text: "I'm the last one.",
                            // faceHero: "n"
                        },
                        {
                            type: "battle",
                            enemyId: "enemy_1"
                        },
                        {
                            type: "message",
                            text: "You're pretty good.",
                            // faceHero: "hero"
                        },
                        {
                            type: "addStoryFlag",
                            flag: "Foliage_Room_BATTLE_4_COMPLETE"
                        }
                    ]
                }]
            }],
            [utils.asGridCoord(10, 8)]: [{
                actions: [{
                    required: ["Foliage_Room_BATTLE_5_COMPLETE"],
                    events: [
                        {
                            type: "message",
                            text: "Ugh.",
                            // faceHero: "hero"
                        }
                    ]
                },
                {
                    events: [
                        {
                            type: "message",
                            text: "I love the color green.",
                            // faceHero: "n"
                        },
                        {
                            type: "battle",
                            enemyId: "enemy_1"
                        },
                        {
                            type: "message",
                            text: "Ugh.",
                            // faceHero: "hero"
                        },
                        {
                            type: "addStoryFlag",
                            flag: "Foliage_Room_BATTLE_5_COMPLETE"
                        }
                    ]
                }]
            }],
            [utils.asGridCoord(3, 9)]: [{
                actions: [{
                    required: ["Foliage_Room_BATTLE_6_COMPLETE"],
                    events: [
                        {
                            type: "message",
                            text: "Wow you win.",
                            // faceHero: "hero"
                        }
                    ]
                },
                {
                    events: [
                        {
                            type: "message",
                            text: "This is my favorite room.",
                            // faceHero: "n"
                        },
                        {
                            type: "battle",
                            enemyId: "enemy_1"
                        },
                        {
                            type: "message",
                            text: "Wow you win.",
                            // faceHero: "hero"
                        },
                        {
                            type: "addStoryFlag",
                            flag: "Foliage_Room_BATTLE_6_COMPLETE"
                        }
                    ]
                }]
            }],
            [utils.asGridCoord(12, 10)]: [{
                actions: [{
                    required: ["Foliage_Room_BATTLE_7_COMPLETE"],
                    events: [
                        {
                            type: "message",
                            text: "You got lucky this time.",
                            // faceHero: "hero"
                        }
                    ]
                },
                {
                    events: [
                        {
                            type: "message",
                            text: "This plant needs some water.",
                            // faceHero: "n"
                        },
                        {
                            type: "battle",
                            enemyId: "enemy_1"
                        },
                        {
                            type: "message",
                            text: "You got lucky this time.",
                            // faceHero: "hero"
                        },
                        {
                            type: "addStoryFlag",
                            flag: "Foliage_Room_BATTLE_7_COMPLETE"
                        }
                    ]
                }]
            }],
        },
        openingScenes: {
            events: [
                { type: "message",  text: "Foliage Room" },
                { type: "addStoryFlag", flag: "Foliage_Room_COMPLETE"}
            ]
        }
    },
}