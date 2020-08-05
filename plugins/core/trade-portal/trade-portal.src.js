
import { LitElement, html, css } from 'lit-element'
import { render } from 'lit-html'
import { Epml } from '../../../epml.js'

import '@material/mwc-button'
import '@material/mwc-textfield'
import '@material/mwc-icon-button'
import '@polymer/paper-spinner/paper-spinner-lite.js'
import '@vaadin/vaadin-grid/vaadin-grid.js'
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
            myOpenOrders: { type: Array },
            myHistoricTrades: { type: Array },
            _openOrdersStorage: { type: Array },
            _myOpenOrdersStorage: { type: Array },
            socketConnectionCounter: { type: Number },
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
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
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
        this.myOpenOrders = []
        this.myHistoricTrades = []
        this._myOpenOrdersStorage = []
        this._openOrdersStorage = []
        this.socketConnectionCounter = 0
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
                                <header>CLOSED PRICE LINE CHART</header>
                                <div class="card">

                                </div>
                            </div>
                        </div>
                        <div class="open-trades">
                            <div class="box">
                                <header>OPEN MARKET SELL ORDERS</header>
                                <div class="border-wrapper">
                                    <vaadin-grid theme="compact column-borders row-stripes wrap-cell-content" id="openOrdersGrid" aria-label="Open Orders" .items="${this.openOrders}">
                                        <vaadin-grid-column header="Amount (QORT)" path="qortAmount"></vaadin-grid-column>
                                        <vaadin-grid-column width="2rem" header="Price (BTC)" .renderer=${(root, column, data) => {
                const price = this.round(parseFloat(data.item.btcAmount) / parseFloat(data.item.qortAmount))
                render(html`${price}`, root)
            }}>
                                </vaadin-grid-column>
                                        <vaadin-grid-column header="Total (BTC)" path="btcAmount"></vaadin-grid-column>
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
                                        <vaadin-grid-column header="Amount (QORT)" path="qortAmount"></vaadin-grid-column>
                                        <vaadin-grid-column width="2rem" header="Price (BTC)" .renderer=${(root, column, data) => {
                const price = this.round(parseFloat(data.item.btcAmount) / parseFloat(data.item.qortAmount))
                render(html`${price}`, root)
            }}>
                                </vaadin-grid-column>
                                        <vaadin-grid-column header="Total (BTC)" path="btcAmount"></vaadin-grid-column>
                                    </vaadin-grid>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="third-trade-section">
                        <div class="my-open-orders">
                            <div class="box">
                                <header>MY ORDERS</header>
                                <div class="border-wrapper">
                                    <vaadin-grid theme="compact column-borders row-stripes wrap-cell-content" id="myOpenOrdersGrid" aria-label="My Open Orders" .items="${this.myOpenOrders}">
                                        <vaadin-grid-column width="2rem" header="Date" .renderer=${(root, column, data) => {
                const dateString = new Date(data.item.timestamp).toLocaleString()
                render(html`${dateString}`, root)
            }}>
                                </vaadin-grid-column>
                                        <vaadin-grid-column header="Status" path="mode"></vaadin-grid-column>
                                        <vaadin-grid-column width="2rem" header="Price (BTC)" .renderer=${(root, column, data) => {
                const price = this.round(parseFloat(data.item.btcAmount) / parseFloat(data.item.qortAmount))
                render(html`${price}`, root)
            }}>
                                </vaadin-grid-column>
                                        <vaadin-grid-column header="Amount (QORT)" path="qortAmount"></vaadin-grid-column>
                                        <vaadin-grid-column header="Total (BTC)" path="btcAmount"></vaadin-grid-column>
                                    </vaadin-grid>
                                </div>
                            </div>
                        </div>
                        <div class="my-historic-trades">
                            <div class="box">
                                <header>MY HISTORIC TRADES</header>
                                <div class="border-wrapper">
                                    <vaadin-grid theme="compact column-borders row-stripes wrap-cell-content" id="myHistoricTradesGrid" aria-label="My Open Orders" .items="${this.myHistoricTrades}">
                                        <vaadin-grid-column width="2rem" header="Date" .renderer=${(root, column, data) => {
                const dateString = new Date(data.item.timestamp).toLocaleString()
                render(html`${dateString}`, root)
            }}>
                                </vaadin-grid-column>
                                        <vaadin-grid-column header="Status" path="mode"></vaadin-grid-column>
                                        <vaadin-grid-column width="2rem" header="Price (BTC)" .renderer=${(root, column, data) => {
                const price = this.round(parseFloat(data.item.btcAmount) / parseFloat(data.item.qortAmount))
                render(html`${price}`, root)
            }}>
                                </vaadin-grid-column>
                                        <vaadin-grid-column header="Amount (QORT)" path="qortAmount"></vaadin-grid-column>
                                        <vaadin-grid-column header="Total (BTC)" path="btcAmount"></vaadin-grid-column>
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
        `
    }


    firstUpdated() {

        // Check BTC Wallet Balance
        this.updateBTCAccountBalance()

        // call getOpenOrdersGrid
        this.getOpenOrdersGrid()

        this.initSocket()

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


    // This is not being used now... 
    // gethistoricTradesGrid() {

    //     const myGrid = this.shadowRoot.querySelector('#historicTradesGrid')

    //     myGrid.addEventListener('click', (e) => {
    //         let myItem = myGrid.getEventContext(e).item

    //         if (myItem !== undefined) {
    //             this.fillBuyForm(myItem)
    //         }
    //     }, { passive: true })

    // }


    processOfferingTrade(offer) {
        // ...

        // If trade is mine, show it in my open orders and market open orders
        if (offer.qortalCreator === this.selectedAddress.address) {
            // ...

            this._myOpenOrdersStorage = this._myOpenOrdersStorage.concat(offer)
            this.myOpenOrders = [...this._myOpenOrdersStorage]
            // this._myOpenOrdersStorage = [...this.myOpenOrders]
        }

        // Add to open market orders
        this._openOrdersStorage = this._openOrdersStorage.concat(offer)
        this.shadowRoot.querySelector('#openOrdersGrid').push('items', offer)

    }

    processRedeemedTrade(offer) {
        //...

        // If trade is mine, remove it from my open orders, add it to my historic trades and also add it to historic trades
        if (offer.qortalCreator === this.selectedAddress.address) {

            // Check and Update BTC Wallet Balance
            if (this.socketConnectionCounter > 1) {

                this.updateBTCAccountBalance()
            }

            // Add to my historic trades
            this.shadowRoot.querySelector('#myHistoricTradesGrid').push('items', offer)

            // Remove from my open order when trade is redeemed
            if (this._myOpenOrdersStorage.length !== 0) {

                this._myOpenOrdersStorage = this.shadowRoot.querySelector('#myOpenOrdersGrid').items.filter(myOpenOrder => myOpenOrder.qortalAtAddress !== offer.qortalAtAddress)
                this.myOpenOrders = [...this._myOpenOrdersStorage]
            }
        } else if (offer.partnerQortalReceivingAddress === this.selectedAddress.address) {

            // Check and Update BTC Wallet Balance
            if (this.socketConnectionCounter > 1) {

                this.updateBTCAccountBalance()
            }

            // Add to my historic trades
            this.shadowRoot.querySelector('#myHistoricTradesGrid').push('items', offer)
        }

        // Add to historic trades
        this.shadowRoot.querySelector('#historicTradesGrid').push('items', offer)
    }

    processTradingTrade(offer) {
        // ...

        // console.log('I am trading: ', offer);

        // If I am the creator of the trade (buy or sell), update my open orders, remove the order from open market orders
        if (offer.qortalCreator === this.selectedAddress.address) {
            // ... A Sell

            if (this._myOpenOrdersStorage.length === 0) {

                this._myOpenOrdersStorage = this._myOpenOrdersStorage.concat(offer)
                this.myOpenOrders = [...this._myOpenOrdersStorage]
            } else {

                this._myOpenOrdersStorage = this._myOpenOrdersStorage.map(myOpenOrder => {
                    if (myOpenOrder.qortalAtAddress === offer.qortalAtAddress) {
                        return offer
                    } else {
                        return myOpenOrder
                    }
                })
                this.myOpenOrders = [...this._myOpenOrdersStorage]
            }

        }

        // else if (offer.partnerQortalReceivingAddress === this.selectedAddress.address) {
        //     //... A Buy

        //     this._myOpenOrdersStorage = this._myOpenOrdersStorage.concat(offer)
        //     this.myOpenOrders = [...this._myOpenOrdersStorage]

        //     // Check and Update BTC Wallet Balance
        //     this.updateBTCAccountBalance()
        // }

        // Remove from open market orders TODO: How to determine a buy or sell ?
        this._openOrdersStorage = this._openOrdersStorage.filter(openOrder => openOrder.qortalAtAddress !== offer.qortalAtAddress)
        this.openOrders = [...this._openOrdersStorage]
    }

    processRefundedTrade(offer) {
        // ...
    }

    processCancelledTrade(offer) {
        // ...


    }

    processOffers(offers) {

        // console.log("TRADE OFFERS: ", offers);

        /** TRADE OFFER STATES or MODE
         *  - OFFERING
         *  - REDEEMED
         *  - TRADING
         *  - REFUNDED
         *  - CANCELLED
         */

        offers.forEach(offer => {
            if (offer.mode == 'OFFERING') {

                this.processOfferingTrade(offer)
            } else if (offer.mode == 'REDEEMED') {

                this.processRedeemedTrade(offer)
            } else if (offer.mode == 'TRADING') {

                this.processTradingTrade(offer)  // Haha Trading Trade (^_^)
            } else if (offer.mode == 'REFUNDED') {

                this.processRefundedTrade(offer)
            } else if (offer.mode == 'CANCELLED') {

                this.processCancelledTrade(offer)
            }
        })
    }

    initSocket() {

        const startConnection = () => {

            let socketTimeout

            let myNode = window.parent.reduxStore.getState().app.nodeConfig.knownNodes[window.parent.reduxStore.getState().app.nodeConfig.node]
            let nodeUrl = myNode.domain + ":" + myNode.port

            let socketLink

            if (window.parent.location.protocol === "https:") {

                socketLink = `wss://${nodeUrl}/websockets/crosschain/tradeoffers?includeHistoric=true`;
            } else {

                // Fallback to http
                socketLink = `ws://${nodeUrl}/websockets/crosschain/tradeoffers?includeHistoric=true`;
            }

            const socket = new WebSocket(socketLink);

            // Open Connection
            socket.onopen = () => {

                setTimeout(pingSocket, 50)
                this.socketConnectionCounter += 1
            }

            // Message Event
            socket.onmessage = (e) => {

                this.processOffers(JSON.parse(e.data))
            }

            // Closed Event
            socket.onclose = () => {
                clearTimeout(socketTimeout)
            }

            // Error Event
            socket.onerror = (e) => {
                clearTimeout(socketTimeout)
                console.log(`[TRADE-SOCKET ==>: ${e.type}`);
            }

            const pingSocket = () => {
                socket.send('ping')

                socketTimeout = setTimeout(pingSocket, 295000)
            }

        };

        startConnection()
    }

    async sellAction() {
        // ...

        this.isSellLoading = true
        this.sellBtnDisable = true

        const sellAmountInput = this.shadowRoot.getElementById('sellAmountInput').value
        // const sellPriceInput = this.shadowRoot.getElementById('sellPriceInput').value
        const sellTotalInput = this.shadowRoot.getElementById('sellTotalInput').value
        const fundingQortAmount = parseFloat(sellAmountInput) + 1 // Set default AT fees for processing to 1 QORT

        const makeRequest = async () => {

            const response = await parentEpml.request('tradeBotCreateRequest', {
                creatorPublicKey: this.selectedAddress.base58PublicKey,
                qortAmount: parseFloat(sellAmountInput),
                fundingQortAmount: fundingQortAmount,
                bitcoinAmount: parseFloat(sellTotalInput),
                tradeTimeout: 10080,
                receivingAddress: this.selectedAddress.btcWallet._taddress
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

                const tradeItem = {
                    timestamp: Date.now(),
                    btcAmount: sellTotalInput,
                    qortAmount: sellAmountInput,
                    mode: 'PENDING',
                    qortalCreator: this.selectedAddress.address
                }

                // Append Order to My Open Orders
                this.shadowRoot.querySelector('#myOpenOrdersGrid').push('items', tradeItem)
            } else {

                this.isSellLoading = false
                this.sellBtnDisable = false

                parentEpml.request('showSnackBar', "Failed to Create Trade. Try again!");
            }
        }

        if ((parseFloat(fundingQortAmount) + parseFloat(0.002)) > parseFloat(this.qortBalance)) {

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
        // ...

        this.isBuyLoading = true
        this.buyBtnDisable = true

        const qortalAtAddress = this.shadowRoot.getElementById('qortalAtAddress').value

        console.log(qortalAtAddress);


        const makeRequest = async () => {

            const response = await parentEpml.request('tradeBotRespondRequest', {
                atAddress: qortalAtAddress,
                xprv58: this.selectedAddress.btcWallet._tDerivedMasterPrivateKey,
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

                parentEpml.request('showSnackBar', "Buy Order Successful! Trade in Progress...");

            } else {

                this.isBuyLoading = false
                this.buyBtnDisable = false

                parentEpml.request('showSnackBar', "Failed to Create Trade. Try again!");
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
            body: window.parent.reduxStore.getState().app.selectedAddress.btcWallet._tDerivedMasterPrivateKey
        }).then(res => {
            this.btcBalance = (Number(res) / 1e8).toFixed(8)
        })
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
}

window.customElements.define('trade-portal', TradePortal)
