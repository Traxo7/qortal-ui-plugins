import { LitElement, html, css } from 'lit-element'
import { Epml } from '../../../epml.js'

import '@github/time-elements'

const parentEpml = new Epml({ type: 'WINDOW', source: window.parent })

class TimeAgo extends LitElement {
    static get properties() {
        return {
            selectedAddress: { type: Object },
            config: { type: Object },
            timestamp: { type: Number, reflect: true },
            timeIso: { type: String }
        }
    }

    static get styles() {
        return css``
    }

    updated(changedProps) {
        changedProps.forEach((OldProp, name) => {
            if (name === 'timeIso') {
                this.renderTime(this.timestamp)
            }
        });
    }

    constructor() {
        super()
        this.selectedAddress = {}
        this.config = {
            user: {
                node: {

                }
            }
        }
        this.timestamp = 0
        this.timeIso = ''
    }

    render() {

        return html`
            <time-ago datetime=${this.timeIso}> </time-ago>
        `
    }

    renderTime(timestamp) {
        let time = new Date(timestamp);
        this.timeIso = time.toISOString()

    }


    firstUpdated() {
        let configLoaded = false

        parentEpml.ready().then(() => {
            parentEpml.subscribe('selected_address', async selectedAddress => {
                this.selectedAddress = {}
                selectedAddress = JSON.parse(selectedAddress)
                if (!selectedAddress || Object.entries(selectedAddress).length === 0) return
                this.selectedAddress = selectedAddress
            })
            parentEpml.subscribe('config', c => {
                if (!configLoaded) {
                    configLoaded = true
                }
                this.config = JSON.parse(c)
            })
        })

        parentEpml.imReady()
    }

}

window.customElements.define('message-time', TimeAgo)
