class World {
    constructor(config) {
        this.element = config.element
        this.canvas = this.element.querySelector(".game-canvas")
        this.ctx = this.canvas.getContext("2d")
        this.map = null
    }

    startGameLoop() {
        const step = () => {

            // Clear the frame
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

            // Character with camera
            const cameraCharacter = this.map.gameObjects.hero

            // Update all objects (2nd loop)
            Object.values(this.map.gameObjects).forEach(object => {
                object.update({
                    arrow: this.directionInput.direction,
                    map: this.map
                })
            })

            // Draw Lower Layer
            this.map.drawLowerImage(this.ctx, cameraCharacter)

            // Draw Game Objects
            Object.values(this.map.gameObjects).sort((a,b) => {
                // render more northern objects on screen before southern to fix z-index issue for sprites
                return a.y - b.y
            }).forEach(object => {
                object.sprite.draw(this.ctx, cameraCharacter)
            })

            // Draw Upper Layer
            this.map.drawUpperImage(this.ctx, cameraCharacter)

            requestAnimationFrame(() => {
                step()
            })
        }
        step()
    }

    init() {
        this.map = new WorldMap(window.WorldMaps.TestRoom)
        this.map.mountObjects()
        this.directionInput = new PlayerInput()
        this.directionInput.init()
        this.startGameLoop()
    }
}