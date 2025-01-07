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
            '%ci have a tendency towards superstition',
            '%can uncharacteristic reliance on comfortable inevitability',
            '%cand a stubbornness',
            '%cit tells me i’m supposed to be here',
            "%cthat even if it's not clear now",
            '%cit will be',
            "%cit's kismet",
            "%cbut if i'm honest, i know there’s little that i'll always do",
            '%cand in the end',
            '%ci want',
            '%cmore than anything',
            '%cto have fed you well.',
        ]

        jsonData.poetry.forEach(stanza => {
            stanza.text = this.infect(infection, stanza.text)
        })

        // moving through
        this.scene.start('titleScene', {
            JSON: jsonData,
        })
    }

    infect(infection, poetry) {
        // src = https://chatgpt.com/share/675933e3-ddac-800d-a5b0-7ca613f3c964

        // account for empty
        if (poetry.length <= 1 && poetry[0] == '') {
            poetry.pop()

            poetry.push(infection)

            return poetry
        }

        // account for length
        let largerPoem = poetry
        let smallerPoem = infection

        if (poetry.length < infection.length) {
            largerPoem = infection
            smallerPoem = poetry
        }

        const indeces = []
        while (indeces.length < smallerPoem.length) {
            const index = Math.floor(Math.random() * largerPoem.length + 1)
            if (!indeces.includes(index)) {
                indeces.push(index)
            }
        }

        indeces.sort((a, b) => a - b)

        indeces.forEach((index, i) => {
            largerPoem.splice(index + i, 0, smallerPoem[i])
        })

        return largerPoem
    }
}
