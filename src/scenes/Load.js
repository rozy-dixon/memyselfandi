class Load extends Phaser.Scene {
    constructor() {
        super('loadScene')
    }

    preload() {
        // loading bar

        this.load.json('json', './assets/text/poem.json')
    }

    create() {
        // running checks
        console.log('%cLOAD SCENE :^)', testColor)

        const jsonData = this.cache.json.get('json')

        // moving through
        this.scene.start('titleScene', {
            JSON: jsonData,
        })
    }
}
