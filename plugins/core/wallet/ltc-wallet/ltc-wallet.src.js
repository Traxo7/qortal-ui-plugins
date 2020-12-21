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

class LTCWallet extends LitElement {
    static get properties() {
        return {
            loading: { type: Boolean },
            transactions: { type: Array },
            lastBlock: { type: Object },
            selectedWallet: { type: Object },
            selectedLtcWallet: { type: Object },
            balance: { type: Number },
            selectedTransaction: { type: Object },
            isTextMenuOpen: { type: Boolean }
        }
    }

    static get styles() {
        return [
            css`
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
                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    padding: 0;
                    -webkit-font-smoothing:antialiased;
                    -moz-osx-font-smoothing:grayscale;
                }

                h2 {
                    margin: 0;
                    font-weight: 400;
                    color: #707584;
                    font: 24px/24px 'Open Sans', sans-serif;
                }

                h3 {
                    margin: 0 0 5px;
                    font-weight: 600;
                    font-size: 18px;
                    line-height: 18px;
                }

                /* Styles for Larger Screen Sizes */
                @media(min-width:765px) {

                    .wrapper {
                        display: grid;
                        grid-template-columns: 1fr 3fr;
                    }
                }

                .wrapper {
                    margin: 0 auto;
                    height: 100%;
                    overflow: hidden;
                    border-radius: 8px;
                    background-color: #fff;
                }

                .wallet {
                    width: 370px;
                    background-color: #f2f2f2;
                    height: 100%;
                    border-top-left-radius: inherit;
                    border-bottom-left-radius: inherit;
                    padding: 50px;
                }

                .wallet-header {
                    margin: 0 50px;
                    display: flex;
                    justify-content: space-between;
                }

                .transactions-wrapper {
                    width: 100%;
                    padding: 50px 0;
                    height: 100vh;
                }

                .total-balance {
                    display: inline-block;
                    font-weight: 600;
                    font-size: 32px;
                    color: #444750;
                }

                #transactions {
                    margin-top: 60px;
                    margin-left: 50px;
                    border-top: 1px solid #e5e5e5;
                    padding-top: 50px;
                    height: 100%;
                    overflow: auto;
                }

                .show {
                    animation: fade-in .3s 1;
                }

                .transaction-item {
                    display: flex;
                    justify-content: space-between;
                    position: relative;
                    padding-left: 40px;
                    margin-bottom: 45px;
                    margin-right: 50px;
                }
                .transaction-item::before {
                    position: absolute;
                    content: '';
                    border: 2px solid #e1e1e1;
                    border-radius: 50%;
                    height: 25px;
                    width: 25px;
                    left: 0;
                    top: 10px;
                    box-sizing: border-box;
                    vertical-align: middle;
                    color: #666666;
                }

                .credit::before {
                    content: '+';
                    font-size: 25px;
                    line-height: 19px;
                    padding: 0 4px 0;
                }

                .debit::before {
                    content: '-';
                    font-size: 20px;
                    line-height: 21px;
                    padding: 0 5px;
                }

                .transaction-item .details {
                    font-size: 14px;
                    line-height: 14px;
                    color: #999;
                }

                .transaction-item_details {
                    width: 270px;
                }

                .transaction-item_amount .amount {
                    font-weight: 600;
                    font-size: 18px;
                    line-height: 45px;
                    position: relative;
                    margin: 0;
                    display: inline-block;
                }

                .cards {
                    margin-top: 60px;
                }

                .currency-box {
                    background-color: #fff;
                    text-align: center;
                    padding: 15px;
                    margin-bottom: 45px;
                    border-radius: 3px;
                    border: 2px solid #e1e1e1;
                    cursor: pointer;
                    transition: .1s ease-in-out;
                }
                .currency-box:hover {
                    transform: scale(1.07);
                }

                .active {
                    border-color: #8393ca;
                    border-width: 3px;
                }

                .currency-image {
                    display: inline-block;
                    height: 58px;
                    width: 58px;
                    background-repeat: no-repeat;
                    background-size: cover;
                    border-radius: 3px;
                    margin-bottom: 10px;
                }

                .qort .currency-image {
                    background-image: url("https://qortal.org/wp-content/uploads/2019/03/qortal-e1588897849894-150x150.png");
                }

                .btc .currency-image {
                    background-image: url('https://s2.coinmarketcap.com/static/img/coins/64x64/1.png');
                }

                .ltc .currency-image {
                    background-image: url('https://s2.coinmarketcap.com/static/img/coins/64x64/2.png');
                }

                .coin-card_number {
                    color: #666666;
                }

                .card-list {
                    margin-top: 20px;
                }

                .card-list .currency-image {
                    cursor: pointer;
                    margin-right: 15px;
                    transition: .1s;
                }

                .card-list .currency-image:hover {
                    transform: scale(1.1);
                }

                /* animations */
                @keyframes fade-in {
                    0% {
                        opacity: 0;
                    }
                100% {
                    opacity: 1;
                }
                }

                /* media queries */
                @media(max-width:863px) {   
                    .wallet {
                        width: 100%;
                        border-top-right-radius: inherit;
                        padding-bottom: 25px;
                    }
                    .cards {
                        margin-top: 25px;
                    }
                    .currency-box:nth-of-type(2) {
                        margin-right: 0;
                    }
                }

                @media(max-width:764px) {   
                    .wallet {
                        width: 100%;
                        border-top-right-radius: inherit;
                        padding-bottom: 25px;
                    }
                    .cards {
                        margin-top: 25px;
                    }
                    .currency-box {
                        width: calc(50% - 25px);
                        max-width: 260px;
                        display: inline-block;
                        margin-right: 25px;
                        margin-bottom: 25px;
                        text-align: center;
                    }
                    .currency-box:nth-of-type(2) {
                        margin-right: 0;
                    }
                }

                @media(max-width:530px) {
                    h3 {
                        line-height: 24px;
                    }
                    .cards {
                        text-align: center;
                    }
                    .currency-box {
                        width: calc(100% - 25px);
                        max-width: 260px;
                    }
                    .currency-box:nth-of-type(2) {
                        margin-right: 25px;
                    }	
                    .currency-box:last-of-type {
                        margin-bottom: 0;
                    }
                    .total-balance {
                        font-size: 22px;
                    }
                }

                @media(max-width: 390px) {
                    .wallet {
                        padding: 50px 25px;
                    }
                    .transactions-wrapper {
                        padding: 50px 25px;
                    }
                    h2 {
                        font: 18px/24px 'Open Sans', sans-serif;
                    }
                }
            `
        ]
    }

