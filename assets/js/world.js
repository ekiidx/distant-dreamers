class World {
    constructor(config) {
        this.element = config.element;
        this.canvas = this.element.querySelector(".game-canvas");
        this.ctx = this.canvas.getContext("2d");
        this.map = null;
    }

    startGameLoop() {
        const step = () => {

            // console.log("stepping");
            // Clear the frame
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Character with camera
            const cameraCharacter = this.map.gameObjects.hero;

            // Update all objects (2nd loop)
            Object.values(this.map.gameObjects).forEach(object => {
                object.update({
                    arrow: this.directionInput.direction,
                    map: this.map
                })
            })

            // Draw Lower Layer
            this.map.drawLowerImage(this.ctx, cameraCharacter);

            // Draw Game Objects
            Object.values(this.map.gameObjects).sort((a, b) => {
                // render more northern objects on screen before southern to fix z-index issue for sprites
                return a.y - b.y;
            }).forEach(object => {
                object.sprite.draw(this.ctx, cameraCharacter);
            })

            // Draw Upper Layer
            this.map.drawUpperImage(this.ctx, cameraCharacter);

            // if (this.map.isGameOver) {
            //     // Show the title screen
            //     this.gameOver = new GameOver({});
            //     this.gameOver.init(document.querySelector(".game-container"));
            // }

            // Continue Loop if Game is not paused
            if (!this.map.isPaused) {
                if(!this.map.isGameOver) {
                    // Fire next frame
                    requestAnimationFrame(() => {
                        step();
                    })
                }
            }
            if(this.map.isGameOver) {
                if (!this.map.isScenePlaying) {
                    this.map.startScene([{
                        type: "gameOver"
                    }])
                }
            }
        }
        // Call itself for the first time and begin the loop
        step();
    }

    bindActionInput() {
        new KeyPressListener("Enter", () => {
            // Is there a char to talk to?
            // check for scene at certain position and determin if char has something to say, and if so, then fire
            this.map.checkForActionScene()
        })
        new KeyPressListener("Escape", () => {
            if (!this.map.isScenePlaying) {
                this.map.startScene([{
                    type: "pause"
                }])
            }
        })
        // new KeyPressListener("Space", () => {
        //     if (!this.map.isScenePlaying) {
        //         this.map.startScene([{
        //             type: "gameOver"
        //         }])
        //     }
        // })
    }

    bindHeroPositionCheck() {
        document.addEventListener("WalkingComplete", e => {
            if (e.detail.whoId === "hero") {
                // Player position has changed
                this.map.checkForFootstepScene()
            }
        })
    }

    startMap(mapConfig, heroInitialState = null) {
        this.map = new WorldMap(mapConfig);
        this.map.world = this;
        this.map.mountObjects();

        if (heroInitialState) {
            // Remove "ghost wall" that takes up initial hero space when changing maps
            const {
                hero
            } = this.map.gameObjects;
            // this.map.removeWall(hero.x, hero.y);
            hero.x = heroInitialState.x;
            hero.y = heroInitialState.y;
            hero.direction = heroInitialState.direction;
            // Add it back in
            // this.map.addWall(hero.x, hero.y);
        }
        this.save.mapId = mapConfig.id;
        this.save.startingHeroX = this.map.gameObjects.hero.x;
        this.save.startingHeroY = this.map.gameObjects.hero.y;
        this.save.startingHeroDirection = this.map.gameObjects.hero.direction;
    }
    
    async init() {
        const container = document.querySelector(".game-container");

        // Create new save
        this.save = new Save();

        // Show the title screen
        this.titleScreen = new TitleScreen({
            save: this.save
        });

        // Show the title screen
        this.newGameScene = new NewGameScene({
        });

        // Show the Game Over screen
        this.gameOver = new GameOver({
        });

        const useSaveFile = await this.titleScreen.init(container);
        await this.newGameScene.init(container);

        //Potentially load saved data
        let initialHeroState = null;
        // const saveFile = this.save.getSaveFile()
        // if (saveFile) {
        if (useSaveFile) {
            this.save.load();
            initialHeroState = {
                x: this.save.startingHeroX,
                y: this.save.startingHeroY,
                direction: this.save.startingHeroDirection,
            }
        }

        // Fire the hud
        // this.hud = new Hud();
        // this.hud.init(container);

        // Start the first map
        this.startMap(window.WorldMaps[this.save.mapId], initialHeroState);
    
        // Create controls
        this.bindActionInput();
        this.bindHeroPositionCheck();

        this.directionInput = new PlayerInput();
        this.directionInput.init();

        // Start the main game loop
        this.startGameLoop();

        // this.map.startScene([
        //     //     // { type: "message", text: "Welcome to Distant Dreamers!"},
        //     {
        //         type: "changeMap",
        //         map: "TestRoom",
        //         x: utils.withGrid(5),
        //         y: utils.withGrid(6),
        //         direction: "down"
        //     },
        //     //     // { type: "changeMap", map: "TestRoom2" },
        //     //     // { type: "battle", enemyId: "enemy_1" },
        //     //     // { who: "hero", type: "walk",  direction: "down" },
        //     //     // { who: "hero", type: "walk",  direction: "down" },
        //     //     // { who: "npc1", type: "walk",  direction: "left" },
        //     //     // { who: "npc1", type: "walk",  direction: "left" },
        //     //     // { who: "npc1", type: "stand",  direction: "up", time: 800 },
        // ])
    }
}