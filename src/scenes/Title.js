class Title extends Phaser.Scene {
    constructor() {
        super('titleScene')
    }

    init(data) {
        this.FONTSIZE = 30
        this.PADDING = 5

        this.CURSOR = '> '
        this.TEXTSTYLING = { fontSize: this.FONTSIZE + 'px' }

        this.JSON = data.JSON
    }

    create() {
        // running checks
        console.log('%cTITLE SCENE :^)', testColor)

        //#region ------------------------------- MENU TEXT

        // create menu display
        const titleText = [
            { text: 'game title', class: 'title' },
            { class: 'new-line' },
            {
                text: 'press enter to start',
                interactable: true,
                function: this.start.bind(this),
            },
            {
                text: 'press enter to clean',
                interactable: true,
                id: 'clean',
                function: this.clean.bind(this),
            },
            { text: 'are you sure? (y/n)', displayable: true, reference: 'clean', tab: true },
        ]

        // src = https://chatgpt.com/share/67437d00-c64c-800d-aa91-7ae028b86ade
        const textObjects = []
        let current = titleText.find(element => element.interactable)

        // render text
        this.posY = centerY
        titleText.forEach(element => {
            const text = this.renderText(element)
            textObjects.push(text)
        })

        this.selected = textObjects[titleText.indexOf(current)]

        //#endregion

        //#region ------------------------------- CURSOR MOVEMENT

        // assign cursor and allow for move
        this.updateCursorText(titleText, textObjects, current)

        this.input.keyboard.on('keydown-UP', () => {
            current = titleText[this.getUpdatedCursorPos(titleText, current, -1)]
            this.updateCursorText(titleText, textObjects, current)
            this.selected = textObjects[titleText.indexOf(current)]
        })

        this.input.keyboard.on('keydown-DOWN', () => {
            current = titleText[this.getUpdatedCursorPos(titleText, current, 1)]
            this.updateCursorText(titleText, textObjects, current)
            this.selected = textObjects[titleText.indexOf(current)]
        })

        //#endregion

        //#region ------------------------------- ALLOW INTERACTION

        titleText.forEach(element => {
            if (element.reference) {
                const indexes = [...titleText.keys()].filter(
                    index => titleText[index].id === element.reference,
                )

                indexes.forEach(targetIndex => {
                    const targetElement = textObjects[targetIndex]
                    document.addEventListener('keydown', event => {
                        if (this.selected == targetElement && event.key === 'Enter') {
                            textObjects[titleText.indexOf(element)].setAlpha(1)
                        }
                    })
                })
            }

            if (element.function) {
                const targetElement = textObjects[titleText.indexOf(element)]

                document.addEventListener('keydown', event => {
                    if (this.selected === targetElement && event.key === 'Enter') {
                        element.function.call(this, targetElement, textObjects, titleText)
                    }
                })
            }
        })

        //#endregion
    }

    renderText(element) {
        // ensure new lines don't display 'undefined'
        if (element.class == 'new-line') {
            element.text = ''
        }

        this.posY += this.FONTSIZE + this.PADDING

        // add text to screen
        return this.add
            .text(
                centerX,
                this.posY,
                `${element.tab ? '    ' : ''}` + element.text,
                this.TEXTSTYLING,
            )
            .setAlpha(element.displayable ? 0 : 1)
    }

    updateCursorText(array, textObjects, current) {
        // ensure cursor is removed
        array.forEach((element, idx) => {
            if (textObjects[idx]) {
                const content = element.text || ''
                textObjects[idx].setText(`${element.tab ? '    ' : ''}${content}`)
            }
        })

        // add cursor to selected element
        if (textObjects[array.indexOf(current)]) {
            textObjects[array.indexOf(current)].setText(
                `${current.tab ? '    ' : ''}${this.CURSOR}${current.text}`,
            )
        }
    }

    getUpdatedCursorPos(array, current, nextMove) {
        assert(nextMove == 1 || nextMove == -1)

        // find next interactable element
        for (
            let i = array.indexOf(current) + nextMove;
            nextMove == 1 ? i < array.length : i >= 0;
            i += nextMove
        ) {
            if (array[i].interactable) {
                return i
            }
        }

        // if no interactable element, return unchanged
        return array.indexOf(current)
    }

    start() {
        this.scene.start('cardsScene')
    }

    clean(element, textObjects, titleText) {
        const keyY = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Y)
        const keyN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N)

        const id = titleText[textObjects.indexOf(element)].id
        const indexes = [...titleText.keys()].filter(index => titleText[index].reference === id)

        keyY.on('down', () => {
            const a = textObjects.find(
                targetElement =>
                    indexes.includes(textObjects.indexOf(targetElement)) &&
                    targetElement.alpha == 1,
            )
            if (a) {
                console.log('clean up')
            }
        })

        keyN.on('down', () => {
            indexes.forEach(targetIndex => {
                textObjects[targetIndex].setAlpha(0)
            })
        })
    }
}

// check that condition is correct, stop program if it isn't
// ex: let test = 0; assert(test == 1); throw error
function assert(condition, message) {
    // src = https://stackoverflow.com/questions/15313418/what-is-assert-in-javascript
    if (!condition) {
        throw new Error(message ?? `Assertion failed: condition is ${condition}`)
    }
}
