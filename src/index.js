import sprites from './sprites/sprites.png'

/////////////
// CANVAS ///
/////////////
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
canvas.width = 1000
canvas.height = 600
const gravity = 0.5

////////////
// IMAGE ///
////////////
function createImage(imageSrc) {
    const image = new Image()
    image.src = imageSrc
    return image
}

/////////////////////
// Object CLASS ///
/////////////////////
class Object {
    constructor({ x, y, w, h, color = 'black', collision = true, fixed = false, scenario = [] }) {
        this.position = { x, y }
        this.size = { w, h }
        this.color = color
        this.collision = collision
        this.fixed = fixed
        this.scenario = scenario
    }

    getRightEdge() {
        return this.position.x + this.size.w
    }

    getLeftEdge() {
        return this.position.x
    }

    getTopEdge() {
        return this.position.y
    }
    getBottomEdge() {
        return this.position.y + this.size.h
    }

    draw() {
        c.fillStyle = this.color
        c.fillRect(this.position.x, this.position.y, this.size.w, this.size.h)
    }
}


/////////////
// PLAYER ///
/////////////
class Player {
    constructor() {
        this.position = { x: 500, y: 300 }
        this.velocity = { x: 0, y: 0 }
        this.size = { w: 32, h: 32 }
        this.speed = 10 //TBD 5
        this.image = createImage(sprites)
        this.frames = 0
        this.sprites = {
            stand_right: {
                start_x_px: 0,
                start_y_px: 0,
            },
            stand_left: {
                start_x_px: 64,
                start_y_px: 0,
            },
            run_right: {
                start_x_px: 0,
                start_y_px: 33,
            },
            run_left: {
                start_x_px: 64,
                start_y_px: 33,
            },
        }

        this.currentSprite = this.sprites.stand_right
    }

    getRightEdge() {
        return this.position.x + this.size.w - 12
    }
    getLeftEdge() {
        return this.position.x + 12
    }
    getTopEdge() {
        return this.position.y + 8
    }
    getBottomEdge() {
        return this.position.y + this.size.h
    }

    draw() {
        c.drawImage(
            this.image, //Image source

            //x axis for the start of the image spotlight (like in a film roll, the square with the picture current being displayed)
            32 * (Math.trunc(this.frames / 10 % 2)) + this.currentSprite.start_x_px,

            //y axis for the start of the image spotlight "track" (like if it was a new movie roll)
            this.currentSprite.start_y_px,

            this.size.w,
            this.size.h,
            this.position.x,
            this.position.y,
            this.size.w,
            this.size.h
        )
    }

    update() {
        this.frames++

        if (this.frames >= 60 && (this.currentSprite === this.sprites.stand_right || this.currentSprite === this.sprites.stand_left)) {
            this.frames = 0
        } else if (this.frames >= 60 && (this.currentSprite === this.sprites.run_right || this.currentSprite === this.sprites.run_left)) {
            this.frames = 0
        }

        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        if (this.position.y + this.size.h + this.velocity.y <= canvas.height) {
            this.velocity.y += gravity
        }
    }
}

////////////////////////
/// GLOBAL VARIABLES ///
////////////////////////
const RELATIVE_X_BLOCK_A = -1000
const RELATIVE_X_BLOCK_B = 0
const RELATIVE_X_BLOCK_C = 1000
const GROUND = { x: 0, y: 550, w: 1000, h: 50, color: 'darkgreen', collision: true, fixed: true }

/////////////////
/// SCENARIOS ///
/////////////////
const BACKGROUND_A = { x: RELATIVE_X_BLOCK_A, y: 0, w: 1000, h: 550, color: 'lightpink', collision: false, fixed: false }
const BACKGROUND_B = { x: RELATIVE_X_BLOCK_B, y: 0, w: 1000, h: 550, color: 'lightblue', collision: false, fixed: false }
const BACKGROUND_C = { x: RELATIVE_X_BLOCK_C, y: 0, w: 1000, h: 550, color: 'lightgreen', collision: false, fixed: false }

let player = new Player()

let objects = []
let lastKey

const keys = {
    right: { pressed: false },
    left: { pressed: false },
}

//////////////////////////
/// INITIALIZE OBJECTS ///
//////////////////////////

function init() {
    player = new Player()

    objects = [
        new Object(GROUND),
        new Object(BACKGROUND_A),
        new Object(BACKGROUND_B),
        new Object(BACKGROUND_C),


        // KEEP ==> X + W <= 1000 AND X >= 0
        //Scenario 1 - PINK
        new Object({ x: RELATIVE_X_BLOCK_A + 300, y: 470, w: 100, h: 20, color: 'blue', collision: true, fixed: false }),
        new Object({ x: RELATIVE_X_BLOCK_A + 500, y: 400, w: 50, h: 150, color: 'blue', collision: true, fixed: false }),

        //Scenario 2 - BLUE
        new Object({ x: RELATIVE_X_BLOCK_B + 40, y: 470, w: 70, h: 20, color: 'red', collision: true, fixed: false }),
        new Object({ x: RELATIVE_X_BLOCK_B + 300, y: 400, w: 50, h: 150, color: 'red', collision: true, fixed: false }),

        //Scenario 3 - GREEN
        new Object({ x: RELATIVE_X_BLOCK_C + 200, y: 470, w: 50, h: 20, color: 'black', collision: true, fixed: false }),
        new Object({ x: RELATIVE_X_BLOCK_C + 360, y: 390, w: 50, h: 20, color: 'black', collision: true, fixed: false }),
        new Object({ x: RELATIVE_X_BLOCK_C + 780, y: 370, w: 80, h: 20, color: 'black', collision: true, fixed: false }),
    ]
}

