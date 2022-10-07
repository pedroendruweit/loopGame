import platform from './sprites/platform.png'
import hills from './sprites/hills.png'
import background from './sprites/background.png'
import sprites from './sprites/sprites.png'

/////////////
// CANVAS ///
/////////////
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
canvas.width = 1000
canvas.height = 600
const gravity = 0.5


/////////////
// PLAYER ///
/////////////
class Player {
    constructor() {
        this.position = { x: 500, y: 300 }
        this.velocity = { x: 0, y: 0 }
        this.width = 32
        this.height = 32
        this.speed = 15 //TBD 5
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

    draw() {
        c.drawImage(
            this.image, //Image source

            //x axis for the start of the image spotlight (like in a film roll, the square with the picture current being displayed)
            32 * (Math.trunc(this.frames / 10 % 2)) + this.currentSprite.start_x_px,
            
            //y axis for the start of the image spotlight "track" (like if it was a new movie roll)
            this.currentSprite.start_y_px, 
            
            this.width,
            this.height,
            this.position.x,
            this.position.y,
            this.width,
            this.height
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

        if (this.position.y + this.height + this.velocity.y <= canvas.height) {
            this.velocity.y += gravity
        }
    }
}


///////////////////
// OBJECT CLASS ///
///////////////////
class Object {
    constructor({ x, y, image }) {
        this.position = { x, y }
        this.image = image
        this.width = image.width
        this.height = image.height
    }

    draw() {
        c.drawImage(this.image, this.position.x, this.position.y)
    }
}

////////////
// IMAGE ///
////////////
function createImage(imageSrc) {
    const image = new Image()
    image.src = imageSrc
    return image
}

////////////////////////
/// GLOBAL VARIABLES ///
////////////////////////
const blockFixedSize = 1735

let platformImage = createImage(platform)
let player = new Player()

let blockAOffset = 0
let blockBOffset = blockFixedSize

let block_A = {
    platforms : [],
    genericObjects :  [],
}
let block_B = {
    platforms : [],
    genericObjects :  [],
}

let lastKey

const keys = {
    right: { pressed: false },
    left: { pressed: false },
}

let scrollOffset = 0

//////////////////////////
/// INITIALIZE OBJECTS ///
//////////////////////////
const GROUND_Y = 500
const PLATFORM_SIZE = 575

function init() {
    platformImage = createImage(platform)
    player = new Player()
    block_A.platforms = [
        new Object({ x: blockAOffset + 0, y: GROUND_Y, image: platformImage }),
        new Object({ x: blockAOffset + PLATFORM_SIZE, y: GROUND_Y, image: platformImage }),
        new Object({ x: blockAOffset + PLATFORM_SIZE * 2, y: GROUND_Y, image: platformImage }),
    ]

    block_A.genericObjects = [
        new Object({ x: blockAOffset + 0, y: 0, image: createImage(background) }),
        new Object({ x: blockAOffset + 1000, y: 0, image: createImage(background) }),
        new Object({ x: blockAOffset + 0, y: 0, image: createImage(hills) }),
        new Object({ x: blockAOffset + 600, y: 0, image: createImage(hills) }),
    ]

    block_B.platforms = [
        new Object({ x: blockBOffset + 0, y: GROUND_Y, image: platformImage }),
        new Object({ x: blockBOffset + PLATFORM_SIZE, y: GROUND_Y, image: platformImage }),
        new Object({ x: blockBOffset + PLATFORM_SIZE * 2, y: GROUND_Y, image: platformImage }),
    ]

    block_B.genericObjects = [
        new Object({ x: blockBOffset + 0, y: 0, image: createImage(background) }),
        new Object({ x: blockBOffset + 1000, y: 0, image: createImage(background) }),
        new Object({ x: blockBOffset + 0, y: 0, image: createImage(hills) }),
        new Object({ x: blockBOffset + 600, y: 0, image: createImage(hills) }),
    ]
    scrollOffset = 0
}

///////////////////////////////////////
/// MOVEMENT LOGIC / CIRCULAR LOGIC ///
///////////////////////////////////////
const PLAYER_POSITION_RELATED_TO_SCREEN = 500

function move(){
    if (keys.right.pressed && player.position.x < PLAYER_POSITION_RELATED_TO_SCREEN) {

        player.velocity.x = player.speed

    // } else if ((keys.left.pressed && player.position.x > 350) || (keys.left.pressed && scrollOffset === 0 && player.position.x >= 0)) {

    //     player.velocity.x = -player.speed

    } else {
        player.velocity.x = 0

        if (keys.right.pressed) {
            scrollOffset += player.speed
            block_A.platforms.forEach(platform => {
                platform.position.x -= player.speed
            })
            block_A.genericObjects.forEach((go) => {
                go.position.x -= player.speed * 0.66
            })

            block_B.platforms.forEach(platform => {
                platform.position.x -= player.speed
            })
            block_B.genericObjects.forEach((go) => {
                go.position.x -= player.speed * 0.66
            })

        } else if (keys.left.pressed) {
            scrollOffset -= player.speed
            block_A.platforms.forEach(platform => {
                platform.position.x += player.speed
            })
            block_A.genericObjects.forEach((go) => {
                go.position.x += player.speed * 0.66
            })

            block_B.platforms.forEach(platform => {
                platform.position.x += player.speed
            })
            block_B.genericObjects.forEach((go) => {
                go.position.x += player.speed * 0.66
            })
        }
    }

}


////////////////////////////
/// ANIMATE / GAME LOGIC ///
////////////////////////////
function animate() {
    requestAnimationFrame(animate)
    c.fillStyle = 'white'
    c.fillRect(0, 0, canvas.width, canvas.height)

    

    block_A.genericObjects.forEach(go => {
        go.draw()
    })

    block_A.platforms.forEach(platform => {
        platform.draw()
    })

    block_B.genericObjects.forEach(go => {
        go.draw()
    })

    block_B.platforms.forEach(platform => {
        platform.draw()
    })

    player.update()

    move()

    //platform colision detection
    block_A.platforms.forEach(platform => {
        if (player.position.y + player.height <= platform.position.y
            && player.position.y + player.height + player.velocity.y >= platform.position.y
            && player.position.x + player.width >= platform.position.x
            && player.position.x <= platform.position.x + platform.width) {
            player.velocity.y = 0
        }
    })
    block_B.platforms.forEach(platform => {
        if (player.position.y + player.height <= platform.position.y
            && player.position.y + player.height + player.velocity.y >= platform.position.y
            && player.position.x + player.width >= platform.position.x
            && player.position.x <= platform.position.x + platform.width) {
            player.velocity.y = 0
        }
    })

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

    //WIN Condition
    if (scrollOffset > platformImage.width * 5 + 300) {
        console.log('YOU WIN!')
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