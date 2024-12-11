// making myself not miserable
'use strict'

let dimensions = { width: 1920, height: 1280 }
const padding = 0.01

if (window.innerHeight <= window.innerWidth) {
    dimensions = { width: 1000, height: 1280 }
}

// game config
let config = {
    parent: 'GAME TITLE',
    type: Phaser.AUTO,
    render: {
        pixelArt: true,
    },
    width: dimensions.width,
    height: dimensions.height,
    scale: {
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    zoom: Math.min(
        window.innerHeight / dimensions.height - padding,
        window.innerWidth / dimensions.width - padding,
    ),
    scene: [Load, Testing, Title, Poetry, Keys],
}

// game variables
const game = new Phaser.Game(config)
// convenience variables
const centerX = game.config.width / 2
const centerY = game.config.height / 2
const width = game.config.width
const height = game.config.height
// log variables
const testColor = 'color: #91aa86;'
const goodColor = 'color: #cfd1af;'
const badColor = 'color: #c088ae;'
// key variables
let cursors, keyENTER
// jsonData
let jsonObject
// height greater than width
const mobile = dimensions.height > dimensions.width == true

function checkMobile() {
    return (
        (navigator.userAgent.match(/Android/i) ||
            navigator.userAgent.match(/webOS/i) ||
            navigator.userAgent.match(/iPhone/i) ||
            navigator.userAgent.match(/iPad/i) ||
            navigator.userAgent.match(/iPod/i) ||
            navigator.userAgent.match(/BlackBerry/i) ||
            navigator.userAgent.match(/Windows Phone/i)) == true
    )
}
