
import { LitElement, html, css } from 'lit-element'
import { render } from 'lit-html'
import { Epml } from '../../../epml.js'

import '@material/mwc-button'
import '@material/mwc-textfield'
import '@material/mwc-icon-button'
import '@material/mwc-dialog'
import '@polymer/paper-spinner/paper-spinner-lite.js'
import '@vaadin/vaadin-grid/vaadin-grid.js'
import '@vaadin/vaadin-grid/vaadin-grid-sorter'
import '@vaadin/vaadin-grid/theme/material/all-imports.js'

const parentEpml = new Epml({ type: 'WINDOW', source: window.parent })

class TradePortal extends LitElement {
    static get properties() {
        return {
            selectedAddress: { type: Object },
            config: { type: Object },
            qortBalance: { type: String },
            btcBalance: { type: String },
            sellBtnDisable: { type: Boolean },
            isSellLoading: { type: Boolean },
            isBuyLoading: { type: Boolean },
            buyBtnDisable: { type: Boolean },
            initialAmount: { type: Number },
            openOrders: { type: Array },
            historicTrades: { type: Array },
            myOrders: { type: Array },
            myHistoricTrades: { type: Array },
            tradeOffersSocketCounter: { type: Number },
            cancelBtnDisable: { type: Boolean },
            myOfferingOrders: { type: Array },
            openTradeOrders: { type: Array },
            cancelStuckOfferBtnDisable: { type: Boolean }
        }
    }

    static get styles() {
        return css`
            * {
                --mdc-theme-primary: rgb(3, 169, 244);
                --mdc-theme-secondary: var(--mdc-theme-primary);
                --paper-input-container-focus-color: var(--mdc-theme-primary);
                /* --paper-spinner-color: #eee */
            }

            #trade-portal-page {
                background: #fff;
                padding: 12px 24px;
            }

            .divCard {
                border: 1px solid #eee;
                padding: 1em;
                /** box-shadow: 0 1px 1px 0 rgba(0,0,0,0.14), 0 2px 1px -1px rgba(0,0,0,0.12), 0 1px 2px 0 rgba(0,0,0,0.20); **/
                box-shadow: 0 .3px 1px 0 rgba(0,0,0,0.14), 0 1px 1px -1px rgba(0,0,0,0.12), 0 1px 2px 0 rgba(0,0,0,0.20);
            }

            h2 {
                margin:0;
            }

            h2, h3, h4, h5 {
                color:#333;
                font-weight: 400;
            }

            header {
                display: flex;
                flex: 0 1 auto;
                align-items: center;
                justify-content: space-between;
                padding: 0px 15px;
                font-size: 16px;
                color: #fff;
                background-color: rgb(106, 108, 117);
                min-height: 40px;
            }

            p {
                margin-bottom: 15px;
            }

            #trade-portal {

                max-width: 100vw;
                margin-left: auto;
                margin-right: auto;
                /* margin-top: 20px; */
            }

            .box {
                margin: 0;
                padding: 0;
                display: flex;
                flex-flow: column;
                height: 100%;
            }

            #first-trade-section {

                margin-bottom: 10px;
            }

            #first-trade-section > div {
                /* background-color: #eee; */
                /* padding: 1em; */
            }


            .trade-chart {
                /* height: 300px; */
                background-color: #eee;
                border: 2px #ddd solid;
                text-align: center;
            }

            .open-trades {
                text-align: center;
                /* height: 450px; */
            }


            #second-trade-section {

                margin-bottom: 10px;
            }

            #second-trade-section > div {
                /* background-color: #fff;
                padding: 1em; */
            }

            .open-market-container {
                /* border: 2px #ddd solid; */
                text-align: center;
            }

            .buy-sell {
                /* margin-bottom: 10px; */
            }

            .card {
                padding: 1em;
                border: 1px #666 solid;
                flex: 1 1 auto;
                display: flex;
                flex-flow: column;
                justify-content: space-evenly;
                min-height: inherit;
            }

            .cancel {
                --mdc-theme-primary: rgb(255, 89, 89);
            }

            .border-wrapper {
                border: 1px #666 solid;
                /* overflow-x: hidden; */
                /* overflow-y: auto; */
                overflow: hidden;
            }

            .you-have {
                color: #555;
                font-size: 15px;
                text-align: right;
                margin-bottom: 5px;
            }

            .historic-trades {
                text-align: center;
            }

            #third-trade-section {

                margin-bottom: 10px;
            }

            #third-trade-section > div {
                /* background-color: #fff;
                padding: 1em; */
            }

            .my-open-orders {
                /* border: 2px #ddd solid; */
                text-align: center;
            }

            .my-historic-trades {
                /* border: 2px #ddd solid; */
                text-align: center;
            }

            .buttons {
                width: auto !important;
            }

            .buy-button {
                /* --mdc-theme-primary: #008000; */
                --mdc-theme-primary: rgba(55, 160, 51, 0.9);
            }

            .sell-button {
                /* --mdc-theme-primary: #F44336; */
                --mdc-theme-primary: rgb(255, 89, 89);
            }

            .full-width {
                /* grid-column: 1/3; */
                /* grid-row: 1/4; */
                background-color: #fff;
                border: 2px #ddd solid;
                height: 100px;
                text-align: center;
            }

            @media(min-width:701px) {

                * {
                    /* margin: 0;
                    padding: 0;
                    box-sizing: border-box; */
                }

                #trade-portal {
                    padding: .5em;
                }

                #first-trade-section {
                    display: grid;
                    grid-template-columns: 2.2fr 1.8fr;
                    grid-auto-rows: max(450px);
                    column-gap: .5em;
                    row-gap: .4em;
                    justify-items: stretch;
                    align-items: stretch;
                    margin-bottom: 10px;
                }

                #second-trade-section {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    grid-auto-rows: max(400px);
                    column-gap: .5em;
                    row-gap: .4em;
                    justify-items: stretch;
                    align-items: stretch;
                    margin-bottom: 10px;
                }

                .buy-sell {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    grid-auto-rows: max(400px);
                    column-gap: .5em;
                    row-gap: .4em;
                }

                #third-trade-section {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    grid-auto-rows: minmax(300px, auto);
                    column-gap: .5em;
                    row-gap: .4em;
                    justify-items: stretch;
                    align-items: stretch;
                    margin-bottom: 10px;
                }
            }

        `
    }

