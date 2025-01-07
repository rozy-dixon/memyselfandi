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
            color: '#ffffff',
        }
        this.TEXTORIGIN = mobile ? 40 : centerX

        this.GESTURE = mobile ? 'swipe right to ' : 'press enter to '

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
                .text(this.TEXTORIGIN, centerY, element, this.TEXTSTYLING)
                .setAlpha(0)

            formattingObject.getWrappedText().forEach(line => {
                if (
                    formattingObject.text
                        .split('\n')
                        .some(item => item.includes('%c') && item.includes(line)) &&
                    line.slice(0, 2) != '%c'
                ) {
                    line = '%c' + line
                }

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

        this.delay = 60
    }

    update() {
        if (this.input.activePointer.isDown) {
            this.delay = 20
        } else {
            this.delay = 60
        }
    }

    renderLine(text, renderNext, lastInStanza) {
        this.posY += this.FONTSIZE + this.PADDING
        this.typewriteText(text, this.posY, renderNext, lastInStanza, this.delay)
    }

    typewriteText(text, posY, onComplete, lastInStanza, delay = 60) {
        // src = https://phaser.discourse.group/t/how-to-reveal-text-word-by-word/9183

        if (text.slice(0, 2) == '%c') {
            text = text.substring(2)
            this.TEXTSTYLING.color = '#ffff00'
        } else {
            this.TEXTSTYLING.color = '#ffffff'
        }

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
        const textObject = this.add.text(this.TEXTORIGIN, posY, '', this.TEXTSTYLING)

        this.stanza.add(textObject)

        const event = this.time.addEvent({
            delay: delay,
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
                            textObject.setAlpha(textObject.alpha - 0.05)
                        } else if (lastInStanza && textObject.alpha <= 0) {
                            this.endButton = this.createEnd()
                            this.input.keyboard.on('keydown-ENTER', () => {
                                if (this.endButton) {
                                    const tone = this.sound.add('tone')
                                    tone.play()
                                    tone.on('complete', () => {
                                        location.reload()
                                    })
                                }
                            })

                            clearInterval(alphaInterval)
                        }
                    }, 600)

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
            if (Math.random() < 0.5) {
                this.JSON.poetry[this.STANZA].text.splice(i, 1)
            }
            i++
        })

        localStorage.setItem('JSONdata', JSON.stringify(this.JSON))
    }

    createEnd() {
        // add text to screen
        return this.add.text(
            this.TEXTORIGIN,
            1200,
            '> ' + this.GESTURE + 'return',
            this.TEXTSTYLING,
        )
    }
}
