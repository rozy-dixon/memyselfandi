class Poetry extends Phaser.Scene {
    constructor() {
        super('poetryScene')
    }

    init(data) {
        this.FONTSIZE = 30
        this.PADDING = 5

        this.TEXTSTYLING = {
            fontSize: this.FONTSIZE + 'px',
            wordWrap: { width: 920, useAdvancedWrap: true },
            lineSpacing: this.PADDING - 1,
        }

        this.STANZA = data.STANZA
        this.JSON = data.JSON
    }

    preload() {
        this.images = this.JSON.poetry[this.STANZA].images

        this.images.forEach(element => {
            this.load.image(element.image, element.image)
        })
    }

    create() {
        // running checks
        console.log('%cPOETRY SCENE :^)', testColor)

        //#region ------------------------------- DATA RETRIEVAL

        this.nextPosition = this.JSON.poetry[this.STANZA].location
        const displayText = []
        const displayImage = []

        // src = https://chatgpt.com/share/674cebf2-5b8c-800d-ab1e-9d93275c8f9d
        const imageMap = new Map()
        this.images.forEach(element => {
            element.indexes.forEach(index => {
                imageMap.set(index, element.image)
            })
        })

        let index = 0
        this.JSON.poetry[this.STANZA].text.forEach(element => {
            const formattingObject = this.add
                .text(centerX, centerY, element, this.TEXTSTYLING)
                .setAlpha(0)
            formattingObject.getWrappedText().forEach(line => {
                displayText.push(line)

                if (imageMap.has(index)) {
                    displayImage.push(imageMap.get(index))
                } else {
                    displayImage.push(null)
                }
            })

            formattingObject.destroy()

            index++
        })

        //#endregion

        //#region ------------------------------- DISPLAY PREP

        this.posY = centerY
        let i = 0
        let lastInStanza = false

        // [ ] add pause on begin

        this.image = undefined
        const renderNext = () => {
            if (i < displayText.length) {
                if (i == displayText.length - 1) {
                    lastInStanza = true
                }
                this.renderLine(displayText[i], renderNext, lastInStanza)
                this.renderImage(displayImage[i])
                i++
            }
        }

        this.stanza = this.add.group()

        renderNext()

        //#endregion
    }

    renderLine(text, renderNext, lastInStanza) {
        this.posY += this.FONTSIZE + this.PADDING
        this.typewriteText(text, this.posY, renderNext, lastInStanza)
    }

    typewriteText(text, posY, onComplete, lastInStanza) {
        // src = https://phaser.discourse.group/t/how-to-reveal-text-word-by-word/9183
        if (text.length == 0) {
            text = ' '
        }

        let i = 0
        const len = text.length

        // schooch objects upward to make room
        if (posY >= 1235) {
            this.stanza.getChildren().forEach(element => {
                element.setY(element.y - 35)
            })
            posY = 1200
        }
        const textObject = this.add.text(centerX, posY, '', this.TEXTSTYLING)

        this.stanza.add(textObject)

        const event = this.time.addEvent({
            delay: 60,
            callback: () => {
                textObject.text += text[i]
                i++

                if (Phaser.Input.Keyboard.JustDown(keyENTER)) {
                    textObject.text = text
                    i = len
                }

                if (i >= len) {
                    event.remove()
                    
                    let alphaInterval = setInterval(() => {
                        if (textObject.alpha > 0) {
                            textObject.setAlpha(textObject.alpha - .05)
                        } else if (lastInStanza && textObject.alpha <= 0) {
                            this.endButton = this.createEnd()
                            document.addEventListener('keydown', event => {
                                if (this.endButton && event.key === 'Enter') {
                                    //this.decay()

                                    location.reload()
                                }
                            })

                            clearInterval(alphaInterval)
                        }
                    }, 50)

                    // Call renderNext()
                    onComplete()
                }
            },
            callbackScope: this,
            loop: true,
        })
    }

    renderImage(key) {
        if (this.image != undefined) {
            this.image.destroy()
            if (key == null) {
                this.image = undefined
            }
        }
        if (key != null) {
            this.image = this.add.image(centerX / 2, centerY, key).setOrigin(0.5, 0.5)
        }
    }

    decay() {
        // [ ] only destroy other's work
        let i = 0
        this.JSON.poetry[this.STANZA].text.forEach(element => {
            if (Math.random() < .5) {
                this.JSON.poetry[this.STANZA].text.splice(i, 1)
            }
            i++
        })

        localStorage.setItem('JSONdata', JSON.stringify(this.JSON))
    }

    createEnd() {
        // add text to screen
        return this.add.text(centerX, 1200, '> ' + 'press enter to return', this.TEXTSTYLING)
    }
}