///////////////////////////////////////
/// MOVEMENT LOGIC / CIRCULAR LOGIC ///
///////////////////////////////////////
const SCREEN_BASE_SWITCH_SIZE = 1500

function onRightCollision() {
    let collisionDetected = false
    objects.forEach(object => {
        if (object.collision
            // Player touching the object in the right
            && object.getLeftEdge() > player.getRightEdge()
            && object.getLeftEdge() - player.speed <= player.getRightEdge()
            // Player TOP is ABOVE the BOTTOM of the Object 
            && player.getTopEdge() <= object.getBottomEdge()
            // Player BELOW THE TOP of the Object 
            && player.getBottomEdge() >= object.getTopEdge()) {

            collisionDetected = true
        }

    })
    return collisionDetected
}

function onLeftCollision() {
    let collisionDetected = false
    objects.forEach(object => {
        if (object.collision
            // Player touching the object in the left
            && object.getRightEdge() < player.getLeftEdge()
            && object.getRightEdge() + player.speed >= player.getLeftEdge()
            // Player TOP is ABOVE the BOTTOM of the Object 
            && player.getTopEdge() <= object.getBottomEdge()
            // Player BELOW THE TOP of the Object 
            && player.getBottomEdge() >= object.getTopEdge()) {

            collisionDetected = true
        }

    })
    return collisionDetected
}

function move() {
    if (keys.right.pressed) {

        if (onRightCollision()) 
            return

        objects.forEach(object => {
            if (!object.fixed) {
                object.position.x -= player.speed

                if (object.position.x <= -SCREEN_BASE_SWITCH_SIZE) {
                    object.position.x = SCREEN_BASE_SWITCH_SIZE
                }
            }
        })

    } else if (keys.left.pressed) {

        if (onLeftCollision()) 
            return

        objects.forEach(object => {
            if (!object.fixed) {
                object.position.x += player.speed

                if (object.position.x >= SCREEN_BASE_SWITCH_SIZE) {
                    object.position.x = -SCREEN_BASE_SWITCH_SIZE
                }
            }

        })
    }
}


////////////////////////////
/// ANIMATE / GAME LOGIC ///
////////////////////////////
function animate() {
    requestAnimationFrame(animate)
    c.fillStyle = 'white'
    c.fillRect(0, 0, canvas.width, canvas.height)

    objects.forEach(object => {
        object.draw()
    });

    player.update()

    move()

    //Ground Colision Detection
    objects.forEach(object => {
        if (object.collision === true
            // Player is at the RIGHT of the LEFT edge of the Object 
            && player.getRightEdge() >= object.getLeftEdge()
            // Player is at the LEFT of the RIGHT edge of the Object  
            && player.getLeftEdge() <= object.getRightEdge()
            // Player BOTTOM would cross the TOP Object wall in the next move
            && player.getBottomEdge() + player.velocity.y >= object.position.y
            // Player is ABOVE the Object
            && player.getBottomEdge() <= object.position.y) {

            player.velocity.y = 0

        } else if (object.collision === true
            // Player is at the RIGHT of the LEFT edge of the Object 
            && player.getRightEdge() >= object.getLeftEdge()
            // Player is at the LEFT of the RIGHT edge of the Object 
            && player.getLeftEdge() <= object.getRightEdge()
            // Player TOP would cross the BOTTOM Object wall in the next moved
            && player.getTopEdge() + player.velocity.y <= object.position.y + object.size.h
            // Player is BELOW the Object
            && player.getTopEdge() >= object.position.y + object.size.h) {

            player.velocity.y = 0
        }
    });


    //sprite switching 
    if (keys.right.pressed && lastKey === 'right' && player.currentSprite !== player.sprites.run_right) {
        player.frames = 0
        player.currentSprite = player.sprites.run_right

    } else if (keys.left.pressed && lastKey === 'left' && player.currentSprite !== player.sprites.run_left) {
        player.frames = 0
        player.currentSprite = player.sprites.run_left

    } else if (!keys.right.pressed && lastKey === 'right' && player.currentSprite !== player.sprites.stand_right) {
        player.frames = 0
        player.currentSprite = player.sprites.stand_right

    } else if (!keys.left.pressed && lastKey === 'left' && player.currentSprite !== player.sprites.stand_left) {
        player.frames = 0
        player.currentSprite = player.sprites.stand_left
    }

    //LOSE Condition
    if (player.position.y > canvas.height) {
        init()
    }

}

//////////////////
/// GAME START ///
//////////////////
init()
animate()

////////////////////////////////
/// EVENT LISTENERS FOR KEYS ///
////////////////////////////////
addEventListener('keydown', ({ keyCode }) => {
    switch (keyCode) {
        case 65: //left (A)
            keys.left.pressed = true
            lastKey = 'left'
            break

        case 83: //down (S)
            break

        case 68: //right (D)
            keys.right.pressed = true
            lastKey = 'right'
            break

        case 87: //up (W)
            if (player.velocity.y == 0)
                player.velocity.y -= 10
            break
    }
})

addEventListener('keyup', ({ keyCode }) => {
    switch (keyCode) {
        case 65: //left (A)
            keys.left.pressed = false
            break

        case 83: //down (S)
            break

        case 68: //right (D)
            keys.right.pressed = false
            break

        case 87: //up (W)
            break
    }
})