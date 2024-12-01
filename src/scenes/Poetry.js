class Poetry extends Phaser.Scene {
    constructor() {
        super('poetryScene')
    }

    init(data) {
        this.FONTSIZE = 30
        this.PADDING = 5

        this.TEXTSTYLING = { fontSize: this.FONTSIZE + 'px', wordWrap: { width: 920, useAdvancedWrap: true }, lineSpacing: this.PADDING - 1 }

        this.STANZA = data.STANZA
        this.JSON = data.JSON
    }

    create() {
        // running checks
        console.log('%cPOETRY SCENE :^)', testColor)

        //#region ------------------------------- DATA RETRIEVAL

        this.nextPosition = this.JSON.poetry[this.STANZA].location
        const displayText = []

        this.JSON.poetry[this.STANZA].text.forEach((element) => {
            const formattingObject = this.add.text(centerX, centerY, element, this.TEXTSTYLING).setAlpha(0)
            formattingObject.getWrappedText().forEach((line) => {
                displayText.push(line)
            })
            formattingObject.destroy()
        })

        //#endregion

        this.posY = centerY
        let i = 0

        // add pause on enter
        const renderNext = () => {
            if (i < displayText.length) {
                this.renderLine(displayText[i], renderNext)
                i++
            }
        }

        this.stanza = this.add.group()

        renderNext()
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
            this.stanza.getChildren().forEach((element) => {
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
                    if (onComplete) {
                        onComplete()
                    }
                }
            },
            callbackScope: this,
            loop: true,
        })
    }
}
