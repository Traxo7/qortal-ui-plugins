/* Webcomponents polyfill... https://github.com/webcomponents/webcomponentsjs#using-webcomponents-loaderjs */
import '@webcomponents/webcomponentsjs/webcomponents-loader.js'
/* Es6 browser but transpi;led code */
import '@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js'

import { LitElement, html, css } from 'lit-element'
// import { render } from 'lit-html'
import { Epml } from '../../../../epml.js'

// Components
// import '../../components/ToolTip.js'

const parentEpml = new Epml({ type: 'WINDOW', source: window.parent })

class ChainMessaging extends LitElement {
    static get properties() {
        return {
            loading: { type: Boolean },
        }
    }

    static get styles() {
        return css`
            * {
                --mdc-theme-primary: rgb(3, 169, 244);
                --paper-input-container-focus-color: var(--mdc-theme-primary);
            }

            paper-spinner-lite{
                height: 24px;
                width: 24px;
                --paper-spinner-color: var(--mdc-theme-primary);
                --paper-spinner-stroke-width: 2px;
            }

            #chain-messaging-page {
                background:#fff;
            }

        `
    }

    constructor() {
        super()
        // ...
    }

    render() {
        return html`
            <div id="chain-messaging-page">

                <h2 style="text-align: center; margin-top: 3rem;">Coming Soon!</h2>
                <!-- <tool-tip toolTipMessage="My ToolTip TExt"></tool-tip> -->          
            </div>
        `
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

    isEmptyArray(arr) {
        if (!arr) { return true }
        return arr.length === 0
    }
}

window.customElements.define('chain-messaging', ChainMessaging)
