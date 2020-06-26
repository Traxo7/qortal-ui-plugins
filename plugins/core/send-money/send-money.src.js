import '@webcomponents/webcomponentsjs/webcomponents-loader.js'
/* Es6 browser but transpi;led code */
import '@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js'

import { LitElement, html, css } from 'lit-element'
// import { ERROR_CODES } from '../../../src/qora/constants.js'
// import { Epml } from '../../../src/epml.js'
import { Epml } from '../../../epml'
import '@material/mwc-button'
import '@polymer/paper-input/paper-input.js'
import '@polymer/paper-progress/paper-progress.js'
// import '@polymer/paper-spinner/paper-spinner-lite.js'

const parentEpml = new Epml({ type: 'WINDOW', source: window.parent })

const coreEpml = new Epml({
    type: 'PROXY',
    source: {
        id: 'visible-plugin',
        target: 'core-plugin',
        proxy: parentEpml
    }
})

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

            paper-input {
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
                    <paper-input
                        id="amountInput"
                        required
                        label="Amount (qort)"
                        @input=${() => { this._checkAmount() }}
                        type="number" 
                        auto-validate="false"
                        value="${this.amount}">
                        </paper-input>
                    <paper-input label="To (address or name)" id="recipient" type="text" value="${this.recipient}"></paper-input>
                    <!-- <paper-input label="Fee" type="text" value="{{fee}}"></paper-input> -->
                    
                    <p style="color:red">${this.errorMessage}</p>
                    <p style="color:green;word-break: break-word;">${this.successMessage}</p>
                    
                    ${this.sendMoneyLoading ? html`
                        <paper-progress indeterminate style="width:100%; margin:4px;"></paper-progress>
                        <!-- <paper-spinner-lite></paper-spinner-lite> -->
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
        // const balance = this.balance
        // console.log(parseFloat(amount), parseFloat(balance))
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
        // this.isValidAmount = parseFloat(this.amount) <= parseFloat(balance)
        // console.log(this.isValidAmount)
    }

    textColor(color) {
        return color == 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.87)'
    }

    async _sendMoney(e) {
        const amount = this.shadowRoot.getElementById('amountInput').value // * Math.pow(10, 8)
        let recipient = this.shadowRoot.getElementById('recipient').value

        this.sendMoneyLoading = true
        this.btnDisable = true

        // Get Last Ref...
        // Might want to call it with the sender's address or just pick it from the func..
        const getLastRef = async () => {
            let myRef = await parentEpml.request('apiCall', {
                type: 'api',
                url: `/addresses/lastreference/${this.selectedAddress.address}`
            })
            return myRef
        };

        // Validate name
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

        // Validate Address UPDATE: Use the crypto module to validate addr
        const validateAddress = async (receiverAddress) => {
            let myAddress = await parentEpml.request('apiCall', {
                type: 'api',
                url: `/addresses/validate/${receiverAddress}`
            })
            return myAddress
        }

        // Validate Receiver
        const validateReceiver = async recipient => {
            let lastRef = await getLastRef();
            let isAddress = await validateAddress(recipient)
            if (isAddress) {
                let myTransaction = await makeTransactionRequest(recipient, lastRef) // THOUGHTS: Might wanna use a setTimeout here...
                getTxnRequestResponse(myTransaction)
            } else {
                let myNameRes = await validateName(recipient)
                if (myNameRes !== false) {
                    let myNameAddress = myNameRes.owner
                    let myTransaction = await makeTransactionRequest(myNameAddress, lastRef)
                    getTxnRequestResponse(myTransaction)
                } else {
                    // Return INVALID_RECEIVER
                    console.error("INVALID_RECEIVER") // THOUGHTS: Handle this properly..
                    this.errorMessage = "INVALID_RECEIVER"
                    this.sendMoneyLoading = false
                    this.btnDisable = false

                }
            }
        }

        // Make Transaction Request
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
                    // Fees shouldn't be hard-coded in here...
                }
            })

            return myTxnrequest
        }

        // FAILED txnResponse = {success: false, message: "User declined transaction"}
        // SUCCESS txnResponse = { success: true, data: true }

        const getTxnRequestResponse = (txnResponse) => {
            // const responseData = JSON.parse(txnResponse) // FIX: This is not necessary. GIVES error because response is not a JSON object...

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

        // Call validateReceiver
        // setTimeout(() => {
        //     validateReceiver(recipient)
        // }, 1000);

        // Calling validateReceiver without timeout
        validateReceiver(recipient)

    }

    updateAccountBalance() {
        clearTimeout(this.updateAccountBalanceTimeout)
        parentEpml.request('apiCall', {
            url: `/addresses/balance/${this.selectedAddress.address}`
        }).then(res => {
            // console.log(res)
            this.balance = res
            // console.log(this.config.user.nodeSettings.pingInterval) // FIX: config not defined, so causing error... DONE: config already implemented
            this.updateAccountBalanceTimeout = setTimeout(() => this.updateAccountBalance(), 4000) // can't use "this.config.user.nodeSettings.pingInterval" (too slow...), balance needs to be updated in real-time..
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
        // computed: '_getSelectedAddressInfo(addressesInfo, selectedAddress)'
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
                // console.log('==========================SELECTED ADDRESS',selectedAddress)
                if (!selectedAddress || Object.entries(selectedAddress).length === 0) return // Not ready yet ofc
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
        })
    }
}

window.customElements.define('send-money-page', SendMoneyPage)
