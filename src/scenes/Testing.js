class Testing extends Phaser.Scene {
    constructor() {
        super('testingScene')
    }

    create() {
        // running checks
        console.log('%cTESTING SCENE :^)', testColor)
    }

    update() {}
}
