/* Webcomponents polyfill... https://github.com/webcomponents/webcomponentsjs#using-webcomponents-loaderjs */
import '@webcomponents/webcomponentsjs/webcomponents-loader.js'
/* Es6 browser but transpi;led code */
import '@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js'

import { LitElement, html, css } from 'lit-element'
import { render } from 'lit-html'
// import { Epml } from '../../../src/epml.js'
import { Epml } from '../../../epml.js'

import '@material/mwc-icon'
import '@material/mwc-button'
import '@material/mwc-dialog'

import '@polymer/paper-spinner/paper-spinner-lite.js'
// import * as thing from 'time-elements'
import '@vaadin/vaadin-grid/vaadin-grid.js'
import '@vaadin/vaadin-grid/theme/material/all-imports.js'

import '@github/time-elements'

const TX_TYPES = {
    1: 'Genesis',
    2: 'Payment',

    3: 'Name registration',
    4: 'Name update',
    5: 'Sell name',
    6: 'Cancel sell name',
    7: 'Buy name',

    8: 'Create poll',
    9: 'Vote in poll',

    10: 'Arbitrary',

    11: 'Issue asset',
    12: 'Transfer asset',
    13: 'Create asset order',
    14: 'Cancel asset order',
    15: 'Multi-payment transaction',

    16: 'Deploy AT',

    17: 'Message',

    18: 'Chat',
    19: 'Supernode',
    20: 'Airdrop'
}

const parentEpml = new Epml({ type: 'WINDOW', source: window.parent })

const coreEpml = new Epml({
    type: 'PROXY',
    source: {
        id: 'visible-plugin',
        target: 'core-plugin',
        proxy: parentEpml
    }
})

class WalletApp extends LitElement {
    static get properties() {
        return {
            loading: { type: Boolean },
            lastAddress: { type: String },
            transactions: { type: Array },
            lastBlock: { type: Object },
            addressesInfo: { type: Object },
            selectedAddress: { type: Object },
            selectedAddressInfo: { type: Object },
            selectedAddressTransactions: { type: Array },
            addressesUnconfirmedTransactions: { type: Object },
            addressInfoStreams: { type: Object },
            unconfirmedTransactionStreams: { type: Object },
            transactions: { type: Object },
            addressInfo: { type: Object },
            balance: { type: Number },
            selectedTransaction: { type: Object }
        }
    }

    static get styles() {
        return css`
            .red{
                color: var(--paper-red-500);
            }
            .green{
                color: var(--paper-green-500);
            }
            paper-spinner-lite{
                height:75px;
                width:75px;
                --paper-spinner-color: var(--primary-color);
                --paper-spinner-stroke-width: 2px;
            }
            .unconfirmed{
                font-style: italic;
            }
                        .roboto {
                font-family: "Roboto", sans-serif;
            }
            .mono {
                font-family: "Roboto Mono", monospace;
            }
            .weight-100{
                font-weight: 100;
            }
            
            .text-white-primary{
                color: var(--white-primary)
            }
            .text-white-secondary{
                color: var(--white-secondary)
            }
            .text-white-disabled{
                color: var(--white-disabled)
            }
            .text-white-hint{
                color: var(--white-divider)
            }

            table {
                border:none;
            }
            table td, th{
                white-space:nowrap;
                /* padding:10px; */
                text-align:left;
                font-size:14px;
                padding:0 12px;
                font-family: "Roboto", sans-serif;
            }
            table tr {
                height:48px;
            }
            table tr:hover td{
                background:#eee;
            }
            table tr th {
                color: #666;
                font-size:12px;
            }
            table tr td {
                margin:0;
            }
            .white-bg {
                height:100vh;
                background: #fff;
            }
            span {
                font-size: 18px;
                word-break: break-all;
            }
            .title {
                font-weight:600;
                font-size:12px;
                line-height: 32px;
                opacity: 0.66;
            }
            #transactionList {
                padding:0;
            }
            #transactionList > * {
                /* padding-left:24px;
                padding-right:24px; */
            }
            .color-in {
                color: #02977e;
                background-color: rgba(0,201,167,.2);
                font-weight: 700;
                font-size: .60938rem;
                border-radius: .25rem!important;
                padding: .2rem .5rem;
                margin-left: 4px;
            }
            .color-out {
                color: #b47d00;
                background-color: rgba(219,154,4,.2);
                font-weight: 700;
                font-size: .60938rem;
                border-radius: .25rem!important;
                padding: .2rem .5rem;
                margin-left: 4px;
            }
        `
    }

