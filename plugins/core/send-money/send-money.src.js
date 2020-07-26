import { LitElement, html, css } from 'lit-element'
import { Epml } from '../../../epml'

import '@material/mwc-button'
import '@material/mwc-textfield'
import '@polymer/paper-progress/paper-progress.js'

const parentEpml = new Epml({ type: 'WINDOW', source: window.parent })

class SendMoneyPage extends LitElement {
    static get properties() {
        return {
            addresses: { type: Array },
            amount: { type: Number },
            errorMessage: { type: String },
            sendMoneyLoading: { type: Boolean },
            btnDisable: { type: Boolean },
            data: { type: Object },
            addressesInfo: { type: Object },
            selectedAddress: { type: Object },
            selectedAddressInfo: { type: Object },
            addressesUnconfirmedTransactions: { type: Object },
            addressInfoStreams: { type: Object },
            unconfirmedTransactionStreams: { type: Object },
            maxWidth: { type: String },
            recipient: { type: String },
            isValidAmount: { type: Boolean },
            balance: { type: Number }
        }
    }

    static get observers() {
        return [
            // "_setSelectedAddressInfo(selectedAddress.*, addressesInfo)"
            '_kmxKeyUp(amount)'
        ]
    }

    static get styles() {
        return css`
            * {
                --mdc-theme-primary: rgb(3, 169, 244);
                --paper-input-container-focus-color: var(--mdc-theme-primary);
            }
            #sendMoneyWrapper {
                /* Extra 3px for left border */
                /* overflow: hidden; */
            }

            /* #sendMoneyWrapper>* {
                width: auto !important;
                padding: 0 15px;
            } */

            #sendMoneyWrapper paper-button {
                float: right;
            }

            #sendMoneyWrapper .buttons {
                /* --paper-button-ink-color: var(--paper-green-500);
                    color: var(--paper-green-500); */
                width: auto !important;
            }

            .address-item {
                --paper-item-focused: {
                    background: transparent;
                }
                ;
                --paper-item-focused-before: {
                    opacity: 0;
                }
                ;
            }

            .address-balance {
                font-size: 42px;
                font-weight: 100;
            }

            .show-transactions {
                cursor: pointer;
            }

            .address-icon {
                border-radius: 50%;
                border: 5px solid;
                /*border-left: 4px solid;*/
                padding: 8px;
            }

            mwc-textfield {
                margin: 0;
            }

            .selectedBalance {
                font-size: 14px;
                display: block;
            }

            .selectedBalance .balance {
                font-size: 22px;
                font-weight: 100;
            }
            paper-progress {
                --paper-progress-active-color: var(--mdc-theme-primary)
            }
        `
    }

    render() {
        return html`
            <div id="sendMoneyWrapper" style="width:auto; padding:10px; background: #fff; height:100vh;">
                <div class="layout horizontal center" style=" padding:12px 15px;">
                    <paper-card style="width:100%; max-width:740px;">
                        <div style="background-color: ${this.selectedAddress.color}; margin:0; color: ${this.textColor(this.selectedAddress.textColor)};">

                            <h3 style="margin:0; padding:8px 0;">Send money</h3>

                            <div class="selectedBalance">
                                <!--  style$="color: {{selectedAddress.color}}" -->
                                <span class="balance">${this.balance} qort</span> available for
                                transfer from
                                <span>${this.selectedAddress.address}</span>
                            </div>
                        </div>

                    </paper-card>
                    <p>
                        <mwc-textfield
                            style="width:100%;"
                            id="amountInput"
                            required
                            label="Amount (qort)"
                            @input=${() => { this._checkAmount() }}
                            type="number" 
                            auto-validate="false"
                            value="${this.amount}">
                        </mwc-textfield>
                    </p>
                    <p>
                        <mwc-textfield style="width:100%;" label="To (address or name)" id="recipient" type="text" value="${this.recipient}"></mwc-textfield>
                    </p>
                    
                    <p style="color:red">${this.errorMessage}</p>
                    <p style="color:green;word-break: break-word;">${this.successMessage}</p>
                    
                    ${this.sendMoneyLoading ? html`
                        <paper-progress indeterminate style="width:100%; margin:4px;"></paper-progress>
                    ` : ''}

                    <div class="buttons" >
                        <div>
                            <mwc-button ?disabled=${this.btnDisable} style="width:100%;" raised autofocus @click=${e => this._sendMoney(e)}>Send &nbsp;
                                <iron-icon icon="send"></iron-icon>
                            </mwc-button>
                        </div>
                    </div>
                    
                    
                </div>
            </div>
        `
    }

    _floor(num) {
        return Math.floor(num)
    }