    constructor() {
        super()
        this.selectedAddress = {}
        this.config = {}
        this.qortBalance = '0'
        this.btcBalance = '0'
        this.sellBtnDisable = false
        this.isSellLoading = false
        this.buyBtnDisable = true
        this.isBuyLoading = false
        this.initialAmount = 0
        this.openOrders = []
        this.historicTrades = []
        this.myOrders = []
        this.myHistoricTrades = []
        this.tradeOffersSocketCounter = 0
        this.cancelBtnDisable = false
        this.myOfferingOrders = []
        this.openTradeOrders = []
        this.cancelStuckOfferBtnDisable = false
    }

    // TODO: Spllit this large chunk of code into individual components

    render() {
        return html`
            <div id="trade-portal-page">
                <div style="min-height:48px; display: flex; padding-bottom: 6px; margin: 2px;">
                    <h2 style="margin: 0; flex: 1; padding-top: .1em; display: inline;">Trade Portal</h2>
                </div>

                <div id="trade-portal">
                    <div id="first-trade-section">
                        <div class="trade-chart">
                            <div class="box">
                                <header>CLOSED PRICE LINE CHART ("COMING SOON")</header>
                                <div class="card">

                                </div>
                            </div>
                        </div>
                        <div class="open-trades">
                            <div class="box">
                                <header>
                                    <span>OPEN MARKET SELL ORDERS</span>
                                </header>
                                <div class="border-wrapper">
                                    <vaadin-grid theme="compact column-borders row-stripes wrap-cell-content" id="openOrdersGrid" aria-label="Open Orders" .items="${this.openOrders}">
                                        <vaadin-grid-column resizable header="Amount (QORT)" path="qortAmount"></vaadin-grid-column>
                                        <vaadin-grid-column resizable header="Price (BTC)" id="priceColumn" path="priceBtc"></vaadin-grid-column>
                                        <vaadin-grid-column resizable header="Total (BTC)" .renderer=${(root, column, data) => {
                render(html`<span> ${data.item.btcAmount} </span>`, root)
            }}>
                                        </vaadin-grid-column>
                                    </vaadin-grid>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="second-trade-section">
                        <div class="open-market-container">
                            <div class="buy-sell">
                                <div class="box">
                                    <header>
                                        <span>BUY QORT</span>
                                        
                                        <mwc-icon-button icon="clear_all" @click=${() => this.clearBuyForm()}></mwc-icon-button>
                                    </header>
                                    <div class="card">
                                        <p>
                                            <mwc-textfield
                                            style="width:100%;"
                                            id="buyAmountInput"
                                            required
                                            readOnly
                                            label="Amount (QORT)"
                                            placeholder="0.0000"
                                            type="text" 
                                            auto-validate="false"
                                            outlined
                                            value="${this.initialAmount}">
                                        </mwc-textfield>
                                        </p>
                                        <p>
                                            <mwc-textfield
                                            style="width:100%;"
                                            id="buyPriceInput"
                                            required
                                            readOnly
                                            label="Price Ea. (BTC)"
                                            placeholder="0.0000"
                                            type="text" 
                                            auto-validate="false"
                                            outlined
                                            value="${this.initialAmount}">
                                        </mwc-textfield>
                                        </p>
                                        <p style="margin-bottom: 8px;">
                                        <mwc-textfield
                                            style="width:100%;"
                                            id="buyTotalInput"
                                            required
                                            readOnly
                                            label="Total (BTC)"
                                            placeholder="0.0000"
                                            type="text" 
                                            auto-validate="false"
                                            outlined
                                            value="${this.initialAmount}">
                                        </mwc-textfield>

                                        <mwc-textfield
                                            style="display: none; visibility: hidden;"
                                            id="qortalAtAddress"
                                            required
                                            readOnly
                                            label="Qortal AT Address"
                                            type="text"
                                            auto-validate="false"
                                            outlined>
                                        </mwc-textfield>
                                        </p>

                                        <span class="you-have">You have: ${this.btcBalance} BTC</span>

                                        <div class="buttons" >
                                            <div>
                                                <mwc-button class="buy-button" ?disabled=${this.buyBtnDisable} style="width:100%;" raised @click=${e => this.buyAction(e)}>${this.isBuyLoading === false ? "BUY" : html`<paper-spinner-lite active></paper-spinner-lite>`}</mwc-button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="box">
                                    <header>
                                        <span>SELL QORT</span>

                                        <mwc-icon-button icon="clear_all" @click=${() => this.clearSellForm()}></mwc-icon-button>
                                    </header>
                                    <div class="card">
                                        <p>
                                            <mwc-textfield
                                            style="width:100%;"
                                            id="sellAmountInput"
                                            required
                                            label="Amount (QORT)"
                                            placeholder="0.0000"
                                            @input=${(e) => { this._checkSellAmount(e) }}
                                            type="number" 
                                            auto-validate="false"
                                            outlined
                                            value="${this.initialAmount}">
                                        </mwc-textfield>
                                        </p>
                                        <p>
                                            <mwc-textfield
                                            style="width:100%;"
                                            id="sellPriceInput"
                                            required
                                            label="Price Ea. (BTC)"
                                            placeholder="0.0000"
                                            @input=${(e) => { this._checkSellAmount(e) }}
                                            type="number" 
                                            auto-validate="false"
                                            outlined
                                            value="${this.initialAmount}">
                                        </mwc-textfield>
                                        </p>
                                        <p style="margin-bottom: 8px;">
                                        <mwc-textfield
                                            style="width:100%;"
                                            id="sellTotalInput"
                                            required
                                            readOnly
                                            label="Total (BTC)"
                                            placeholder="0.0000"
                                            type="text" 
                                            auto-validate="false"
                                            outlined
                                            value="${this.initialAmount}">
                                        </mwc-textfield>
                                        </p>

                                        <span class="you-have">You have: ${this.qortBalance} QORT</span>

                                        <div class="buttons" >
                                            <div>
                                                <mwc-button class="sell-button" ?disabled=${this.sellBtnDisable} style="width:100%;" raised @click=${e => this.sellAction()}>${this.isSellLoading === false ? "SELL" : html`<paper-spinner-lite active></paper-spinner-lite>`}</mwc-button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="historic-trades">
                            <div class="box">
                                <header>HISTORIC MARKET TRADES (24 hours)</header>
                                <div class="border-wrapper">
                                    <vaadin-grid theme="compact column-borders row-stripes wrap-cell-content" id="historicTradesGrid" aria-label="Historic Trades" .items="${this.historicTrades}">
                                        <vaadin-grid-column resizable header="Amount (QORT)" path="qortAmount"></vaadin-grid-column>
                                        <vaadin-grid-column resizable header="Price (BTC)" .renderer=${(root, column, data) => {
                const price = this.round(parseFloat(data.item.btcAmount) / parseFloat(data.item.qortAmount))
                render(html`${price}`, root)
            }}>
                                </vaadin-grid-column>
                                        <vaadin-grid-column resizable header="Total (BTC)" .renderer=${(root, column, data) => {
                render(html`<span> ${data.item.btcAmount} </span>`, root)
            }}>
                                        </vaadin-grid-column>
                                    </vaadin-grid>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="third-trade-section">
                        <div class="my-open-orders">
                            <div class="box">
                                <header>
                                    <span>MY ORDERS</span>
                                    <mwc-icon-button icon="more_vert" @click=${() => this.showStuckOrdersDialog()}></mwc-icon-button>
                                </header>
                                <div class="border-wrapper">
                                    <vaadin-grid theme="compact column-borders row-stripes wrap-cell-content" id="myOrdersGrid" aria-label="My Orders" .items="${this.myOrders}">
                                        <vaadin-grid-column resizable header="Date" .renderer=${(root, column, data) => {
                const dateString = new Date(data.item.timestamp).toLocaleString()
                render(html`${dateString}`, root)
            }}>
                                </vaadin-grid-column>
                                        <vaadin-grid-column resizable header="Status" .renderer=${(root, column, data) => {
                render(html`<span id="${data.item.atAddress}"> ${data.item._tradeState} </span>`, root)
            }}>
                                        </vaadin-grid-column>
                                        <vaadin-grid-column resizable header="Price (BTC)" .renderer=${(root, column, data) => {
                const price = this.round(parseFloat(data.item.bitcoinAmount) / parseFloat(data.item.qortAmount))
                render(html`${price}`, root)
            }}>
                                </vaadin-grid-column>
                                        <vaadin-grid-column resizable header="Amount (QORT)" path="qortAmount"></vaadin-grid-column>
                                        <vaadin-grid-column resizable header="Total (BTC)" path="bitcoinAmount"></vaadin-grid-column>
                                        <vaadin-grid-column resizable width="5rem" flex-grow="0" header="Action" .renderer=${(root, column, data) => {
                render(html`${this.renderCancelButton(data.item)}`, root)
            }}></vaadin-grid-column>
                                    </vaadin-grid>
                                </div>
                            </div>
                        </div>
                        <div class="my-historic-trades">
                            <div class="box">
                                <header>MY TRADE HISTORY</header>
                                <div class="border-wrapper">
                                    <vaadin-grid theme="compact column-borders row-stripes wrap-cell-content" id="myHistoricTradesGrid" aria-label="My Open Orders" .items="${this.myHistoricTrades}">
                                        <vaadin-grid-column resizable header="Date" .renderer=${(root, column, data) => {
                const dateString = new Date(data.item.timestamp).toLocaleString()
                render(html`${dateString}`, root)
            }}>
                                </vaadin-grid-column>
                                        <vaadin-grid-column resizable header="Status" path="mode"></vaadin-grid-column>
                                        <vaadin-grid-column resizable header="Price (BTC)" .renderer=${(root, column, data) => {
                const price = this.round(parseFloat(data.item.btcAmount) / parseFloat(data.item.qortAmount))
                render(html`${price}`, root)
            }}>
                                </vaadin-grid-column>
                                        <vaadin-grid-column resizable header="Amount (QORT)" path="qortAmount"></vaadin-grid-column>
                                        <vaadin-grid-column resizable header="Total (BTC)" .renderer=${(root, column, data) => {
                render(html`<span> ${data.item.btcAmount} </span>`, root)
            }}>
                                        </vaadin-grid-column>
                                    </vaadin-grid>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- <div class="full-width">
                        THIS IS JUST A WIDE CONTAINER, MIGHT BE USED TO DISPLAY SOME INFO OR WRITE UP (-_-)
                    </div> -->
                </div>

            </div>
            
            <!-- Manage Stuck Orders Dialog -->
            <mwc-dialog id="manageStuckOrdersDialog" scrimClickAction="${this.cancelStuckOfferBtnDisable ? '' : 'close'}">
                <div style="text-align:center">
                    <h1>Stuck Offers</h1>
                    <hr>
                </div>

                <div>
                    <vaadin-grid style="width: 500px" theme="compact column-borders row-stripes wrap-cell-content" id="stuckOrdersGrid" aria-label="My Offering Orders" .items="${this.myOfferingOrders}">
                            <vaadin-grid-column resizable header="Amount (QORT)" path="qortAmount"></vaadin-grid-column>
                            <vaadin-grid-column resizable header="Price (BTC)" path="priceBtc" ></vaadin-grid-column>
                            <vaadin-grid-column resizable header="Total (BTC)" path="btcAmount"></vaadin-grid-column>
                            <vaadin-grid-column resizable width="5rem" flex-grow="0" header="Action" .renderer=${(root, column, data) => {
                render(html`${this.renderCancelStuckOfferButton(data.item)}`, root)
            }}></vaadin-grid-column>
                    </vaadin-grid>
                </div>

                <mwc-button
                    ?disabled="${this.cancelStuckOfferBtnDisable}"
                    slot="secondaryAction"
                    dialogAction="cancel"
                    class="cancel">
                    Close
                </mwc-button>
            </mwc-dialog>
        `
    }