    constructor() {
        super()
        this.lastAddress = ''
        this.transactions = []
        this.lastBlock = {
            height: 0
        }
        this.addressesInfo = {}
        this.selectedAddress = {}
        this.selectedAddressInfo = {
            nativeBalance: {
                total: {}
            },
            transactions: []
        }
        // selectedAddressTransactions: {
        //     value: [],
        //         computed: '_getAllTransactions(selectedAddressInfo.transactions, addressesUnconfirmedTransactions)'
        // },
        this.addressesUnconfirmedTransactions = {}
        this.addressInfoStreams = {}
        this.unconfirmedTransactionStreams = {}
        this.selectedTransaction = {}

        parentEpml.ready().then(() => {

            parentEpml.subscribe('selected_address', async selectedAddress => {
                this.selectedAddress = {}
                selectedAddress = JSON.parse(selectedAddress)
                if (!selectedAddress || Object.entries(selectedAddress).length === 0) return // Not ready yet ofc
                this.selectedAddress = selectedAddress

                this.updateAccountTransactions()
                this.updateAccountBalance()
            })

        })
    }

    render() {
        return html`
            <div class="white-bg">
                <div ?hidden="${!this.loading}" class="layout horizontal center" style="height:100vh;">
                <div class="layout vertical center" style="width:100%;">
                    <paper-spinner-lite ?active="${this.loading}" alt="Loading address"></paper-spinner-lite>
                </div>
                </div>
                
                
                <div ?hidden="${this.loading}">
                    <div id="topbar" style="background: ; color: ; padding: 20px;">
                        <span class="mono weight-1300">
                            ${this.selectedAddress.address}
                        </span>
                        <br>
                        <div class="layout horizontal wrap">
                            <div>
                                <span class="mono weight-100" style="font-size: 70px;">${this.floor(this.balance)}<span
                                        style="font-size:24px; vertical-align: top; line-height:60px;">.${this.decimals(this.balance)}
                                        qort</span></span>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            </div>
                
                        </div>
                    </div>
                
                    <div id="contentDiv" style="margin: 8px;">
                
                
                
                        <div class="layout horizontal">
                            <div style="padding-left:12px;" ?hidden="${!this.isEmptyArray(this.transactions)}">
                                Address has no transactions yet. 
                            </div>

                            <vaadin-grid id="transactionsGrid" style="height:auto;" ?hidden="${this.isEmptyArray(this.transactions)}" aria-label="Peers" .items="${this.transactions}" height-by-rows>
                                <vaadin-grid-column width="4.4rem" header="Type" .renderer=${(root, column, data) => {
                render(html`
                                ${data.item.type} 
                                    ${data.item.creatorAddress === this.selectedAddress.address ? html`<span class="color-out">OUT</span>` : html`<span class="color-in">IN</span>`}

                `, root)
            }}>
                                </vaadin-grid-column>
                                <vaadin-grid-column width="13rem" header="Sender" path="creatorAddress"></vaadin-grid-column>
                                <vaadin-grid-column width="13rem" header="Receiver" path="recipient"></vaadin-grid-column>
                                <vaadin-grid-column width="2rem" path="fee"></vaadin-grid-column>
                                <vaadin-grid-column width="2rem" path="amount"></vaadin-grid-column>
                                <vaadin-grid-column width="2rem" header="Timestamp" .renderer=${(root, column, data) => {

                const time = new Date(data.item.timestamp)
                render(html`
                                        <time-ago datetime=${time.toISOString()}>
                                            
                                        </time-ago>
                                    `, root)
            }}>
                                </vaadin-grid-column>
                            </vaadin-grid>
                    </div>

                    <div>
                        <mwc-dialog id="showTransactionDetailsDialog" scrimClickAction="${this.showTransactionDetailsLoading ? '' : 'close'}">
                            <div style="text-align:center">
                            <h1>Transaction Details</h1>
                            <hr>
                            </div>

                            <div id="transactionList">
                            <span class="title"> Transaction Type </span>
                            <br>
                            <div><span class="">${this.selectedTransaction.type}</span>
                                    ${this.selectedTransaction.txnFlow === "OUT" ? html`<span class="color-out">OUT</span>` : html`<span class="color-in">IN</span>`}
                            </div>

                            <span class="title">Sender</span>
                            <br>
                            <div><span class="">${this.selectedTransaction.creatorAddress}</span></div>

                            <span class="title">Receiver</span>
                            <br>
                            <div><span class="">${this.selectedTransaction.recipient}</span></div>

                            ${!this.selectedTransaction.amount ? '' : html`
                                    <span class="title">Amount</span>
                                    <br>
                                    <div><span class="">${this.selectedTransaction.amount} QORT</span></div>
                                `
            }

                            <span class="title"> Transaction Fee </span>
                            <br>
                            <div><span class="">${this.selectedTransaction.fee}</span></div>

                            <span class="title">Block</span>
                            <br>
                            <div><span class="">${this.selectedTransaction.blockHeight}</span></div>

                            <span class="title">Time</span>
                            <br>
                            <div><span class="">${new Date(this.selectedTransaction.timestamp).toString()}</span></div>

                            <span class="title"> Transaction Signature </span>
                            <br>
                            <div><span class="">${this.selectedTransaction.signature}</span></div>
                            </div>

                        </mwc-dialog>
                    </div>
                </div>
            </div>
        `
    }

