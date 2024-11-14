class WorldMap {
    constructor(config) {
        this.world = null;
        this.gameObjects = {}; // live objects are in here
        this.configObjects = config.configObjects; // Configuration content

        this.openingScenes = config.openingScenes || {};

        this.sceneSpaces = config.sceneSpaces || {};
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

            // Add items / shops here
            if (object.type === "Chest") {
                instance = new Collectable(object);
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

    // async gameOver() {
    //     console.log("this game over");
    //     // Show the Game Over screen
    //     this.gameOver = new GameOver({
    //     });
    //     await this.gameOver.init(document.querySelector(".game-container"));
    // }

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
        const match = this.sceneSpaces[`${hero.x},${hero.y}`];
        if (!this.isScenePlaying && match) {
            this.startScene(match[0].events)
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
        lowerSrc: "",
        upperSrc: "",
        configObjects: {
            hero: {
                type: "Character",
                isPlayerControlled: true,
                x: utils.withGrid(3),
                y: utils.withGrid(10),
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
        //         talking: [{
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
        //         talking: [{
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
        //     [utils.asGridCoord(0, 3)]: true,
        //     [utils.asGridCoord(0, 4)]: true,
        //     [utils.asGridCoord(0, 5)]: true,
        //     [utils.asGridCoord(0, 6)]: true,
        //     [utils.asGridCoord(0, 7)]: true,
        //     [utils.asGridCoord(1, 2)]: true,
        //     [utils.asGridCoord(2, 2)]: true,
        //     [utils.asGridCoord(3, 2)]: true,
        //     [utils.asGridCoord(4, 2)]: true,
        //     [utils.asGridCoord(5, 2)]: true,
        //     [utils.asGridCoord(6, 2)]: true,
        //     [utils.asGridCoord(6, 3)]: true,
        //     [utils.asGridCoord(7, 3)]: true,
        //     [utils.asGridCoord(7, 2)]: true,
        //     [utils.asGridCoord(7, 1)]: true,
        //     [utils.asGridCoord(8, 0)]: true,
        //     [utils.asGridCoord(9, 1)]: true,
        //     [utils.asGridCoord(9, 2)]: true,
        //     [utils.asGridCoord(9, 3)]: true,
        //     [utils.asGridCoord(10, 2)]: true,
        //     [utils.asGridCoord(11, 2)]: true,
        //     [utils.asGridCoord(12, 3)]: true,
        //     [utils.asGridCoord(12, 4)]: true,
        //     [utils.asGridCoord(12, 5)]: true,
        //     [utils.asGridCoord(12, 6)]: true,
        //     [utils.asGridCoord(12, 7)]: true,
        //     [utils.asGridCoord(12, 8)]: true,
        //     [utils.asGridCoord(12, 9)]: true,
        //     [utils.asGridCoord(11, 10)]: true,
        //     [utils.asGridCoord(10, 10)]: true,
        //     [utils.asGridCoord(9, 10)]: true,
        //     [utils.asGridCoord(8, 10)]: true,
        //     [utils.asGridCoord(7, 10)]: true,
        //     [utils.asGridCoord(6, 10)]: true,
        //     [utils.asGridCoord(5, 10)]: true,
        //     [utils.asGridCoord(4, 10)]: true,
        //     [utils.asGridCoord(3, 11)]: true,
        //     [utils.asGridCoord(2, 10)]: true,
        //     [utils.asGridCoord(1, 10)]: true,
        //     [utils.asGridCoord(0, 9)]: true,
        //     [utils.asGridCoord(0, 8)]: true,
        // },
        sceneSpaces: {
            [utils.asGridCoord(3, 10)]: [{
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
        },
        openingScenes: {
            events: [
                { type: "message",  text: "This is an opening scene." },
                { type: "addStoryFlag", flag: "BlackRoom_COMPLETE"}
            ]
        }
    },
    TestRoom: {
        id: "TestRoom",
        lowerSrc: "assets/img/maps/test_room_lower.png",
        upperSrc: "assets/img/maps/test_room_upper.png",
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
                talking: [{
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
            npc2: {
                type: "Character",
                x: utils.withGrid(2),
                y: utils.withGrid(8),
                src: "assets/img/characters/npc1.png",
                talking: [{
                    events: [{
                        type: "message",
                        text: "That door down there takes you another room.",
                        faceHero: "npc2"
                    }, ]
                }],
                behaviorLoop: [{
                        type: "stand",
                        direction: "up",
                        time: 3000
                    },
                    {
                        type: "stand",
                        direction: "right",
                        time: 3800
                    },
                ],
            }
        },
        walls: {
            //"16,16": true
            [utils.asGridCoord(0, 3)]: true,
            [utils.asGridCoord(0, 4)]: true,
            [utils.asGridCoord(0, 5)]: true,
            [utils.asGridCoord(0, 6)]: true,
            [utils.asGridCoord(0, 7)]: true,
            [utils.asGridCoord(1, 2)]: true,
            [utils.asGridCoord(2, 2)]: true,
            [utils.asGridCoord(3, 2)]: true,
            [utils.asGridCoord(4, 2)]: true,
            [utils.asGridCoord(5, 2)]: true,
            [utils.asGridCoord(6, 2)]: true,
            [utils.asGridCoord(6, 3)]: true,
            [utils.asGridCoord(7, 3)]: true,
            [utils.asGridCoord(7, 2)]: true,
            [utils.asGridCoord(7, 1)]: true,
            [utils.asGridCoord(8, 0)]: true,
            [utils.asGridCoord(9, 1)]: true,
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
        },
        sceneSpaces: {
            [utils.asGridCoord(3, 10)]: [{
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
            }]
        }
    },
    TestRoom2: {
        id: "TestRoom2",
        lowerSrc: "assets/img/maps/test_room_lower.png",
        upperSrc: "assets/img/maps/test_room_upper.png",
        configObjects: {
            hero: {
                type: "Character",
                isPlayerControlled: true,
                x: utils.withGrid(5),
                y: utils.withGrid(5),
                // direction: "up"
            },
            boss: {
                type: "Character",
                x: utils.withGrid(8),
                y: utils.withGrid(3),
                src: "assets/img/characters/boss.png",
                talking: [{
                        // use array to add multiple events that need to be completed in order for trigger
                        required: ["BOSS_BATTLE_1_COMPLETE"],
                        events: [{
                            type: "message",
                            text: "You have defeated me!",
                            faceHero: "boss"
                        }]
                    },
                    {
                        events: [{
                                type: "message",
                                text: "I am the boss. Get ready to fight!",
                                faceHero: "boss"
                            },
                            {
                                type: "battle",
                                enemyId: "boss_1"
                            },
                            {
                                type: "message",
                                text: "You are truly strong. A worthy opponent indeed.",
                                faceHero: "boss"
                            },
                            {
                                type: "addStoryFlag",
                                flag: "BOSS_BATTLE_1_COMPLETE"
                            }
                        ]
                    }
                ]
                // direction: "up"
            },
            chest: {
                type: "Chest",
                x: utils.withGrid(3),
                y: utils.withGrid(5),
                item: { actionId: "item_recoverStatus", instanceId: "item29329" },
                storyFlag: "USED_CHEST"
            },
            // npc1: new Character({
            //     x: utils.withGrid(9),
            //     y: utils.withGrid(2),
            //     src: "assets/img/characters/npc1.png"
            // }),
            // npc2: new Character({
            //     x: utils.withGrid(20),
            //     y: utils.withgrid(2),
            //     src: "assets/img/characters/npc2.png"
            // })
        },
        walls: {
            //"16,16": true
            [utils.asGridCoord(0, 3)]: true,
            [utils.asGridCoord(0, 4)]: true,
            [utils.asGridCoord(0, 5)]: true,
            [utils.asGridCoord(0, 6)]: true,
            [utils.asGridCoord(0, 7)]: true,
            [utils.asGridCoord(1, 2)]: true,
            [utils.asGridCoord(2, 2)]: true,
            [utils.asGridCoord(3, 2)]: true,
            [utils.asGridCoord(4, 2)]: true,
            [utils.asGridCoord(5, 2)]: true,
            [utils.asGridCoord(6, 2)]: true,
            [utils.asGridCoord(6, 3)]: true,
            [utils.asGridCoord(7, 3)]: true,
            [utils.asGridCoord(7, 2)]: true,
            [utils.asGridCoord(7, 1)]: true,
            [utils.asGridCoord(8, 0)]: true,
            [utils.asGridCoord(9, 1)]: true,
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
        },
        sceneSpaces: {
            [utils.asGridCoord(3, 10)]: [{
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
            }]
        }
    },
    Street: {
        id: "TestRoom",
        lowerSrc: "assets/img/maps/street_lower.png",
        upperSrc: "assets/img/maps/street_upper.png",
        configObjects: {
            hero: {
                type: "Character",
                isPlayerControlled: true,
                x: utils.withGrid(17),
                y: utils.withGrid(50),
            },
            // npc1: {
            //     type: "Character",
            //     x: utils.withGrid(7),
            //     y: utils.withGrid(9),
            //     src: "assets/img/characters/npc1.png",
            //     behaviorLoop: [{
            //             type: "stand",
            //             direction: "left",
            //             time: 3800
            //         },
            //         {
            //             type: "stand",
            //             direction: "up",
            //             time: 1800
            //         },
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
            //     ],
            //     talking: [{
            //             // use array to add multiple events that need to be completed in order for trigger
            //             required: ["BATTLE_1_COMPLETE"],
            //             events: [{
            //                 type: "message",
            //                 text: "Dang, you are strong.",
            //                 faceHero: "npc1"
            //             }]
            //         },
            //         {
            //             events: [{
            //                     type: "message",
            //                     text: "It's good to meet you.",
            //                     faceHero: "npc1"
            //                 },
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
            //             ]
            //         }
            //     ]
            // },
            // npc2: {
            //     type: "Character",
            //     x: utils.withGrid(2),
            //     y: utils.withGrid(8),
            //     src: "assets/img/characters/npc1.png",
            //     talking: [{
            //         events: [{
            //             type: "message",
            //             text: "That door down there takes you another room.",
            //             faceHero: "npc2"
            //         }, ]
            //     }],
            //     behaviorLoop: [{
            //             type: "stand",
            //             direction: "up",
            //             time: 3000
            //         },
            //         {
            //             type: "stand",
            //             direction: "right",
            //             time: 3800
            //         },
            //     ],
            // },
            // collectableItem: new Collectable ({
            //     x: utils.withGrid(4),
            //     y: utils.withGrid(10)
            // }),
        },
        walls: {
            //"16,16": true
            // [utils.asGridCoord(0, 8)]: true,
        },
        sceneSpaces: {
            // [utils.asGridCoord(3, 10)]: [{
            //     events: [
            //         // {who: "npc1", type: "walk", direction: "up"},
            //         {
            //             type: "changeMap",
            //             map: "TestRoom2",
            //             x: utils.withGrid(3),
            //             y: utils.withGrid(10),
            //             direction: "up"
            //         }
            //     ]
            // }]
        }
    },
    Intro: {
        id: "Intro",
        lowerSrc: "assets/img/maps/intro_lower.png",
        upperSrc: "assets/img/maps/intro_upper.png",
        configObjects: {
            hero: {
                type: "Character",
                isPlayerControlled: true,
                x: utils.withGrid(4),
                y: utils.withGrid(10),
            },
            penny: {
                type: "Character",
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
                talking: [{
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
                talking: [{
                    events: [{
                        type: "message",
                        text: "I have a strange feeling about this place.",
                        faceHero: "lucy"
                    }, ]
                }],
            },
            chad: {
                type: "Character",
                x: utils.withGrid(6),
                y: utils.withGrid(10),
                src: "assets/img/characters/chad.png",
                behaviorLoop: [{
                        type: "stand",
                        direction: "left",
                        time: 9800
                    },
                ],
                talking: [{
                    events: [{
                        type: "message",
                        text: "This place is weird.",
                        faceHero: "chad"
                    }, ]
                }],
            },
            reese: {
                type: "Character",
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
                talking: [{
                    events: [{
                        type: "message",
                        text: "... ... ...",
                        faceHero: "reese"
                    }, ]
                }],
            },
            paisley: {
                type: "Character",
                x: utils.withGrid(7),
                y: utils.withGrid(11),
                src: "assets/img/characters/paisley.png",
                behaviorLoop: [{
                        type: "stand",
                        direction: "up",
                        time: 9800
                    },
                ],
                talking: [{
                    events: [{
                        type: "message",
                        text: "What is this place? Where am I? All I remember playing a video game and then...",
                        faceHero: "paisley"
                    }, ]
                }],
            },
            alexander: {
                type: "Character",
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
                talking: [{
                    events: [{
                        type: "message",
                        text: "I think that lady in a white coat is waiting for you.",
                        faceHero: "alexander"
                    }, ]
                }],
            },
            reese2: {
                type: "Character",
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
                talking: [{
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
        lowerSrc: "assets/img/maps/room_1.png",
        upperSrc: "",
        configObjects: {
            hero: {
                type: "Character",
                isPlayerControlled: true,
                x: utils.withGrid(5),
                y: utils.withGrid(10),
                direction: "up"
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
        },
        openingScenes: {
            events: [
                { type: "message",  text: "This is an opening scene." },
                { type: "addStoryFlag", flag: "Room_1_COMPLETE"}
            ]
        }
    },
}