    constructor() {
        super()
        this.transactions = []
        this.balance = 0.000
        this.lastBlock = {
            height: 0
        }
        this.selectedWallet = {}
        this.qortWallet = {}
        this.btcWallet = {}
        this.ltcWallet = {}
        this.selectedTransaction = {}
        this.isTextMenuOpen = false

        this.qortWallet = window.parent.reduxStore.getState().app.selectedAddress
        // this.btcWallet 
        // this.ltcWallet 

        parentEpml.ready().then(() => {

            parentEpml.subscribe('selected_address', async selectedAddress => {
                this.selectedLtcWallet = {}
                selectedAddress = JSON.parse(selectedAddress)
                if (!selectedAddress || Object.entries(selectedAddress).length === 0) return
                this.qortWallet = selectedAddress;
                this.btcWallet = selectedAddress.btcWallet;
                this.ltcWallet = selectedAddress.ltcWallet;

                // this.updateAccountTransactions();
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
            <div class="wrapper">
                <div class="wallet">
                    <h2>My Wallets</h2>
                    <div class="cards">
                        <div type="qort" class="currency-box qort">
                            <div class="currency-image"></div>
                            <div class="coin-card_number">2.562 QORT</div>
                        </div>
                        <div type="btc" class="currency-box btc">
                            <div class="currency-image"></div>
                            <div class="coin-card_number">0.9483 BTC</div>
                        </div>
                        <div type="ltc" class="currency-box ltc">
                            <div class="currency-image"></div>
                            <div class="coin-card_number">8.27 LTC</div>
                        </div>
                    </div>
                </div>

                <div class="transactions-wrapper">
                    <h2 class="wallet-header">
                        Current Balance
                        <span class="total-balance"></span>
                    </h2>
                    <div id="transactions">
                        <vaadin-grid id="transactionsGrid" style="height:auto;" ?hidden="${this.isEmptyArray(this.transactions)}" aria-label="Peers" .items="${this.transactions}" height-by-rows>
                                <vaadin-grid-column width="4.4rem" header="Type" .renderer=${(root, column, data) => {
                render(html`
                                ${data.item.type} 
                                    ${data.item.creatorAddress === this.qortWallet.address ? html`<span class="color-out">OUT</span>` : html`<span class="color-in">IN</span>`}

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
                </div>
            </div>
        `
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

    transactionItem(transactionObject) {
        return `
            <div class='transaction-item ${transactionObject.type}'>
                <div class='transaction-item_details'>
                    <h3>${transactionObject.name}</h3>
                    <span class='details'>${transactionObject.category} ${transactionObject.ID} - ${transactionObject.date}</span>
                </div>
                <div class='transaction-item_amount'>
                    <p class='amount'>${transactionObject.amount}</p>
                </div>
            </div>
        `
    }

    firstUpdated() {

        // Calls the getGridTransaction func..
        // this.getGridTransaction()

        // Check Wallet Balance
        // this.updateAccountBalance()

        // Make Qort the default selected currency wallet
        this.defaultWallet = this.shadowRoot.querySelector('.currency-box.qort');
        this.defaultWallet.classList.add('active');

        this.selectedWallet = {
            type: 'qort',
            currencyBox: this.defaultWallet
        }

        // DOM refs
        this.currencyBoxes = this.shadowRoot.querySelectorAll('.currency-box');
        this.transactionsDOM = this.shadowRoot.getElementById('transactions');

        // Attach eventlisteners to the cuurency boxes
        this.currencyBoxes.forEach(currencyBox => {
            currencyBox.addEventListener("click", this.selectWallet);
        });

        this.showWallet(this.selectedWallet);

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

    selectWallet(event) {
        event.preventDefault();

        if (this.classList.contains('active')) return;

        console.log(this.attributes.type.value);

        this.selectedWallet = {
            type: this.attributes.type.value,
            currencyBox: this
        }

        console.log(this.selectedWallet);
    }

    async showWallet(selectedWallet) {

        console.log(selectedWallet);
        console.log(this.qortWallet);

        if (selectedWallet.type === 'qort') {

            this.fetchQortTransactions();
            this.fetchQortBalance();

        } else if (selectedWallet.type === 'btc') {
            
        } else if (selectedWallet.type === 'ltc') {

        }



        // var output = "";
        // var total = 0;
        // //if card is active print its transactions from cards data
        // currencyBoxes.forEach((currencyBox, index) => {

        //     if (currencyBox === selectedCurrencyBox) {

        //         // TODO: Remove this forEach here on production..
        //         cards[index].transactions.forEach(transaction => {
        //             output += transactionItem(transaction);
        //             total += parseFloat(transaction.amount);
        //         })

        //         // Append to the DOM
        //         transactionsDOM.innerHTML = output;
        //         totalBalance.innerHTML = total.toFixed(2);
        //     }
        // })
    }

    fetchQortTransactions() {

        this.transactions = []

        parentEpml.request('apiCall', {
            url: `/transactions/search?address=${this.qortWallet.address}&confirmationStatus=BOTH&limit=20&reverse=true`
        }).then(res => {
            this.transactions = res;
        })
    }

    fetchQortBalance() {

        parentEpml.request('apiCall', {
            url: `/addresses/balance/${this.qortWallet.address}`
        }).then(res => {
            this.balance = res;
        })
    }
    
    updateAccountTransactions() {
        parentEpml.request('apiCall', {
            url: `/crosschain/ltc/wallettransactions`,
            method: 'POST',
            body: window.parent.reduxStore.getState().app.selectedAddress.ltcWallet._tDerivedmasterPublicKey
        }).then(res => {
            this.transactions = res
            console.log(this.transactions);
        })
    }


    updateAccountBalance() {

        parentEpml.request('apiCall', {
            url: `/crosschain/ltc/walletbalance`,
            method: "POST",
            body: window.parent.reduxStore.getState().app.selectedAddress.ltcWallet._tDerivedmasterPublicKey
        }).then(res => {
            this.balance = (Number(res) / 1e8).toFixed(8)

            // console.log(this.balance);

        }).catch(err => {
            parentEpml.request('showSnackBar', "Failed to Fetch Balance. Try again!");
        })
    }

    showTransactionDetails(myTransaction, allTransactions) {

        allTransactions.forEach(transaction => {
            if (myTransaction.signature === transaction.signature) {
                // Do something...
                let txnFlow = myTransaction.creatorAddress === this.selectedLtcWallet.address ? "OUT" : "IN";
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
        return tx.sender == this.selectedLtcWallet._taddress
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

window.customElements.define('ltc-wallet', LTCWallet)