    getGridTransaction() {

        const myGrid = this.shadowRoot.querySelector('#transactionsGrid')

        myGrid.addEventListener('click', (e) => {
            let myItem = myGrid.getEventContext(e).item

            this.showTransactionDetails(myItem, this.transactions)
        })

    }

    firstUpdated() {

        // Calls the getGridTransaction func..
        this.getGridTransaction()

    }

    updateAccountTransactions() {
        clearTimeout(this.updateAccountTransactionTimeout)
        parentEpml.request('apiCall', {
            url: `/transactions/search?address=${this.selectedAddress.address}&confirmationStatus=BOTH&limit=20&reverse=true`
        }).then(res => {
            this.transactions = res
            // I made the API call return a reversed result so I can reduce complexity... 
            // this.transactions.reverse() // Not needed
            this.updateAccountTransactionTimeout = setTimeout(() => this.updateAccountTransactions(), 5000)
        })
    }

    updateAccountInfo() {
        clearTimeout(this.updateAccountInfoTimeout)
        parentEpml.request('apiCall', {
            url: `/addresses/${this.selectedAddress.address}`
        }).then(res => {
            this.addressInfo = res

            this.updateAccountInfoTimeout = setTimeout(() => this.updateAccountInfo(), 4000)
        })
    }

    updateAccountBalance() {

        clearTimeout(this.updateAccountBalanceTimeout)
        parentEpml.request('apiCall', {
            url: `/addresses/balance/${this.selectedAddress.address}`
        }).then(res => {
            this.balance = res
            this.updateAccountBalanceTimeout = setTimeout(() => this.updateAccountBalance(), 5000)
        })
    }

    showTransactionDetails(myTransaction, allTransactions) {

        allTransactions.forEach(transaction => {
            if (myTransaction.signature === transaction.signature) {
                // Do something...
                let txnFlow = myTransaction.creatorAddress === this.selectedAddress.address ? "OUT" : "IN";
                this.selectedTransaction = { ...transaction, txnFlow };
                if (this.selectedTransaction.signature.length != 0) {
                    this.shadowRoot.querySelector('#showTransactionDetailsDialog').show()
                }
            }
        });
    }

    isEmptyArray(arr) {
        if (!arr) { return true }
        return arr.length === 0
    }
    floor(num) {
        num = parseFloat(num)
        return isNaN(num) ? 0 : this._format(Math.floor(num))
    }
    decimals(num) {
        num = parseFloat(num) // So that conversion to string can get rid of insignificant zeros
        // return isNaN(num) ? 0 : (num + "").split(".")[1]
        return num % 1 > 0 ? (num + '').split('.')[1] : '0'
    }

    sendOrRecieve(tx) {
        return tx.sender == this.selectedAddress.address
    }

    senderOrRecipient(tx) {
        return this.sendOrRecieve(tx) ? tx.recipient : tx.sender
    }

    txColor(tx) {
        return this.sendOrRecieve(tx) ? 'red' : 'green'
    }

    getTxType(type) {
        return TX_TYPES[type]
    }

    subtract(num1, num2) {
        return num1 - num2
    }

    getConfirmations(height, lastBlockHeight) {
        return lastBlockHeight - height + 1
    }

    _format(num) {
        return num.toLocaleString()
    }

    textColor(color) {
        return color === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.87)'
    }
    _unconfirmedClass(unconfirmed) {
        return unconfirmed ? 'unconfirmed' : ''
    }
}

window.customElements.define('wallet-app', WalletApp)
