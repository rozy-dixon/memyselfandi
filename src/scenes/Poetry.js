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

        //this.images.forEach(element => {
        //    this.add.image(centerX / 2, centerY, element.image).setOrigin(0.5, 0.5)
        //})

        //#region ------------------------------- DISPLAY PREP

        this.posY = centerY
        let i = 0

        // [ ] add pause on begin

        this.image = undefined
        const renderNext = () => {
            if (i < displayText.length) {
                this.renderLine(displayText[i], renderNext)
                this.renderImage(displayImage[i])
                i++
            }
        }

        this.stanza = this.add.group()

        renderNext()

        //#endregion
    }

    renderLine(text, renderNext) {
        this.posY += this.FONTSIZE + this.PADDING
        this.typewriteText(text, this.posY, renderNext)
    }

    typewriteText(text, posY, onComplete) {
        // src = https://phaser.discourse.group/t/how-to-reveal-text-word-by-word/9183
        let i = 0
        const len = text.length
        if (posY >= 1235) {
            this.stanza.getChildren().forEach(element => {
                element.setY(element.y - 35)
            })
            posY = 1200
        }
        const textObject = this.add.text(centerX, posY, '', this.TEXTSTYLING)

        this.stanza.add(textObject)

        console.log()

        // [ ] when textobject reaches the top of the page, delete

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
                    
                    // Call renderNext()
                    onComplete()
                }
            },
            callbackScope: this,
            loop: true,
        })
    }

    renderImage(key) {
        if (this.image == undefined && key != null) {
            this.image = this.add.image(centerX / 2, centerY, key).setOrigin(0.5, 0.5)
        } else if (this.image != undefined && key == null) {
            this.image.destroy()
            this.image = undefined
        }
    }
}
