class WorldEvent {
    constructor({ map, event}) {
        this.map = map;
        this.event = event;
    }

    stand(resolve) {
        const who = this.map.gameObjects[ this.event.who ];
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
        const who = this.map.gameObjects[ this.event.who ];
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

        // const sceneTransition = new SceneTransition();
        // sceneTransition.init(document.querySelector(".game-container"), () => {
        //     // resolve();
        //     // sceneTransition.fadeOut();
        // });
        // sceneTransition.init( document.querySelector(".battle"));

        const battle = new Battle({
            enemy: Enemies[this.event.enemyId],
            onComplete: (didWin) => {
                resolve(didWin ? "BATTLE_WIN" : "BATTLE_LOSE")
            }
        })
        battle.init(document.querySelector(".game-container"));
    }

    pause(resolve) {
        this.map.isPaused = true;
        const menu = new PauseMenu({
            save: this.map.world.save,
            onComplete: () => {
                resolve();
                this.map.isPaused = false;
                this.map.world.startGameLoop();
            }
        });
        menu.init(document.querySelector(".game-container"));
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