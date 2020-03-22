/* Webcomponents polyfill... https://github.com/webcomponents/webcomponentsjs#using-webcomponents-loaderjs */
import '@webcomponents/webcomponentsjs/webcomponents-loader.js'
/* Es6 browser but transpi;led code */
import '@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js'

import { LitElement, html, css } from 'lit-element'
// import { Epml } from '../../../src/epml.js'
import { Epml } from '../../../epml.js'

import '@material/mwc-icon'
import '@material/mwc-button'
import '@material/mwc-textfield'
import '@material/mwc-dialog'
import '@material/mwc-slider'

import '@polymer/paper-spinner/paper-spinner-lite.js'
// import '@polymer/paper-input/paper-input.js'
// import * as thing from 'time-elements'
import '@vaadin/vaadin-grid/vaadin-grid.js'
import '@vaadin/vaadin-grid/theme/material/all-imports.js'

const parentEpml = new Epml({ type: 'WINDOW', source: window.parent })

class RewardShare extends LitElement {
    static get properties() {
        return {
            loading: { type: Boolean },
            rewardShares: { type: Array },
            recipientPublicKey: { type: String },
            selectedAddress: { type: Object },
            createRewardShareLoading: { type: Boolean },
            rewardSharePercentage: { type: Number },
            error: { type: Boolean },
            message: { type: String }
        }
    }

    static get styles() {
        return css`
            * {
                --mdc-theme-primary: rgb(3, 169, 244);
                --mdc-theme-secondary: var(--mdc-theme-primary);
                --paper-input-container-focus-color: var(--mdc-theme-primary);
            }
            #reward-share-page {
                background: #fff;
                padding: 12px 24px;
            }

            h2 {
                margin:0;
            }

            h2, h3, h4, h5 {
                color:#333;
                font-weight: 400;
            }
        `
    }

    constructor() {
        super()
        this.selectedAddress = {}
        this.rewardShares = []
        this.recipientPublicKey = ''
        this.rewardSharePercentage = 0
        this.createRewardShareLoading = false
    }

    /*
<h2>Create reward shares</h2>
                <span><br>Creating a reward share for another account requires an account with level 5 or higher. If you are doing a self share (a reward share to your account) then put 0% for reward share percentage.</span>

                <paper-input label="Recipient public key" id="recipientPublicKey" type="text" value="${this.recipientPublicKey}"></paper-input>
                <paper-input label="Reward share percentage" id="percentageShare" type="number" value="${this.percentageShare}"></paper-input>

                <mwc-button @click=${this.createRewardShare} style="width:100%;">Create rewardshare key</mwc-button>
    */

