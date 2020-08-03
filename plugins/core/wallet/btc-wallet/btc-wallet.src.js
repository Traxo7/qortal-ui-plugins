import { LitElement, html, css } from 'lit-element'
import { render } from 'lit-html'
import { Epml } from '../../../../epml.js'

import '@material/mwc-icon'
import '@material/mwc-button'
import '@material/mwc-dialog'

import '@polymer/paper-spinner/paper-spinner-lite.js'
import '@vaadin/vaadin-grid/vaadin-grid.js'
import '@vaadin/vaadin-grid/theme/material/all-imports.js'

import '@github/time-elements'

const parentEpml = new Epml({ type: 'WINDOW', source: window.parent })

class BTCWallet extends LitElement {
    static get properties() {
        return {
            loading: { type: Boolean },
            transactions: { type: Array },
            lastBlock: { type: Object },
            selectedBtcWallet: { type: Object },
            balance: { type: Number },
            selectedTransaction: { type: Object },
            isTextMenuOpen: { type: Boolean }
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
        this.transactions = []
        this.lastBlock = {
            height: 0
        }
        this.selectedBtcWallet = {}
        this.balance = 0.000
        this.selectedTransaction = {}
        this.isTextMenuOpen = false

        parentEpml.ready().then(() => {

            parentEpml.subscribe('selected_address', async selectedAddress => {
                this.selectedBtcWallet = {}
                selectedAddress = JSON.parse(selectedAddress)
                if (!selectedAddress || Object.entries(selectedAddress).length === 0) return
                this.selectedBtcWallet = selectedAddress.btcWallet

                // this.updateAccountTransactions()
                // this.updateAccountBalance()
            })

            parentEpml.subscribe('copy_menu_switch', async value => {

                if (value === 'false' && this.isTextMenuOpen === true) {

                    this.clearSelection()
                    this.isTextMenuOpen = false
                }
            })

        })
    }

    render() {
        return html`
            <div class="white-bg">
                
                <div ?hidden="${this.loading}">
                    <div id="topbar" style="background: ; color: ; padding: 20px;">
                        <span class="mono weight-1300">
                            ${this.selectedBtcWallet._taddress}
                        </span>
                        <br>
                        <div class="layout horizontal wrap">
                            <div>
                                <span class="mono weight-100" style="font-size: 40px;">${this.balance} BTC</span>
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
                                    ${data.item.creatorAddress === this.selectedBtcWallet.address ? html`<span class="color-out">OUT</span>` : html`<span class="color-in">IN</span>`}

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
        </div>
        `
    }

    getGridTransaction() {

        const myGrid = this.shadowRoot.querySelector('#transactionsGrid')

        myGrid.addEventListener('click', (e) => {
            let myItem = myGrid.getEventContext(e).item

            this.showTransactionDetails(myItem, this.transactions)
        }, { passive: true })

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

    clearSelection() {

        window.getSelection().removeAllRanges()
        window.parent.getSelection().removeAllRanges()
    }

    firstUpdated() {

        // Calls the getGridTransaction func..
        this.getGridTransaction()

        window.addEventListener("contextmenu", (event) => {

            event.preventDefault();
            this.isTextMenuOpen = true
            this._textMenu(event)
        });

        window.addEventListener("click", () => {

            if (this.isTextMenuOpen) {

                parentEpml.request('closeCopyTextMenu', null)
            }
        });

        window.onkeyup = (e) => {
            if (e.keyCode === 27) {

                parentEpml.request('closeCopyTextMenu', null)
            }
        }

    }

    // updateAccountTransactions() {
    //     clearTimeout(this.updateAccountTransactionTimeout)
    //     parentEpml.request('apiCall', {
    //         url: `/transactions/search?address=${this.selectedBtcWallet.address}&confirmationStatus=BOTH&limit=20&reverse=true`
    //     }).then(res => {
    //         this.transactions = res
    //         this.updateAccountTransactionTimeout = setTimeout(() => this.updateAccountTransactions(), 5000)
    //     })
    // }


    // updateAccountBalance() {

    //     clearTimeout(this.updateAccountBalanceTimeout)
    //     parentEpml.request('apiCall', {
    //         url: `/addresses/balance/${this.selectedBtcWallet.address}`
    //     }).then(res => {
    //         this.balance = res
    //         this.updateAccountBalanceTimeout = setTimeout(() => this.updateAccountBalance(), 5000)
    //     })
    // }

    showTransactionDetails(myTransaction, allTransactions) {

        allTransactions.forEach(transaction => {
            if (myTransaction.signature === transaction.signature) {
                // Do something...
                let txnFlow = myTransaction.creatorAddress === this.selectedBtcWallet.address ? "OUT" : "IN";
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
        return tx.sender == this.selectedBtcWallet.address
    }

    senderOrRecipient(tx) {
        return this.sendOrRecieve(tx) ? tx.recipient : tx.sender
    }

    txColor(tx) {
        return this.sendOrRecieve(tx) ? 'red' : 'green'
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

window.customElements.define('btc-wallet', BTCWallet)
