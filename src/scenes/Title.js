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

        this.TEXTORIGIN = mobile ? 40 : centerX
        this.GESTURE = mobile ? 'tap to ' : 'press enter to '
        this.YN = mobile ? ' right to confirm, left to cancel' : ' (y/n)'
    }

    create() {
        // running checks
        console.log('%cTITLE SCENE :^)', testColor)

        //#region ------------------------------- DATA RETRIEVAL

        this.startingPosition = this.JSON.poetry[0].location
        this.title = this.JSON.title

        //#endregion

        //#region ------------------------------- MENU TEXT

        // create menu display
        this.titleText = [
            { text: this.title, class: 'title' },
            { class: 'new-line' },
            {
                text: this.GESTURE + 'start',
                interactable: true,
                function: this.start.bind(this),
            },
            {
                text: this.GESTURE + 'write',
                interactable: true,
                function: this.write.bind(this),
            },
            {
                text: this.GESTURE + 'import',
                interactable: true,
                function: this.import.bind(this),
            },
            { class: 'new-line' },
            {
                text: this.GESTURE + 'clean',
                interactable: true,
                id: 'clean',
                function: this.clean.bind(this),
            },
            { text: 'are you sure?' + this.YN, displayable: true, reference: 'clean', tab: true },
        ]

        // src = https://chatgpt.com/share/67437d00-c64c-800d-aa91-7ae028b86ade
        this.textObjects = []
        let current = this.titleText.find(element => element.interactable)

        // render text
        this.posY = centerY
        this.titleText.forEach(element => {
            const text = this.renderText(element)
            this.textObjects.push(text)
        })

        this.selected = this.textObjects[this.titleText.indexOf(current)]

        //#endregion

        //#region ------------------------------- CURSOR MOVEMENT

        // assign cursor and allow for move
        this.updateCursorText(this.titleText, this.textObjects, current)

        this.input.keyboard.on('keydown-UP', () => {
            current = this.titleText[this.getUpdatedCursorPos(this.titleText, current, -1)]
            this.updateCursorText(this.titleText, this.textObjects, current)
            this.selected = this.textObjects[this.titleText.indexOf(current)]
        })

        this.input.keyboard.on('keydown-DOWN', () => {
            current = this.titleText[this.getUpdatedCursorPos(this.titleText, current, 1)]
            this.updateCursorText(this.titleText, this.textObjects, current)
            this.selected = this.textObjects[this.titleText.indexOf(current)]
        })

        //#endregion

        //#region ------------------------------- SWIPE INTERACTION

        this.clicking = false
        document.addEventListener('swipe', event => {
            this.input.keyboard.emit('keydown-' + event.detail.direction)
        })

        //#endregion

        //#region ------------------------------- ALLOW INTERACTION

        this.titleText.forEach(element => {
            if (element.reference) {
                const indexes = [...this.titleText.keys()].filter(
                    index => this.titleText[index].id === element.reference,
                )

                indexes.forEach(targetIndex => {
                    const targetElement = this.textObjects[targetIndex]
                    this.input.keyboard.on('keydown-ENTER', () => {
                        if (this.selected == targetElement) {
                            this.textObjects[this.titleText.indexOf(element)].setAlpha(1)
                        }
                    })
                })
            }

            if (element.function) {
                const targetElement = this.textObjects[this.titleText.indexOf(element)]

                this.input.keyboard.on('keydown-ENTER', () => {
                    if (this.selected === targetElement) {
                        element.function.call(this, targetElement, this.textObjects, this.titleText)
                    }
                })
            }
        })

        //#endregion
    }

    update() {
        this.isSwiping()
    }

    //#region ----------------------------------- CONTENT SETUP HELPERS

    renderText(element) {
        // ensure new lines don't display 'undefined'
        if (element.class == 'new-line') {
            element.text = ''
        }

        this.posY += this.FONTSIZE + this.PADDING

        // add text to screen
        return this.add
            .text(
                this.TEXTORIGIN,
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

    //#endregion

    //#region ----------------------------------- MENU OPTION RESULTS

    start() {
        if (this.scene.isActive('titleScene')) {
            this.scene.start(`${this.startingPosition}`, {
                STANZA: 0,
                JSON: this.JSON,
            })
        }
    }

    import() {
        this.input = document.createElement('input')
        this.input.type = 'file'

        this.input.addEventListener('change', () => {
            const jsonFile = this.input.files[0]
            if (jsonFile) {
                console.log(true)

                const reader = new FileReader()
                reader.onload = event => {
                    console.log('File content:', event.target.result)
                    this.JSON = JSON.parse(event.target.result)

                    this.titleText[0].text = this.JSON.title
                    this.textObjects[0].setText(this.JSON.title)
                }

                reader.readAsText(jsonFile)
            } else {
                console.log('No file selected.')
            }
        })

        // trigger the file dialog
        this.input.click()
    }

    clean(element, textObjects, titleText) {
        const id = titleText[textObjects.indexOf(element)].id
        const indexes = [...titleText.keys()].filter(index => titleText[index].reference === id)

        this.input.keyboard.on('keydown-Y', () => {
            if (
                textObjects.find(
                    targetElement =>
                        indexes.includes(textObjects.indexOf(targetElement)) &&
                        targetElement.alpha == 1,
                )
            ) {
                localStorage.clear()

                location.reload()
            }
        })

        this.input.keyboard.on('keydown-N', () => {
            indexes.forEach(targetIndex => {
                textObjects[targetIndex].setAlpha(0)
            })
        })
    }

    write() {
        window.location.href = 'creation.html'
    }

    //#endregion

    //#region ----------------------------------- IMAGE TESTING

    importImage() {
        console.log('image time')

        this.input = document.createElement('input')
        this.input.type = 'file'

        this.input.addEventListener('change', () => {
            const imageFile = this.input.files[0]
            if (imageFile) {
                console.log(imageFile)
            } else {
                console.log('No file selected.')
            }
        })

        this.input.click()
    }

    //#region ----------------------------------- HELPERS
    isSwiping() {
        if (!this.input.activePointer.isDown && this.clicking == true) {
            // src = https://www.thepolyglotdeveloper.com/2020/09/include-touch-cursor-gesture-events-phaser-game/
            // favor up and down movement
            if (Math.abs(this.input.activePointer.upY - this.input.activePointer.downY) >= 50) {
                if (this.input.activePointer.upY < this.input.activePointer.downY) {
                    this.swipeDirection = 'up'
                    this.dispatchSwipeEvent('UP')
                } else if (this.input.activePointer.upY > this.input.activePointer.downY) {
                    this.swipeDirection = 'down'
                    this.dispatchSwipeEvent('DOWN')
                }
            } else if (
                Math.abs(this.input.activePointer.upX - this.input.activePointer.downX) >= 50
            ) {
                if (this.input.activePointer.upX < this.input.activePointer.downX) {
                    this.swipeDirection = 'left'
                    this.dispatchSwipeEvent('N')
                } else if (this.input.activePointer.upX > this.input.activePointer.downX) {
                    this.swipeDirection = 'right'
                    this.dispatchSwipeEvent('Y')
                }
            } else {
                this.dispatchSwipeEvent('ENTER')
            }
            this.clicking = false
        } else if (this.input.activePointer.isDown && this.clicking == false) {
            this.clicking = true
        }
    }

    dispatchSwipeEvent(direction) {
        const swipeEvent = new CustomEvent('swipe', {
            detail: {
                direction: direction,
            },
        })

        document.dispatchEvent(swipeEvent)
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