    firstUpdated() {

        // Check BTC Wallet Balance
        this.updateBTCAccountBalance()

        // Set Trade Panes
        this.openOrdersGrid = this.shadowRoot.getElementById('openOrdersGrid')

        this.openOrdersGrid.querySelector('#priceColumn').headerRenderer = function (root) {
            root.innerHTML = '<vaadin-grid-sorter path="priceBtc" direction="asc">Price (BTC)</vaadin-grid-sorter>';
        };


        this.myOrdersGrid = this.shadowRoot.getElementById('myOrdersGrid')
        this.historicTradesGrid = this.shadowRoot.getElementById('historicTradesGrid')
        this.myHistoricTradesGrid = this.shadowRoot.getElementById('myHistoricTradesGrid')
        this.stuckOrdersGrid = this.shadowRoot.getElementById('stuckOrdersGrid')

        // call getOpenOrdersGrid
        this.getOpenOrdersGrid()

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

        let configLoaded = false
        parentEpml.ready().then(() => {

            // Create Trade Portal Connection
            this.createConnection()

            parentEpml.subscribe('selected_address', async selectedAddress => {
                this.selectedAddress = {}
                selectedAddress = JSON.parse(selectedAddress)
                if (!selectedAddress || Object.entries(selectedAddress).length === 0) return
                this.selectedAddress = selectedAddress

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
        })


        parentEpml.imReady()
    }

    fillBuyForm(sellerRequest) {

        this.shadowRoot.getElementById('buyAmountInput').value = parseFloat(sellerRequest.qortAmount)
        this.shadowRoot.getElementById('buyPriceInput').value = this.round(parseFloat(sellerRequest.btcAmount) / parseFloat(sellerRequest.qortAmount))
        this.shadowRoot.getElementById('buyTotalInput').value = parseFloat(sellerRequest.btcAmount)
        this.shadowRoot.getElementById('qortalAtAddress').value = sellerRequest.qortalAtAddress

        this.buyBtnDisable = false
    }


    getOpenOrdersGrid() {

        const myGrid = this.shadowRoot.querySelector('#openOrdersGrid')

        myGrid.addEventListener('click', (e) => {
            let myItem = myGrid.getEventContext(e).item

            if (myItem !== undefined && myItem.qortalCreator !== this.selectedAddress.address) {
                this.fillBuyForm(myItem)
            }
        }, { passive: true })

    }

    processOfferingTrade(offer) {

        const offerItem = {
            ...offer,
            priceBtc: this.round(parseFloat(offer.btcAmount) / parseFloat(offer.qortAmount))
        }

        const addOffer = () => {
            this.openOrdersGrid.items.unshift(offerItem);
            this.openOrdersGrid.clearCache();
        }

        const initOffer = () => {
            this.openOrdersGrid.items.push(offerItem);
            this.openOrdersGrid.clearCache();
        }

        this.openOrdersGrid.items.length === 0 ? initOffer() : addOffer()
    }

    processRedeemedTrade(offer) {

        // If trade is mine, add it to my historic trades and also add it to historic trades
        if (offer.qortalCreator === this.selectedAddress.address) {

            // Check and Update BTC Wallet Balance
            if (this.tradeOffersSocketCounter > 1) {

                this.updateBTCAccountBalance()
            }

            // Add to my historic trades

            this.myHistoricTradesGrid.items.unshift(offer)
            this.myHistoricTradesGrid.clearCache();
        } else if (offer.partnerQortalReceivingAddress === this.selectedAddress.address) {

            // Check and Update BTC Wallet Balance
            if (this.tradeOffersSocketCounter > 1) {

                this.updateBTCAccountBalance()
            }

            // Add to my historic trades
            this.myHistoricTradesGrid.items.unshift(offer)
            this.myHistoricTradesGrid.clearCache();
        }

        // Add to historic trades
        this.historicTradesGrid.items.unshift(offer)
        this.historicTradesGrid.clearCache();
    }

    processTradingTrade(offer) {

        // Remove from open market orders
        if (this.tradeOffersSocketCounter > 1) {

            // Check and Update BTC Wallet Balance
            this.updateBTCAccountBalance()
        }

        this.openOrdersGrid.items.forEach((item, index) => {
            if (item.qortalAtAddress === offer.qortalAtAddress) {

                this.openOrdersGrid.items.splice(index, 1)
                this.openOrdersGrid.clearCache();
            }
        })
    }

    processRefundedTrade(offer) {

        if (offer.qortalCreator === this.selectedAddress.address) {

            // Check and Update BTC Wallet Balance
            if (this.tradeOffersSocketCounter > 1) {

                this.updateBTCAccountBalance()
            }

            // Add to my historic trades
            this.myHistoricTradesGrid.items.unshift(offer)
            this.myHistoricTradesGrid.clearCache()
        }
    }

    processCancelledTrade(offer) {

        if (offer.qortalCreator === this.selectedAddress.address) {

            // Check and Update BTC Wallet Balance
            if (this.tradeOffersSocketCounter > 1) {

                this.updateBTCAccountBalance()
            }

            // Add to my historic trades
            this.myHistoricTradesGrid.items.unshift(offer)
            this.myHistoricTradesGrid.clearCache()
        }

        this.openOrdersGrid.items.forEach((item, index) => {
            if (item.qortalAtAddress === offer.qortalAtAddress) {

                this.openOrdersGrid.items.splice(index, 1)
                this.openOrdersGrid.clearCache()
            }
        })

        this.stuckOrdersGrid.items.forEach((item, index) => {
            if (item.qortalAtAddress === offer.qortalAtAddress) {

                this.stuckOrdersGrid.items.splice(index, 1)
                this.stuckOrdersGrid.clearCache()
            }
        })
    }

    processTradeOffers(offers) {

        /** TRADE OFFER STATES or MODE
         *  - OFFERING
         *  - REDEEMED
         *  - TRADING
         *  - REFUNDED
         *  - CANCELLED
         */

        offers.forEach(offer => {

            if (offer.mode === 'OFFERING') {

                if (this.tradeOffersSocketCounter > 1) {

                    this.processOfferingTrade(offer)
                }
            } else if (offer.mode === 'REDEEMED') {

                this.processRedeemedTrade(offer)
            } else if (offer.mode === 'TRADING') {

                this.processTradingTrade(offer)  // Haha Trading Trade (^_^)
            } else if (offer.mode === 'REFUNDED') {

                this.processRefundedTrade(offer)
            } else if (offer.mode === 'CANCELLED') {

                this.processCancelledTrade(offer)
            }
        })
    }


    /**
     *  TradeBot Note by cat
     * 
     * trade-bot entry states:
     *   - when you do /crosschain/tradebot/create,
     *   - it returns unsigned DEPLOY_AT for you to sign & broadcast
     *   - so initial trade-bot state is BOB_WAITING_FOR_AT_CONFIRM, because trade-bot is waiting for UI to sign & broadcast txn and for that txn to be confirmed into a block
     *   - once that happens & Bob's trade-bot notices that DEPLOY_AT has confirmed (and hence AT created and running), then it switches to BOB_WAITING_FOR_MESSAGE
     *   - which is Bob's trade-bot waiting for a message from Alice's trade-bot telling it (Bob's trade-bot) that Alice's trade-bot has funded P2SH-A and some other details
     *   - when that message is sent, Bob's trade-bot processes that message and sends its own message to the AT (which switches it to TRADING mode)
     *   - but the next state for Bob's trade-bot is to wait for Alice to spot AT is locked to her and for her to fund P2SH-B, hence BOB_WAITING_FOR_P2SH_B
     *   - at this point, Bob's trade-bot finds P2SH-B on the bitcoin blockchain and can send secret-B to P2SH-B
     *   - when this happens, Alice uses secret-B and secret-A to redeem the QORT from the AT, so until Alice does this, Bob's trade-bot state is BOB_WAITING_FOR_AT_REDEEM
     *   - after Alice redeems QORT from AT, Bob can extract secret-A and capture the actual BTC funds from P2SH-A to his own bitcoin account and hence his trade-bot moves to BOB_DONE
     *   - if anything goes wrong then refunds occur and Bob's trade-bot ends up at BOB_REFUNDED instead
     *   - I think you can probably guess the corresponding meaning of states for Alice's point of view, but if not I can go through those too?
     *   - Alice calls /crosschain/tradebot/respond which funds P2SH-A
     *   - so her trade-bot waits for that to appear in bitcoin blockchain, so until then is ALICE_WAITING_FOR_P2SH_A
     *   - once the P2SH-A funding confirms, Alice's trade-bot can MESSAGE Bob's trade-bot with the details and changes to ALICE_WAITING_FOR_AT_LOCK
     *   - Bob's AT should then lock to trading with Alice (via those MESSAGEs above) and Alice's trade-bot notices this, (minimally) funds P2SH-B and waits until Bob 'spends' P2SH-B, hence ALICE_WATCH_P2SH_B
     *   - if Bob spends P2SH-B, then Alice can send secret-B and secret-A to the AT, claim the QORT and she's ALICE_DONE
     *   - if something goes wrong then her trade-bot needs to refund P2SH-B (if applicable) first (ALICE_REFUNDING_B)
     *   - and when that's done refund P2SH-A (ALICE_REFUNDING_A)
     *   - and when that's done her trade-bot ends up at ALICE_REFUNDED
     * 
     *   (PHEW)
     */

    processTradeBotStates(states) {

        /** TRADEBOT STATES
         *  - BOB_WAITING_FOR_AT_CONFIRM
         *  - BOB_WAITING_FOR_MESSAGE
         *  - BOB_WAITING_FOR_P2SH_B
         *  - BOB_WAITING_FOR_AT_REDEEM
         *  - BOB_DONE
         *  - BOB_REFUNDED
         *  - ALICE_WAITING_FOR_P2SH_A
         *  - ALICE_WAITING_FOR_AT_LOCK
         *  - ALICE_WATCH_P2SH_B
         *  - ALICE_DONE
         *  - ALICE_REFUNDING_B
         *  - ALICE_REFUNDING_A
         *  - ALICE_REFUNDED
         */

        //  Reverse the states
        states.reverse()

        states.forEach(state => {

            if (state.creatorAddress === this.selectedAddress.address) {

                if (state.tradeState == 'BOB_WAITING_FOR_AT_CONFIRM') {

                    this.changeTradeBotState(state, 'PENDING')
                } else if (state.tradeState == 'BOB_WAITING_FOR_MESSAGE') {

                    this.changeTradeBotState(state, 'LISTED')
                } else if (state.tradeState == 'BOB_WAITING_FOR_P2SH_B') {

                    this.changeTradeBotState(state, 'TRADING')
                } else if (state.tradeState == 'BOB_WAITING_FOR_AT_REDEEM') {

                    this.changeTradeBotState(state, 'TRADING')
                } else if (state.tradeState == 'BOB_DONE') {

                    this.handleCompletedState(state)
                } else if (state.tradeState == 'BOB_REFUNDED') {

                    this.handleCompletedState(state)
                } else if (state.tradeState == 'ALICE_WAITING_FOR_P2SH_A') {

                    this.changeTradeBotState(state, 'PENDING')
                } else if (state.tradeState == 'ALICE_WAITING_FOR_AT_LOCK') {

                    this.changeTradeBotState(state, 'TRADING')
                } else if (state.tradeState == 'ALICE_WATCH_P2SH_B') {

                    this.changeTradeBotState(state, 'TRADING')
                } else if (state.tradeState == 'ALICE_DONE') {

                    this.handleCompletedState(state)
                } else if (state.tradeState == 'ALICE_REFUNDING_B') {

                    this.changeTradeBotState(state, 'REFUNDING')
                } else if (state.tradeState == 'ALICE_REFUNDING_A') {

                    this.changeTradeBotState(state, 'REFUNDING')
                } else if (state.tradeState == 'ALICE_REFUNDED') {

                    this.handleCompletedState(state)
                }
            }
        })

        // Filter Stuck Trades
        this.filterStuckTrades(states)
    }


    changeTradeBotState(state, tradeState) {

        // Set Loading state
        this.myOrdersGrid.loading = true

        const stateItem = {
            ...state,
            _tradeState: tradeState
        }

        const item = this.myOrdersGrid.querySelector(`#${state.atAddress}`)

        const addStateItem = () => {

            this.myOrdersGrid.loading = false
            this.myOrdersGrid.items.unshift(stateItem)
            this.myOrdersGrid.clearCache();
        }

        const updateStateItem = () => {

            this.myOrdersGrid.items.forEach((item, index) => {
                if (item.atAddress === state.atAddress) {

                    this.myOrdersGrid.items.splice(index, 1)
                    this.myOrdersGrid.items.unshift(stateItem)
                    this.myOrdersGrid.clearCache();
                }
            })
        }

        item ? updateStateItem() : addStateItem()
    }

    // ONLY USE FOR BOB_DONE, BOB_REFUNDED, ALICE_DONE, ALICE_REFUNDED
    handleCompletedState(state) {

        this.myOrdersGrid.items.forEach((item, index) => {
            if (item.atAddress === state.atAddress) {

                this.myOrdersGrid.items.splice(index, 1)
                this.myOrdersGrid.clearCache();
            }
        })
    }


    processGetOffers(offers) {

        const offerItem = (offer) => {
            return {
                ...offer,
                btcAmount: offer.expectedBitcoin,
                priceBtc: this.round(parseFloat(offer.expectedBitcoin) / parseFloat(offer.qortAmount))
            }
        }

        const addOffer = (offer) => {
            this.openOrdersGrid.items.unshift(offerItem(offer))
            this.openOrdersGrid.clearCache();
        }

        const initOffer = (offer) => {
            this.openOrdersGrid.items.push(offerItem(offer))
            this.openOrdersGrid.clearCache()
        }

        const handleOffers = () => {
            offers.forEach(offer => {
                this.openOrdersGrid.items.length === 0 ? initOffer(offer) : addOffer(offer)
            })
        }

        handleOffers()
    }


    initSocket() {

        const getOffers = async () => {

            const url = `http://NODEURL/crosschain/tradeoffers`
            const res = await fetch(url)
            const _openTradeOrders = await res.json()
            const openTradeOrders = await _openTradeOrders.filter(order => order.mode === "OFFERING")
            self.postMessage({ type: "GET_OFFERS", data: openTradeOrders });
        }

        const initTradeOffersWebSocket = () => {

            let tradeOffersSocketCounter = 0
            let socketTimeout

            let socketLink = `ws://NODEURL/websockets/crosschain/tradeoffers?includeHistoric=true`;

            const socket = new WebSocket(socketLink);

            // Open Connection
            socket.onopen = () => {

                setTimeout(pingSocket, 50)
                tradeOffersSocketCounter += 1
                console.log(`[TRADE-OFFERS-SOCKET] ==>: CONNECTED`);
            }

            // Message Event
            socket.onmessage = (e) => {

                self.postMessage({ type: "TRADE_OFFERS", data: e.data, counter: tradeOffersSocketCounter });
                tradeOffersSocketCounter += 1
            }

            // Closed Event
            socket.onclose = () => {
                clearTimeout(socketTimeout)
                console.log(`[TRADE-OFFERS-SOCKET] ==>: CLOSED`);

                // Restart Socket Connection
                restartTradeOffersWebSocket()
            }

            // Error Event
            socket.onerror = (e) => {
                clearTimeout(socketTimeout)
                console.log(`[TRADE-OFFERS-SOCKET] ==>: ${e.type}`);
            }

            const pingSocket = () => {
                socket.send('ping')

                socketTimeout = setTimeout(pingSocket, 295000)
            }

        };

        const initTradeBotWebSocket = () => {

            let socketTimeout

            let socketLink = `ws://NODEURL/websockets/crosschain/tradebot`;

            const socket = new WebSocket(socketLink);

            // Open Connection
            socket.onopen = () => {

                setTimeout(pingSocket, 50)
                console.log(`[TRADEBOT-SOCKET] ==>: CONNECTED`);
            }

            // Message Event
            socket.onmessage = (e) => {

                self.postMessage({ type: "TRADE_BOT", data: e.data });
            }

            // Closed Event
            socket.onclose = () => {
                clearTimeout(socketTimeout)
                console.log(`[TRADEBOT-SOCKET] ==>: CLOSED`);

                // Restart Socket Connection
                restartTradeBotWebSocket()
            }

            // Error Event
            socket.onerror = (e) => {
                clearTimeout(socketTimeout)
                console.log(`[TRADEBOT-SOCKET] ==>: ${e.type}`);
            }

            const pingSocket = () => {
                socket.send('ping')

                socketTimeout = setTimeout(pingSocket, 295000)
            }

        };

        const restartTradeOffersWebSocket = () => {

            setTimeout(() => initTradeOffersWebSocket(), 3000)
        }

        const restartTradeBotWebSocket = () => {

            setTimeout(() => initTradeBotWebSocket(), 3000)
        }

        // Get Offers
        getOffers()

        // Start TradeOffersWebSocket
        initTradeOffersWebSocket()

        // Start TradeBotWebSocket
        initTradeBotWebSocket()
    }

    async sellAction() {

        this.isSellLoading = true
        this.sellBtnDisable = true

        const sellAmountInput = this.shadowRoot.getElementById('sellAmountInput').value
        const sellTotalInput = this.shadowRoot.getElementById('sellTotalInput').value
        const fundingQortAmount = this.round(parseFloat(sellAmountInput) + 0.001) // Set default AT fees for processing to 0.001 QORT

        const makeRequest = async () => {

            const response = await parentEpml.request('tradeBotCreateRequest', {
                creatorPublicKey: this.selectedAddress.base58PublicKey,
                qortAmount: parseFloat(sellAmountInput),
                fundingQortAmount: fundingQortAmount,
                bitcoinAmount: parseFloat(sellTotalInput),
                tradeTimeout: 10080,
                receivingAddress: this.selectedAddress.btcWallet.address
            })

            return response
        }

        const manageResponse = (response) => {

            if (response === true) {

                this.isSellLoading = false
                this.sellBtnDisable = false

                this.shadowRoot.getElementById('sellAmountInput').value = this.initialAmount
                this.shadowRoot.getElementById('sellPriceInput').value = this.initialAmount
                this.shadowRoot.getElementById('sellTotalInput').value = this.initialAmount
            } else if (response === false) {

                this.isSellLoading = false
                this.sellBtnDisable = false

                parentEpml.request('showSnackBar', "Failed to Create Trade. Try again!");
            } else {

                this.isSellLoading = false
                this.sellBtnDisable = false

                parentEpml.request('showSnackBar', `Failed to Create Trade. ERROR_CODE: ${response.message}`);
            }
        }

        if ((this.round(parseFloat(fundingQortAmount) + parseFloat(0.002))) > parseFloat(this.qortBalance)) {

            this.isSellLoading = false
            this.sellBtnDisable = false

            parentEpml.request('showSnackBar', "Insufficient Funds!")
            return false
        } else {
            const res = await makeRequest()
            manageResponse(res)
        }
    }

    async buyAction() {

        this.isBuyLoading = true
        this.buyBtnDisable = true

        const qortalAtAddress = this.shadowRoot.getElementById('qortalAtAddress').value

        const makeRequest = async () => {

            const response = await parentEpml.request('tradeBotRespondRequest', {
                atAddress: qortalAtAddress,
                xprv58: this.selectedAddress.btcWallet.derivedMasterPrivateKey,
                receivingAddress: this.selectedAddress.address
            })

            return response
        }

        const manageResponse = (response) => {

            if (response === true) {

                this.isBuyLoading = false
                this.buyBtnDisable = true


                this.shadowRoot.getElementById('buyAmountInput').value = this.initialAmount
                this.shadowRoot.getElementById('buyPriceInput').value = this.initialAmount
                this.shadowRoot.getElementById('buyTotalInput').value = this.initialAmount
                this.shadowRoot.getElementById('qortalAtAddress').value = ''

                parentEpml.request('showSnackBar', "Buy Request Successful!");

            } else if (response === false) {

                this.isBuyLoading = false
                this.buyBtnDisable = false

                parentEpml.request('showSnackBar', "Failed to Create Trade. Try again!");
            } else {

                this.isBuyLoading = false
                this.buyBtnDisable = false

                parentEpml.request('showSnackBar', `Failed to Create Trade. ERROR_CODE: ${response.message}`);
            }
        }

        // Call makeRequest
        const res = await makeRequest()
        manageResponse(res)

    }

    async cancelAction(state) {

        const button = this.shadowRoot.querySelector(`mwc-button#${state.atAddress}`)
        button.innerHTML = `<paper-spinner-lite active></paper-spinner-lite>`
        this.cancelBtnDisable = true

        const makeRequest = async () => {

            const response = await parentEpml.request('deleteTradeOffer', {
                creatorPublicKey: this.selectedAddress.base58PublicKey,
                atAddress: state.atAddress
            })

            return response
        }

        const manageResponse = (response) => {

            if (response === true) {

                button.remove()
                this.cancelBtnDisable = false

                parentEpml.request('showSnackBar', "Trade Cancelling In Progress!");

            } else if (response === false) {

                button.innerHTML = 'CANCEL'
                this.cancelBtnDisable = false

                parentEpml.request('showSnackBar', "Failed to Cancel Trade. Try again!");
            } else {

                button.innerHTML = 'CANCEL'
                this.cancelBtnDisable = false

                parentEpml.request('showSnackBar', `Failed to Cancel Trade. ERROR_CODE: ${response.message}`);
            }
        }

        // Call makeRequest
        const res = await makeRequest()
        manageResponse(res)

    }

    updateAccountBalance() {

        clearTimeout(this.updateAccountBalanceTimeout)
        parentEpml.request('apiCall', {
            url: `/addresses/balance/${this.selectedAddress.address}`
        }).then(res => {
            this.qortBalance = res

            this.updateAccountBalanceTimeout = setTimeout(() => this.updateAccountBalance(), 10000)
        })
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


    renderCancelButton(stateItem) {

        if (stateItem.tradeState === 'BOB_WAITING_FOR_MESSAGE') {
            return html`<mwc-button id="${stateItem.atAddress}" ?disabled=${this.cancelBtnDisable} class="cancel" @click=${(e) => this.cancelAction(stateItem)}>CANCEL</mwc-button>`
        } else {
            return ''
        }
    }

    showStuckOrdersDialog() {

        this.shadowRoot.querySelector('#manageStuckOrdersDialog').show()
    }

    async cancelStuckOfferAction(offer) {

        this.cancelStuckOfferBtnDisable = true

        const makeRequest = async () => {

            const response = await parentEpml.request('deleteTradeOffer', {
                creatorPublicKey: this.selectedAddress.base58PublicKey,
                atAddress: offer.qortalAtAddress
            })

            return response
        }

        const manageResponse = (response) => {

            if (response === true) {

                this.cancelStuckOfferBtnDisable = false
                parentEpml.request('showSnackBar', "Trade Cancelling In Progress!");
            } else if (response === false) {

                this.cancelStuckOfferBtnDisable = false
                parentEpml.request('showSnackBar', "Failed to Cancel Trade. Try again!");
            } else {

                this.cancelStuckOfferBtnDisable = false
                parentEpml.request('showSnackBar', `Failed to Cancel Trade. ERROR_CODE: ${response.message}`);
            }
        }

        // Call makeRequest
        const res = await makeRequest()
        manageResponse(res)

    }


    renderCancelStuckOfferButton(offerItem) {

        if (offerItem.mode === 'OFFERING' && offerItem.qortalCreator === this.selectedAddress.address) {
            return html`<mwc-button id="offer-${offerItem.qortalAtAddress}" ?disabled=${this.cancelStuckOfferBtnDisable} class="cancel" @click=${(e) => this.cancelStuckOfferAction(offerItem)}>CANCEL</mwc-button>`
        } else {
            return ''
        }
    }

    // Helper Functions (Re-Used in Most part of the UI )
    _checkSellAmount(e) {
        const targetAmount = e.target.value
        const target = e.target


        if (targetAmount.length === 0) {

            this.isValidAmount = false
            this.sellBtnDisable = true

            // Quick Hack to lose and regain focus inorder to display error message without user having to click outside the input field
            e.target.blur()
            e.target.focus()

            e.target.invalid = true
            e.target.validationMessage = "Invalid Amount!"
        } else {

            const sellAmountInput = this.shadowRoot.getElementById('sellAmountInput').value
            const sellPriceInput = this.shadowRoot.getElementById('sellPriceInput').value

            this.shadowRoot.getElementById('sellTotalInput').value = this.round(parseFloat(sellAmountInput) * parseFloat(sellPriceInput))
            this.sellBtnDisable = false
        }

        e.target.blur()
        e.target.focus()

        e.target.validityTransform = (newValue, nativeValidity) => {


            if (newValue.includes('-') === true) {

                this.sellBtnDisable = true
                target.validationMessage = "Invalid Amount!"

                return {
                    valid: false
                }
            } else if (!nativeValidity.valid) {

                if (newValue.includes('.') === true) {

                    let myAmount = newValue.split('.')
                    if (myAmount[1].length > 8) {

                        this.sellBtnDisable = true
                        target.validationMessage = "Invalid Amount!"
                    } else {

                        const sellAmountInput = this.shadowRoot.getElementById('sellAmountInput').value
                        const sellPriceInput = this.shadowRoot.getElementById('sellPriceInput').value

                        this.shadowRoot.getElementById('sellTotalInput').value = this.round(parseFloat(sellAmountInput) * parseFloat(sellPriceInput))
                        this.sellBtnDisable = false

                        return {
                            valid: true
                        }
                    }
                }
            } else {

                const sellAmountInput = this.shadowRoot.getElementById('sellAmountInput').value
                const sellPriceInput = this.shadowRoot.getElementById('sellPriceInput').value

                this.shadowRoot.getElementById('sellTotalInput').value = this.round(parseFloat(sellAmountInput) * parseFloat(sellPriceInput))
                this.sellBtnDisable = false
            }
        }
    }

    _checkBuyAmount(e) {
        const targetAmount = e.target.value
        const target = e.target

        if (targetAmount.length === 0) {

            this.isValidAmount = false
            this.sellBtnDisable = true

            e.target.blur()
            e.target.focus()

            e.target.invalid = true
            e.target.validationMessage = "Invalid Amount!"
        } else {

            this.buyBtnDisable = false
        }

        e.target.blur()
        e.target.focus()

        e.target.validityTransform = (newValue, nativeValidity) => {


            if (newValue.includes('-') === true) {

                this.buyBtnDisable = true
                target.validationMessage = "Invalid Amount!"

                return {
                    valid: false
                }
            } else if (!nativeValidity.valid) {

                if (newValue.includes('.') === true) {

                    let myAmount = newValue.split('.')
                    if (myAmount[1].length > 8) {

                        this.buyBtnDisable = true
                        target.validationMessage = "Invalid Amount!"
                    } else {

                        this.buyBtnDisable = false

                        return {
                            valid: true
                        }
                    }
                }
            } else {

                this.buyBtnDisable = false
            }
        }
    }

    clearSelection() {

        window.getSelection().removeAllRanges()
        window.parent.getSelection().removeAllRanges()
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

    clearBuyForm() {
        // ...

        this.shadowRoot.getElementById('buyAmountInput').value = this.initialAmount
        this.shadowRoot.getElementById('buyPriceInput').value = this.initialAmount
        this.shadowRoot.getElementById('buyTotalInput').value = this.initialAmount
        this.shadowRoot.getElementById('qortalAtAddress').value = ''

        this.buyBtnDisable = true
    }

    clearSellForm() {
        // ...

        this.shadowRoot.getElementById('sellAmountInput').value = this.initialAmount
        this.shadowRoot.getElementById('sellPriceInput').value = this.initialAmount
        this.shadowRoot.getElementById('sellTotalInput').value = this.initialAmount
    }

    isEmptyArray(arr) {
        if (!arr) { return true }
        return arr.length === 0
    }

    round(number) {
        let result = (Math.round(parseFloat(number) * 1e8) / 1e8).toFixed(8)
        return result
    }

    inlineWorker(passedFunction, modifiers) {

        let parsedFunction = ``

        modifiers.forEach(modifier => {
            let regex = new RegExp(modifier.searchValue, 'g')
            parsedFunction = parsedFunction.length === 0 ? `(function ${passedFunction.toString().trim().replace(regex, modifier.replaceValue)})()` : parsedFunction.toString().trim().replace(regex, modifier.replaceValue)
        })

        const workerUrl = URL.createObjectURL(new Blob([parsedFunction], { type: "text/javascript" }));
        const worker = new Worker(workerUrl);
        URL.revokeObjectURL(workerUrl);
        return worker;
    }

    createConnection() {

        const handleMessage = (message) => {

            switch (message.type) {
                case "GET_OFFERS":
                    return this.processGetOffers(message.data)
                case "TRADE_OFFERS":
                    this.tradeOffersSocketCounter = message.counter
                    return this.processTradeOffers(JSON.parse(message.data))
                case "TRADE_BOT":
                    return this.processTradeBotStates(JSON.parse(message.data))
                default:
                    break;
            }
        }

        const modifiers = [
            { searchValue: 'NODEURL', replaceValue: 'localhost:12391' }
        ]

        const connectedWorker = this.inlineWorker(this.initSocket, modifiers)
        connectedWorker.addEventListener('message', function (event) {
            handleMessage(event.data)
        })
    }

    handleStuckTrades() {

        let tradeBotStates = []

        self.addEventListener('message', function (event) {
            tradeBotStates = event.data
        })

        const filterStuckOffers = (myOffers) => {

            const myTradeBotStates = tradeBotStates.filter(state => state.creatorAddress === 'SELECTED_ADDRESS');

            const stuckOffers = myOffers.filter(myOffer => {
                let value = myTradeBotStates.some(myTradeBotState => myOffer.qortalAtAddress === myTradeBotState.atAddress)
                return !value
            });
            return stuckOffers;
        }

        const getOffers = async () => {

            const url = `http://NODEURL/crosschain/tradeoffers`
            const res = await fetch(url)
            const openTradeOrders = await res.json()
            const myOpenTradeOrders = await openTradeOrders.filter(order => order.mode === "OFFERING" && order.qortalCreator === "SELECTED_ADDRESS");

            const stuckOffers = filterStuckOffers(myOpenTradeOrders)
            self.postMessage({ type: "STUCK_OFFERS", data: stuckOffers });
        }

        // Get Offers
        getOffers()
    }

    filterStuckTrades(states) {

        const handleMessage = (message) => {

            const offers = message.data

            const offerItem = (offer) => {
                return {
                    ...offer,
                    btcAmount: offer.expectedBitcoin,
                    priceBtc: this.round(parseFloat(offer.expectedBitcoin) / parseFloat(offer.qortAmount))
                }
            }

            const addStuckOrders = (offerItem) => {

                if (offerItem.qortalCreator === this.selectedAddress.address) {
                    this.stuckOrdersGrid.items.unshift(offerItem)
                    this.stuckOrdersGrid.clearCache();
                }
            }

            const handleOffers = () => {
                offers.forEach(offer => {
                    addStuckOrders(offerItem(offer))
                })
            }

            handleOffers()
        }

        const modifiers = [
            { searchValue: 'NODEURL', replaceValue: 'localhost:12391' },
            { searchValue: 'SELECTED_ADDRESS', replaceValue: this.selectedAddress.address }
        ]

        const connectedWorker = this.inlineWorker(this.handleStuckTrades, modifiers)
        connectedWorker.postMessage(states)
        connectedWorker.addEventListener('message', function (event) {
            handleMessage(event.data)
            connectedWorker.terminate()
        })
    }

}

window.customElements.define('trade-portal', TradePortal)