    _checkAmount(e) {
        this.amount = this.shadowRoot.getElementById('amountInput').value

        if (this.amount.toString()[0] === '-') {

            this.isValidAmount = false
            this.btnDisable = true
            this.shadowRoot.getElementById('amountInput').invalid = true
            this.shadowRoot.getElementById('amountInput').errorMessage = "Cannot Send Negative Amount!"
        } else if (this.amount.toString() === '-') {

            this.isValidAmount = false
            this.btnDisable = true
            this.shadowRoot.getElementById('amountInput').invalid = true
            this.shadowRoot.getElementById('amountInput').errorMessage = "Invalid Amount!"
        }
        else if (this.amount.toString().includes('.') === true) {

            let myAmount = this.amount.toString().split('.')
            if (myAmount[1].length <= 8) {

                this.isValidAmount = true
                this.btnDisable = false
                this.shadowRoot.getElementById('amountInput').invalid = false
                this.shadowRoot.getElementById('amountInput').errorMessage = ""
            } else {

                this.isValidAmount = false
                this.btnDisable = true
                this.shadowRoot.getElementById('amountInput').invalid = true
                this.shadowRoot.getElementById('amountInput').errorMessage = "Invalid Amount!"
            }
        }
        else if ((parseFloat(this.amount) + parseFloat(0.001)) > parseFloat(this.balance)) {

            this.isValidAmount = false
            this.btnDisable = true
            this.shadowRoot.getElementById('amountInput').invalid = true
            this.shadowRoot.getElementById('amountInput').errorMessage = "Insufficient Funds!"
        } else {

            this.isValidAmount = true
            this.btnDisable = false
            this.shadowRoot.getElementById('amountInput').invalid = false
            this.shadowRoot.getElementById('amountInput').errorMessage = ""
        }
    }

