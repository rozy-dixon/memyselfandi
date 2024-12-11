class Load extends Phaser.Scene {
    constructor() {
        super('loadScene')
    }

    preload() {
        // loading bar

        // create default data
        this.load.json('json', './assets/text/poem.json')

        this.load.audio('sound', './assets/audio/rozgame.m4a')
        this.load.audio('tone', './assets/audio/tone.wav')
    }

    create() {
        // running checks
        console.log('%cLOAD SCENE :^)', testColor)

        const song = this.sound.add('sound')
        song.play()
        song.on('complete', () => {
            song.play()
        })

        let jsonData = this.cache.json.get('json')

        if (localStorage.getItem('JSONdata') != undefined) {
            jsonData = JSON.parse(localStorage.getItem('JSONdata'))
        }

        let infection = [
            'i have a tendency towards superstition',
            'an uncharacteristic reliance on comfortable inevitability',
            'and a stubbornness',
            'it tells me i’m supposed to be here',
            "that even if it's not clear now",
            'it will be',
            "it's kismet",
            "but if i'm honest, i know there’s little that i'll always do",
            'and in the end',
            'i really wish',
            'more than anything',
            'that i’ve fed you well',
        ]

        jsonData.poetry.forEach(stanza => {
            this.infect(infection, stanza.text)
        })

        // moving through
        this.scene.start('titleScene', {
            JSON: jsonData,
        })
    }

    infect(infection, poetry) {
        // src = https://chatgpt.com/share/675933e3-ddac-800d-a5b0-7ca613f3c964
        const indeces = []
        while (indeces.length < infection.length) {
            const index = Math.floor(Math.random() * poetry.length + 1)
            if (!indeces.includes(index)) {
                indeces.push(index)
            }
        }

        indeces.sort((a, b) => a - b)

        indeces.forEach((index, i) => {
            poetry.splice(index + i, 0, infection[i])
        })
    }
}
