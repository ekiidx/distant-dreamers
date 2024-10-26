class WorldEvent {
    constructor({
        map,
        event
    }) {
        this.map = map;
        this.event = event;
    }

    stand(resolve) {
        const who = this.map.gameObjects[this.event.who];
        who.startBehavior({
            map: this.map
        }, {
            type: "stand",
            direction: this.event.direction,
            time: this.event.time
        })

        //Set up a handler to complete when correct char is done standing, then resolve the event
        const completeHandler = e => {
            if (e.detail.whoId === this.event.who) {
                document.removeEventListener("StandComplete", completeHandler);
                resolve()
            }
        }
        document.addEventListener("StandComplete", completeHandler);
    }

    walk(resolve) {
        const who = this.map.gameObjects[this.event.who];
        who.startBehavior({
            map: this.map
        }, {
            type: "walk",
            direction: this.event.direction,
            retry: true
        })

        // Set up handler to complete when correct char is finished moving, then resolve event
        const completeHandler = e => {
            if (e.detail.whoId === this.event.who) {
                document.removeEventListener("WalkingComplete", completeHandler);
                resolve()
            }
        }
        document.addEventListener("WalkingComplete", completeHandler);
    }

    message(resolve) {
        // Change character position to face hero before speaking
        if (this.event.faceHero) {
            const obj = this.map.gameObjects[this.event.faceHero];
            obj.direction = utils.oppositeDirection(this.map.gameObjects["hero"].direction);
        }
        const message = new Message({
            text: this.event.text,
            onComplete: () => resolve()
        })
        message.init( document.querySelector(".game-container"));
    }

    changeMap(resolve) {
        // console.log(this.event);
        if (this.event.map === 'TestRoom') {
            if(!window.sfx.testRoom.playing() === true) {
                window.sfx.testRoom.volume(.7).play();
            }
        }
        if (this.event.map === 'TestRoom2') {
            if(!window.sfx.testRoom.playing() === true) {
                window.sfx.testRoom.volume(.7).play();
            }
        }
        if (this.event.map === 'Street') {
            if(!window.sfx.testRoom.playing() === true) {
                window.sfx.testRoom.volume(.7).play();
            }
        }

        // Deactive all objects
        Object.values(this.map.gameObjects).forEach(obj => {
            obj.isMounted = false;
        })

        const sceneTransition = new SceneTransition();
        sceneTransition.init(document.querySelector(".game-container"), () => {
            this.map.world.startMap( window.WorldMaps[this.event.map], {
                x: this.event.x,
                y: this.event.y,
                direction: this.event.direction,
            });
            resolve();
            sceneTransition.fadeOut();
        })
    }

    battle(resolve) {
        window.sfx.testRoom.stop();
        window.sfx.battle.volume(.7).play();
        const sceneTransition = new SceneTransition();
        sceneTransition.battleTransition(document.querySelector(".game-container"));

        const battle = new Battle({
            enemy: Enemies[this.event.enemyId],
            onComplete: (didWin) => {
                if (didWin === false) {
                    this.map.isGameOver = true;
                }
                resolve(didWin ? "BATTLE_WIN" : "BATTLE_LOSE");
            }
        })
        battle.init(document.querySelector(".game-container"));
    }

    gameOver(resolve) {
        this.map.isGameOver = true;

        const gameOver = new GameOver({
            // save: this.map.world.save,
            onComplete: () => {
                resolve();
                this.map.isGameOver = false;
                // window.sfx.testRoom.volume(.7);
                this.map.world.startGameLoop();
            }
        });
        gameOver.init(document.querySelector(".game-container"));
    }

    pause(resolve) {
        this.map.isPaused = true;

        window.sfx.testRoom.volume(.2);
        
        const menu = new PauseMenu({
            save: this.map.world.save,
            onComplete: () => {
                resolve();
                this.map.isPaused = false;
                window.sfx.testRoom.volume(.7);
                this.map.world.startGameLoop();
            }
        });
        menu.init(document.querySelector(".game-container"));
    }

    getItem(resolve) {
        const getItem = new GetItem({
            item: this.event.item,
            onComplete: () => resolve()
        })
        console.log("inside of getItem event");
        console.log(getItem.item);
        getItem.init();
    }

    addStoryFlag(resolve) {
        window.playerState.storyFlags[this.event.flag] = true;
        resolve();
    }

    init() {
        return new Promise(resolve => {
            this[this.event.type](resolve)
        })
    }
}