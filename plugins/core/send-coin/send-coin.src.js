import { LitElement, html, css } from 'lit-element'
import { Epml } from '../../../epml'

import '@material/mwc-button'
import '@material/mwc-textfield'
import '@material/mwc-select'
import '@material/mwc-list/mwc-list-item.js'
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
            selectedAddress: { type: Object },
            recipient: { type: String },
            isValidAmount: { type: Boolean },
            balance: { type: Number },
            btcBalance: { type: Number },
            selectedCoin: { type: String },
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
                display: none;
                font-size: 14px;
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
                                <span id="balance"></span> available for
                                transfer from
                                <span id="address"></span>
                            </div>
                        </div>

                    </paper-card>
                    <p>
                        <mwc-select id="coinType" label="Select Coin" index="0" @selected=${(e) => this.selectCoin(e)} style="min-width: 130px; max-width:100%; width:100%;">
                            <mwc-list-item value="qort">QORT</mwc-list-item>
                            <mwc-list-item value="btc">BTC</mwc-list-item>
                        </mwc-select>
                    </p>
                    <p>
                        <mwc-textfield
                            style="width:100%;"
                            id="amountInput"
                            required
                            label="Amount (qort)"
                            @input=${(e) => { this._checkAmount(e) }}
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
                            <mwc-button ?disabled=${this.btnDisable} style="width:100%;" raised icon="send" @click=${e => this.doSend(e)}>Send &nbsp;</mwc-button>
                        </div>
                    </div>
                    
                    
                </div>
            </div>
        `
    }

    _floor(num) {
        return Math.floor(num)
    }

    // Helper Functions (Re-Used in Most part of the UI )

    /**
    * Check and Validate Amount Helper Function
    * @param { Event } e
    *
    * @description Gets called oninput in an input element
    */

    _checkAmount(e) {

        const targetAmount = e.target.value
        const target = e.target

        if (targetAmount.length === 0) {

            this.isValidAmount = false
            this.btnDisable = true

            // Quick Hack to lose and regain focus inorder to display error message without user having to click outside the input field
            e.target.blur()
            e.target.focus()

            e.target.invalid = true
            e.target.validationMessage = "Invalid Amount!"

        } else if ((parseFloat(targetAmount) + parseFloat(0.001)) > parseFloat(this.balance)) {

            this.isValidAmount = false
            this.btnDisable = true

            e.target.blur()
            e.target.focus()

            e.target.invalid = true
            e.target.validationMessage = "Insufficient Funds!"
        } else {

            this.btnDisable = false
        }

        e.target.blur()
        e.target.focus()

        e.target.validityTransform = (newValue, nativeValidity) => {


            if (newValue.includes('-') === true) {

                this.btnDisable = true
                target.validationMessage = "Invalid Amount!"

                return {
                    valid: false
                }
            } else if (!nativeValidity.valid) {

                if (newValue.includes('.') === true) {

                    let myAmount = newValue.split('.')
                    if (myAmount[1].length > 8) {

                        this.btnDisable = true
                        target.validationMessage = "Invalid Amount!"
                    } else {

                        return {
                            valid: true
                        }
                    }
                }
            } else {

                this.btnDisable = false
            }
        }

        // else {

        //     this.isValidAmount = true
        //     this.btnDisable = false
        //     e.target.invalid = false
        //     e.target.validationMessage = ""
        // }
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

    doSend(e) {
        // ...

        if (this.selectedCoin === 'invalid') {

            parentEpml.request('showSnackBar', "Invalid Selection!");
        } else if (this.selectedCoin === 'qort') {

            this.sendQort()
        } else if (this.selectedCoin === 'btc') {

            this.sendBtc()
        }
    }

    async sendQort() {
        const amount = this.shadowRoot.getElementById('amountInput').value
        let recipient = this.shadowRoot.getElementById('recipient').value

        this.sendMoneyLoading = true
        this.btnDisable = true

        if ((parseFloat(amount) + parseFloat(0.001)) > parseFloat(this.balance)) {

            this.sendMoneyLoading = false
            this.btnDisable = false

            parentEpml.request('showSnackBar', "Insufficient Funds!")
            return false
        }

        if ((parseFloat(amount)) <= 0) {

            this.sendMoneyLoading = false
            this.btnDisable = false

            parentEpml.request('showSnackBar', "Invalid Amount!")
            return false
        }

        if (recipient.length === 0) {

            this.sendMoneyLoading = false
            this.btnDisable = false

            parentEpml.request('showSnackBar', "Receiver cannot be empty!")
            return false
        }

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


    async sendBtc() {
        const amount = this.shadowRoot.getElementById('amountInput').value
        let recipient = this.shadowRoot.getElementById('recipient').value

        this.sendMoneyLoading = true
        this.btnDisable = true

        const makeRequest = async () => {

            const response = await parentEpml.request('sendBtc', {
                xprv58: this.selectedAddress.btcWallet.derivedMasterPrivateKey,
                receivingAddress: recipient,
                bitcoinAmount: amount
            })

            return response
        }

        const manageResponse = (response) => {

            if (response === true) {

                this.shadowRoot.getElementById('amountInput').value = ''
                this.shadowRoot.getElementById('recipient').value = ''
                this.errorMessage = ''
                this.recipient = ''
                this.amount = 0
                this.successMessage = 'Transaction Successful!'
                this.sendMoneyLoading = false
                this.btnDisable = false
            } else if (response === false) {

                this.errorMessage = 'Transaction Failed!'
                this.sendMoneyLoading = false
                this.btnDisable = false
                throw new Error(txnResponse)
            } else {

                this.errorMessage = response.message
                this.sendMoneyLoading = false
                this.btnDisable = false
                throw new Error(response)
            }
        }

        // Call makeRequest
        const res = await makeRequest()
        manageResponse(res)
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
        this.errorMessage = ''
        this.sendMoneyLoading = false
        this.btnDisable = false
        this.selectedAddress = {}
        this.amount = 0
        this.isValidAmount = false
        this.btcBalance = 0
        this.selectedCoin = 'invalid'

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

        // Get BTC Balance
        this.updateBTCAccountBalance()

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

    selectCoin(e) {
        const coinType = this.shadowRoot.getElementById('coinType').value
        this.selectedCoin = coinType

        if (coinType === 'qort') {

            this.shadowRoot.getElementById('balance').textContent = `${this.balance} QORT`
            this.shadowRoot.getElementById('address').textContent = this.selectedAddress.address
            this.shadowRoot.querySelector('.selectedBalance').style.display = 'block'
            this.shadowRoot.getElementById('amountInput').label = "Amount (QORT)"
            this.shadowRoot.getElementById('recipient').label = "To (address or name)"
        } else if (coinType === 'btc') {

            this.shadowRoot.getElementById('balance').textContent = `${this.btcBalance} BTC`
            this.shadowRoot.getElementById('address').textContent = this.selectedAddress.btcWallet.address
            this.shadowRoot.querySelector('.selectedBalance').style.display = 'block'
            this.shadowRoot.getElementById('amountInput').label = "Amount (BTC)"
            this.shadowRoot.getElementById('recipient').label = "To (BTC address)"
        } else {
            this.selectedCoin = 'invalid'
        }
    }

    updateBTCAccountBalance() {

        parentEpml.request('apiCall', {
            url: `/crosschain/btc/walletbalance`,
            method: "POST",
            body: window.parent.reduxStore.getState().app.selectedAddress.btcWallet.derivedMasterPrivateKey
        }).then(res => {
            this.btcBalance = (Number(res) / 1e8).toFixed(8)
        })
    }

    clearSelection() {

        window.getSelection().removeAllRanges()
        window.parent.getSelection().removeAllRanges()
    }
}

window.customElements.define('send-coin-page', SendMoneyPage)