    textColor(color) {
        return color == 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.87)'
    }

    pasteToTextBox(elementId) {

        // Return focus to the window
        window.focus()

        navigator.clipboard.readText().then(clipboardText => {

            let element = this.shadowRoot.getElementById(elementId)
            element.value += clipboardText
            element.focus()
        });
    }

    pasteMenu(event, elementId) {

        let eventObject = { pageX: event.pageX, pageY: event.pageY, clientX: event.clientX, clientY: event.clientY, elementId }
        parentEpml.request('openFramePasteMenu', eventObject)
    }

    async _sendMoney(e) {
        const amount = this.shadowRoot.getElementById('amountInput').value
        let recipient = this.shadowRoot.getElementById('recipient').value

        this.sendMoneyLoading = true
        this.btnDisable = true

        const getLastRef = async () => {
            let myRef = await parentEpml.request('apiCall', {
                type: 'api',
                url: `/addresses/lastreference/${this.selectedAddress.address}`
            })
            return myRef
        };

        const validateName = async (receiverName) => {
            let myRes
            let myNameRes = await parentEpml.request('apiCall', {
                type: 'api',
                url: `/names/${receiverName}`
            })

            if (myNameRes.error === 401) {
                myRes = false
            } else {
                myRes = myNameRes
            }

            return myRes
        }

        const validateAddress = async (receiverAddress) => {
            let myAddress = await window.parent.validateAddress(receiverAddress)
            return myAddress
        }

        const validateReceiver = async recipient => {
            let lastRef = await getLastRef();
            let isAddress

            try {
                isAddress = await validateAddress(recipient)
            } catch (err) {
                isAddress = false
            }

            if (isAddress) {
                let myTransaction = await makeTransactionRequest(recipient, lastRef)
                getTxnRequestResponse(myTransaction)
            } else {
                let myNameRes = await validateName(recipient)
                if (myNameRes !== false) {
                    let myNameAddress = myNameRes.owner
                    let myTransaction = await makeTransactionRequest(myNameAddress, lastRef)
                    getTxnRequestResponse(myTransaction)
                } else {

                    console.error("INVALID_RECEIVER")
                    this.errorMessage = "INVALID_RECEIVER"
                    this.sendMoneyLoading = false
                    this.btnDisable = false

                }
            }
        }

        const makeTransactionRequest = async (receiver, lastRef) => {
            let myReceiver = receiver
            let mylastRef = lastRef

            let myTxnrequest = await parentEpml.request('transaction', {
                type: 2,
                nonce: this.selectedAddress.nonce,
                params: {
                    recipient: myReceiver,
                    amount: amount,
                    lastReference: mylastRef,
                    fee: 0.001
                }
            })

            return myTxnrequest
        }

        const getTxnRequestResponse = (txnResponse) => {

            if (txnResponse.success === false && txnResponse.message) {
                this.errorMessage = txnResponse.message
                this.sendMoneyLoading = false
                this.btnDisable = false
                throw new Error(txnResponse)
            } else if (txnResponse.success === true && !txnResponse.data.error) {
                this.errorMessage = ''
                this.recipient = ''
                this.amount = 0
                this.successMessage = 'Transaction Successful!'
                this.sendMoneyLoading = false
                this.btnDisable = false
            } else {
                this.errorMessage = txnResponse.data.message
                this.sendMoneyLoading = false
                this.btnDisable = false
                throw new Error(txnResponse)
            }
        }

        validateReceiver(recipient)
    }

    _textMenu(event) {

        const getSelectedText = () => {
            var text = "";
            if (typeof window.getSelection != "undefined") {
                text = window.getSelection().toString();
            } else if (typeof this.shadowRoot.selection != "undefined" && this.shadowRoot.selection.type == "Text") {
                text = this.shadowRoot.selection.createRange().text;
            }
            return text;
        }

        const checkSelectedTextAndShowMenu = () => {
            let selectedText = getSelectedText();
            if (selectedText && typeof selectedText === 'string') {

                let _eve = { pageX: event.pageX, pageY: event.pageY, clientX: event.clientX, clientY: event.clientY }

                let textMenuObject = { selectedText: selectedText, eventObject: _eve, isFrame: true }

                parentEpml.request('openCopyTextMenu', textMenuObject)
            }
        }

        checkSelectedTextAndShowMenu()
    }

    updateAccountBalance() {
        clearTimeout(this.updateAccountBalanceTimeout)
        parentEpml.request('apiCall', {
            url: `/addresses/balance/${this.selectedAddress.address}`
        }).then(res => {
            this.balance = res

            this.updateAccountBalanceTimeout = setTimeout(() => this.updateAccountBalance(), 4000)
        })
    }

    constructor() {
        super()
        this.recipient = ''
        this.addresses = []
        this.errorMessage = ''
        this.sendMoneyLoading = false
        this.btnDisable = false
        this.data = {}
        this.addressesInfo = {}
        this.selectedAddress = {}
        this.selectedAddressInfo = {
            nativeBalance: {
                total: {}
            }
        }
        this.addressesUnconfirmedTransactions = {}
        this.addressInfoStreams = {}
        this.unconfirmedTransactionStreams = {}
        this.maxWidth = '600'
        this.amount = 0
        this.isValidAmount = false

        let configLoaded = false

        parentEpml.ready().then(() => {
            parentEpml.subscribe('selected_address', async selectedAddress => {
                this.selectedAddress = {}
                selectedAddress = JSON.parse(selectedAddress)
                if (!selectedAddress || Object.entries(selectedAddress).length === 0) return
                this.selectedAddress = selectedAddress
                const addr = selectedAddress.address

                this.updateAccountBalance()
            })
            parentEpml.subscribe('config', c => {
                if (!configLoaded) {
                    configLoaded = true
                }
                this.config = JSON.parse(c)
            })
            parentEpml.subscribe('copy_menu_switch', async value => {

                if (value === 'false' && window.getSelection().toString().length !== 0) {

                    this.clearSelection()
                }
            })
            parentEpml.subscribe('frame_paste_menu_switch', async res => {

                res = JSON.parse(res)
                if (res.isOpen === false && this.isPasteMenuOpen === true) {

                    this.pasteToTextBox(res.elementId)
                    this.isPasteMenuOpen = false
                }
            })
        })
    }

    firstUpdated() {

        window.addEventListener("contextmenu", (event) => {

            event.preventDefault();
            this._textMenu(event)
        });

        window.addEventListener("click", () => {

            parentEpml.request('closeCopyTextMenu', null)
        });

        window.onkeyup = (e) => {
            if (e.keyCode === 27) {

                parentEpml.request('closeCopyTextMenu', null)
            }
        }


        // TODO: Rewrite the context menu event listener to support more elements (for now, I'll do write everything out manually )

        this.shadowRoot.getElementById("amountInput").addEventListener('contextmenu', (event) => {

            const getSelectedText = () => {
                var text = "";
                if (typeof window.getSelection != "undefined") {
                    text = window.getSelection().toString();
                } else if (typeof this.shadowRoot.selection != "undefined" && this.shadowRoot.selection.type == "Text") {
                    text = this.shadowRoot.selection.createRange().text;
                }
                return text;
            }

            const checkSelectedTextAndShowMenu = () => {
                let selectedText = getSelectedText();
                if (selectedText && typeof selectedText === 'string') {
                    // ...
                } else {

                    this.pasteMenu(event, 'amountInput')
                    this.isPasteMenuOpen = true

                    // Prevent Default and Stop Event Bubbling
                    event.preventDefault()
                    event.stopPropagation()

                }
            }

            checkSelectedTextAndShowMenu()

        })

        this.shadowRoot.getElementById("recipient").addEventListener('contextmenu', (event) => {

            const getSelectedText = () => {
                var text = "";
                if (typeof window.getSelection != "undefined") {
                    text = window.getSelection().toString();
                } else if (typeof this.shadowRoot.selection != "undefined" && this.shadowRoot.selection.type == "Text") {
                    text = this.shadowRoot.selection.createRange().text;
                }
                return text;
            }

            const checkSelectedTextAndShowMenu = () => {
                let selectedText = getSelectedText();
                if (selectedText && typeof selectedText === 'string') {
                    // ...
                } else {

                    this.pasteMenu(event, 'recipient')
                    this.isPasteMenuOpen = true

                    // Prevent Default and Stop Event Bubbling
                    event.preventDefault()
                    event.stopPropagation()

                }
            }

            checkSelectedTextAndShowMenu()

        })


    }

    clearSelection() {

        window.getSelection().removeAllRanges()
        window.parent.getSelection().removeAllRanges()
    }
}

window.customElements.define('send-money-page', SendMoneyPage)