    render() {
        return html`
            <div id="reward-share-page">
                <div style="min-height:48px; display: flex; padding-bottom: 6px;">
                    <h3 style="margin: 0; flex: 1; padding-top: 8px; display: inline;">Rewardshares involving this account</h3>
                    <mwc-button style="float:right;" @click=${() => this.shadowRoot.querySelector('#createRewardShareDialog').show()}><mwc-icon>add</mwc-icon>Create reward share</mwc-button>
                </div>

                <vaadin-grid id="accountRewardSharesGrid" style="height:auto;" ?hidden="${this.isEmptyArray(this.rewardShares)}" aria-label="Peers" .items="${this.rewardShares}" height-by-rows>
                    <vaadin-grid-column path="mintingAccount"></vaadin-grid-column>
                    <vaadin-grid-column width="7.8rem" flex-grow="0" path="sharePercent"></vaadin-grid-column>
                    <vaadin-grid-column path="recipient"></vaadin-grid-column>
                    <vaadin-grid-column path="rewardSharePublicKey"></vaadin-grid-column>
                </vaadin-grid>

                <mwc-dialog id="createRewardShareDialog" scrimClickAction="${this.createRewardShareLoading ? '' : 'close'}">
                    <div>Level 1 - 4 can create a Self Share and Level 5 or above can create a Reward Share!</div>
                    <br>
                    <mwc-textfield style="width:100%;" ?disabled="${this.createRewardShareLoading}" label="Recipient public key" id="recipientPublicKey"></mwc-textfield>
                    <p style="margin-bottom:0;">
                        Reward share percentage: ${this.rewardSharePercentage}
                        <!-- <mwc-textfield style="width:36px;" ?disabled="${this.createRewardShareLoading}" id="createRewardShare"></mwc-textfield> -->
                    </p>
                    <mwc-slider
                        @change="${e => this.rewardSharePercentage = this.shadowRoot.getElementById('rewardSharePercentageSlider').value}"
                        id="rewardSharePercentageSlider"
                        style="width:100%;"
                        step="1"
                        pin
                        markers
                        max="100"
                        value="${this.rewardSharePercentage}">
                    </mwc-slider>
                    <div style="text-align:right; height:36px;">
                        <span ?hidden="${!this.createRewardShareLoading}">
                            <!-- loading message -->
                            Doing something delicious &nbsp;
                            <paper-spinner-lite
                                style="margin-top:12px;"
                                ?active="${this.createRewardShareLoading}"
                                alt="Adding minting account"></paper-spinner-lite>
                        </span>
                        <span ?hidden=${this.message === ''} style="${this.error ? 'color:red;' : ''}">
                            ${this.message}
                        </span>
                    </div>
                    
                    <mwc-button
                        ?disabled="${this.createRewardShareLoading}"
                        slot="primaryAction"
                        @click=${this.createRewardShare}
                        >
                        <!--dialogAction="add"-->
                        Add
                    </mwc-button>
                    <mwc-button
                        ?disabled="${this.createRewardShareLoading}"
                        slot="secondaryAction"
                        dialogAction="cancel"
                        class="red">
                        Close
                    </mwc-button>
                </mwc-dialog>

                ${this.isEmptyArray(this.rewardShares) ? html`
                    Account is not involved in any reward shares
                `: ''}
            </div>
        `
    }

    firstUpdated() {
        const updateRewardshares = () => {
            console.log('=========================================')
            parentEpml.request('apiCall', {
                url: `/addresses/rewardshares?involving=${this.selectedAddress.address}`
            }).then(res => {

                this.rewardShares = []
                setTimeout(() => { this.rewardShares = res }, 1)
            })
            setTimeout(updateRewardshares, this.config.user.nodeSettings.pingInterval) //THOUGHTS: No config is definded, when then use it here....    // Perhaps should be slower...?
        }

        let configLoaded = false

        parentEpml.ready().then(() => {
            // Guess this is our version of state management...should make a plugin for it...proxied redux or whatever lol
            parentEpml.subscribe('selected_address', async selectedAddress => {
                this.selectedAddress = {}
                selectedAddress = JSON.parse(selectedAddress)
                if (!selectedAddress || Object.entries(selectedAddress).length === 0) return // Not ready yet ofc
                this.selectedAddress = selectedAddress
            })
            parentEpml.subscribe('config', c => {
                if (!configLoaded) {
                    setTimeout(updateRewardshares, 1)
                    configLoaded = true
                }
                this.config = JSON.parse(c)
            })
        })


        parentEpml.imReady()
    }

