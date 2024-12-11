class Load extends Phaser.Scene {
    constructor() {
        super('loadScene')
    }

    preload() {
        // loading bar

        // create default data
        this.load.json('json', './assets/text/poem.json')
    }

    create() {
        // running checks
        console.log('%cLOAD SCENE :^)', testColor)

        let jsonData = this.cache.json.get('json')

        if (localStorage.getItem('JSONdata') != undefined) {
            jsonData = JSON.parse(localStorage.getItem('JSONdata'))
        }

        // moving through
        this.scene.start('titleScene', {
            JSON: jsonData,
        })
    }
}