    async createRewardShare(e) {
        this.error = false
        this.message = ''
        const recipientPublicKey = this.shadowRoot.getElementById("recipientPublicKey").value
        const percentageShare = this.shadowRoot.getElementById("rewardSharePercentageSlider").value // or just this.rewardSharePercentage?
        // var fee = this.fee

        // Check for valid...^
        this.createRewardShareLoading = true

        const publicKeyToAddress = async (pubKey) => {
            let yourAddr = await parentEpml.request('apiCall', {
                type: 'api',
                url: `/addresses/convert/${pubKey}`
            })
            return yourAddr
        }

        // Get Last Ref
        const getLastRef = async () => {
            let myRef = await parentEpml.request('apiCall', {
                type: 'api',
                url: `/addresses/lastreference/${this.selectedAddress.address}`
            })
            return myRef
        };

        // Get Account Details
        const getAccountDetails = async () => {
            let myAccountDetails = await parentEpml.request('apiCall', {
                type: 'api',
                url: `/addresses/${this.selectedAddress.address}`
            })
            return myAccountDetails
        };

        // Get Reward Relationship if it already exists
        const getRewardShareRelationship = async (minterAddr, recipientPubKey) => {
            let yourAddr = await publicKeyToAddress(recipientPubKey)
            let isRewardShareExisting = false
            let myRewardShareArray = await parentEpml.request('apiCall', {
                type: 'api',
                url: `/addresses/rewardshares?minters=${minterAddr}&recipients=${yourAddr}`
            })

            isRewardShareExisting = myRewardShareArray.length !== 0 ? true : false
            return isRewardShareExisting

            // THOUGHTS: At this point, I think I dont wanna further do any check...
            // myRewardShareArray.forEach(rewsh => {
            //     if (rewsh.mintingAccount) {

            //     }
            // })

        }

        // Validate Reward Share by Level
        const validateReceiver = async () => {
            let accountDetails = await getAccountDetails();
            let lastRef = await getLastRef();

            // Check for creating self share at different levels (also adding check for flags...)
            if (accountDetails.flags === 1) {
                this.error = false
                this.message = ''
                let myTransaction = await makeTransactionRequest(lastRef)
                let isExisting = await getRewardShareRelationship(this.selectedAddress.address, recipientPublicKey)
                if (isExisting === true) {
                    this.error = true
                    this.message = `Cannot Create Multiple Reward Shares!`
                    console.log("Cannot create REWARD SHARE Transaction");
                } else {
                    // Send the transaction for confirmation by the user
                    this.error = false
                    this.message = ''
                    getTxnRequestResponse(myTransaction)
                }
            } else if (accountDetails.publicKey === recipientPublicKey) {
                if (accountDetails.level = 1 || accountDetails.level <= 4) {
                    this.error = false
                    this.message = ''
                    let myTransaction = await makeTransactionRequest(lastRef)
                    let isExisting = await getRewardShareRelationship(this.selectedAddress.address, recipientPublicKey)
                    if (isExisting === true) {
                        this.error = true
                        this.message = `Cannot Create Multiple Self Shares!`
                        console.log("Cannot create SELF SHARE Transaction");
                    } else {
                        // Send the transaction for confirmation by the user
                        this.error = false
                        this.message = ''
                        getTxnRequestResponse(myTransaction)
                    }

                } else {
                    this.error = true
                    this.message = `CANNOT CREATE SELF SHARE! at level ${accountDetails.level}`
                }
            } else { //Check for creating reward shares
                if (accountDetails.level >= 5) {
                    this.error = false
                    this.message = ''
                    let myTransaction = await makeTransactionRequest(lastRef)
                    let isExisting = await getRewardShareRelationship(this.selectedAddress.address, recipientPublicKey)
                    if (isExisting === true) {
                        this.error = true
                        this.message = `Cannot Create Multiple Reward Shares!`
                        console.log("Cannot create REWARD SHARE Transaction");
                    } else {
                        // Send the transaction for confirmation by the user
                        this.error = false
                        this.message = ''
                        getTxnRequestResponse(myTransaction)
                    }
                } else {
                    this.error = true
                    this.message = `CANNOT CREATE REWARD SHARE! at level ${accountDetails.level}`
                }
            }
        }

        // Make Transaction Request
        const makeTransactionRequest = async (lastRef) => {

            let mylastRef = lastRef

            let myTxnrequest = await parentEpml.request('transaction', {
                type: 38,
                nonce: this.selectedAddress.nonce,
                params: {
                    recipientPublicKey,
                    percentageShare,
                    lastReference: mylastRef,
                }
            })

            return myTxnrequest
        }

        // FAILED txnResponse = {success: false, message: "User declined transaction"}
        // SUCCESS txnResponse = { success: true, data: true }

        const getTxnRequestResponse = (txnResponse) => {

            if (txnResponse.success === false && txnResponse.message) {
                this.error = true
                this.message = txnResponse.message
                throw new Error(txnResponse)
            } else if (txnResponse.success === true && !txnResponse.data.error) {
                this.message = 'Reward Share Successful!'
                this.error = false
            } else {
                this.error = true
                this.message = txnResponse.data.message
                throw new Error(txnResponse)
            }
        }

        validateReceiver()

        this.createRewardShareLoading = false
    }

    isEmptyArray(arr) {
        if (!arr) { return true }
        return arr.length === 0
    }
}

window.customElements.define('reward-share', RewardShare)
