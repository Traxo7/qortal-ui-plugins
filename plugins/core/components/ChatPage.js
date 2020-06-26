import { LitElement, html, css } from 'lit-element'
import { Epml } from '../../../epml.js'

// Components
// import './ChatMessage.js'
import './TimeAgo.js'

import '@polymer/paper-spinner/paper-spinner-lite.js'

const parentEpml = new Epml({ type: 'WINDOW', source: window.parent })

class ChatPage extends LitElement {
    static get properties() {
        return {
            selectedAddress: { type: Object },
            config: { type: Object },
            messages: { type: Array },
            newMessages: { type: Array },
            chatId: { type: String },
            myAddress: { type: String },
            isReceipient: { type: Boolean },
            isLoading: { type: Boolean },
            sendTimestamp: { type: Number },
            oldChatHead: { type: Object },
            _publicKey: { type: String },
            accountInfo: { type: Object },
            balance: { type: Number },
            socketTimeout: { type: Number },
            messageSignature: { type: String }
        }
    }

    static get styles() {
        return css`
        ul {
            list-style: none;
            padding: 20px;
        }
        .chat-list {
            overflow-y: auto;
            height: 84vh;
            box-sizing: border-box;
        }
        .chat-message {
            padding: 10px;
            bottom: 0;
            position: absolute;
            display: inline-block;
            width: 100%;
            background-color: #eee;
            box-sizing: border-box;
        }

        .chat-message textarea {
            width: 80%;
            border: none;
            display: inline-block;
            font-size: 16px;
            padding: 10px 20px;
            border-radius: 5px;
            resize: none;
        }

        .chat-message button {
            float: right;
            color: #94c2ed;
            font-size: 16px;
            text-transform: uppercase;
            border: none;
            cursor: pointer;
            font-weight: bold;
            background: #f2f5f8;
            padding: 10px;
            margin-top: 4px;
            margin-right: 4px;
        }
        .chat-message button:hover {
            color: #75b1e8;
        }
        .message-data {
            margin-bottom: 15px;
        }

        .message-data-time {
            color: #a8aab1;
            font-size: 13px;
            padding-left: 6px;
        }

        .message {
            color: black;
            padding: 12px 10px;
            line-height: 19px;
            white-space: pre-wrap;
            white-space: break-spaces;
            word-wrap: break-word;
            -webkit-user-select: text;
            -moz-user-select: text;
            -ms-user-select: text;
            user-select: text;
            font-size: 16px;
            border-radius: 7px;
            margin-bottom: 20px;
            width: 90%;
            position: relative;
        }

        .message:after {
            bottom: 100%;
            left: 93%;
            border: solid transparent;
            content: " ";
            height: 0;
            width: 0;
            position: absolute;
            white-space: pre-line;
            word-wrap: break-word;
            pointer-events: none;
            border-bottom-color: #ddd;
            border-width: 10px;
            margin-left: -10px;
        }

        .my-message {
            background: #ddd;
            border: 2px #ccc solid;
        }

        .other-message {
            background: #f1f1f1;
            border: 2px solid #dedede;
        }

        .other-message:after {
            border-bottom-color: #f1f1f1;
            left: 7%;
        }

        .align-left {
            text-align: left;
        }

        .align-right {
            text-align: right;
        }

        .float-right {
            float: right;
        }

        .clearfix:after {
            visibility: hidden;
            display: block;
            font-size: 0;
            content: " ";
            clear: both;
            height: 0;
        }
        `
    }

    updated(changedProps) {
        // changedProps.forEach((OldProp, name) => {
        //     if (name === 'messages') {
        //         this.scrollDownPage()
        //     }

        //     // if (name === 'newMessages') {
        //     //     this.updateChatHistory(this.newMessages)
        //     // }
        // });
    }

    constructor() {
        super()
        this.selectedAddress = {}
        this.config = {
            user: {
                node: {

                }
            }
        }
        this.chatId = ''
        this.myAddress = ''
        this.messages = []
        this.oldChatHead = {}
        this.accountInfo = {
            names: [],
            addressInfo: {}
        }
        this.newMessages = []
        this._publicKey = ''
        this.messageSignature = ''
        this.balance = 1
        this.sendTimestamp = 0
        this.isReceipient = false
        this.isLoading = false
    }

    render() {

        // TODO: Build a nice preloader for loading messages...
        // TODO: DONE: Add a sendto name to message box..
        return html`
            <div>
                <ul class="chat-list clearfix">
                    ${html`${this.renderChatMessages(this.messages)}`}
                </ul>
                <div class="chat-message clearfix">
                    <textarea @keydown=${(e) => this._textArea(e)} ?disabled=${this.isLoading} id="messageBox" placeholder="Message${this.isReceipient === true ? ` ${this._chatId}` : '...'}" rows="1"></textarea>
                    <button ?disabled=${this.isLoading} @click=${() => this._sendMessage()} >${this.isLoading === false ? "Send" : html`<paper-spinner-lite active></paper-spinner-lite>`}</button>

                </div>
            </div>
        `
    }

    _renderChatMessages(messageObj) {

        return html`
            <li class="clearfix">
                <div class="message-data ${messageObj.sender === this.selectedAddress.address ? "align-right" : ""}">
                    <span class="message-data-name">${messageObj.senderName ? messageObj.senderName : messageObj.sender}</span>
                    <span class="message-data-time"><message-time timestamp=${messageObj.timestamp}></message-time></span>

                </div>
                <div class="message ${messageObj.sender === this.selectedAddress.address ? "my-message float-right" : "other-message"}">${messageObj.decodedMessage}</div>
            </li>
        `
    }

    _renderNewMessages(messageObj) {

        return `
            <li class="clearfix">
                <div class="message-data ${messageObj.sender === this.selectedAddress.address ? "align-right" : ""}">
                    <span class="message-data-name">${messageObj.senderName ? messageObj.senderName : messageObj.sender}</span>
                    <span class="message-data-time"><message-time timestamp=${messageObj.timestamp}></message-time></span>

                </div>
                <div class="message ${messageObj.sender === this.selectedAddress.address ? "my-message float-right" : "other-message"}">${messageObj.decodedMessage}</div>
            </li>
        `
    }

    renderChatMessages(messages) {

        return messages.map((eachMessage, index, msgArray) => {
            if (msgArray.length - 1 === index) {

                this.scrollDownPage()
                if (eachMessage.isText === true) {
                    this.messageSignature = eachMessage.signature
                    let _eachMessage = this.decodeMessage(eachMessage)
                    return html`${this._renderChatMessages(_eachMessage)}`
                }
            } else {
                if (eachMessage.isText === true) {
                    this.messageSignature = eachMessage.signature
                    let _eachMessage = this.decodeMessage(eachMessage)
                    return html`${this._renderChatMessages(_eachMessage)}`
                }
            }
        })
    }

    renderNewMessages(newMessages) {

        let eachMessage = newMessages[0]

        // newMessages.forEach(eachMessage => {
        if (this.messageSignature !== eachMessage.signature) {
            this.messageSignature = eachMessage.signature
            if (eachMessage.isText === true) {
                let _eachMessage = this.decodeMessage(eachMessage)
                this._updateChatHistory(_eachMessage)
            }
        }
        // })
    }

    _updateChatHistory(newMessage) {
        const ul = this.shadowRoot.querySelector('ul')
        const li = document.createElement('li')

        if (newMessage.sender) {

            li.innerHTML = this._renderNewMessages(newMessage)
            li.firstElementChild.firstElementChild.nextElementSibling.textContent = newMessage.decodedMessage
            ul.append(li)
            this.scrollDownPage()
        }

    }

    decodeMessage(encodedMessageObj) {
        let decodedMessageObj = {}

        if (this.isReceipient === true) {
            // direct chat

            if (encodedMessageObj.isEncrypted === true && this._publicKey !== false) {
                let decodedMessage = window.parent.decryptChatMessage(encodedMessageObj.data, window.parent.reduxStore.getState().app.selectedAddress.keyPair.privateKey, this._publicKey, encodedMessageObj.reference)
                decodedMessageObj = { ...encodedMessageObj, decodedMessage }
            } else if (encodedMessageObj.isEncrypted === false) {
                let bytesArray = window.parent.Base58.decode(encodedMessageObj.data)
                let decodedMessage = new TextDecoder('utf-8').decode(bytesArray)
                decodedMessageObj = { ...encodedMessageObj, decodedMessage }
            } else {
                decodedMessageObj = { ...encodedMessageObj, decodedMessage: "Cannot Decrypt Message!" }
            }

        } else {
            // group chat

            let bytesArray = window.parent.Base58.decode(encodedMessageObj.data)
            let decodedMessage = new TextDecoder('utf-8').decode(bytesArray)
            decodedMessageObj = { ...encodedMessageObj, decodedMessage }
        }

        return decodedMessageObj
    }


    async fetchChatMessages(chatId) {

        const initDirect = (cid) => {

            let initial = 0

            let directSocketTimeout

            let myNode = window.parent.reduxStore.getState().app.nodeConfig.knownNodes[window.parent.reduxStore.getState().app.nodeConfig.node]
            let nodeUrl = myNode.domain + ":" + myNode.port

            let directSocketLink

            if (window.parent.location.protocol === "https:") {

                directSocketLink = `wss://${nodeUrl}/websockets/chat/messages?involving=${window.parent.reduxStore.getState().app.selectedAddress.address}&involving=${cid}`;
            } else {

                // Fallback to http
                directSocketLink = `ws://${nodeUrl}/websockets/chat/messages?involving=${window.parent.reduxStore.getState().app.selectedAddress.address}&involving=${cid}`;
            }

            const directSocket = new WebSocket(directSocketLink);

            // Open Connection
            directSocket.onopen = () => {

                setTimeout(pingDirectSocket, 50)
            }

            // Message Event
            directSocket.onmessage = (e) => {

                if (initial === 0) {
                    this.messages = JSON.parse(e.data)
                    initial = initial + 1
                } else {
                    this.renderNewMessages(JSON.parse(e.data))
                }
            }

            // Closed Event
            directSocket.onclose = () => {
                clearTimeout(directSocketTimeout)
            }

            // Error Event
            directSocket.onerror = (e) => {
                clearTimeout(directSocketTimeout)
                console.log(`[DIRECT-SOCKET ==> ${cid}]: ${e.type}`);
            }

            const pingDirectSocket = () => {
                directSocket.send('ping')

                directSocketTimeout = setTimeout(pingDirectSocket, 295000)
            }

        };

        const initGroup = (gId) => {
            let groupId = Number(gId)

            let initial = 0

            let groupSocketTimeout

            let myNode = window.parent.reduxStore.getState().app.nodeConfig.knownNodes[window.parent.reduxStore.getState().app.nodeConfig.node]
            let nodeUrl = myNode.domain + ":" + myNode.port

            let groupSocketLink

            if (window.parent.location.protocol === "https:") {

                groupSocketLink = `wss://${nodeUrl}/websockets/chat/messages?txGroupId=${groupId}`;
            } else {

                // Fallback to http
                groupSocketLink = `ws://${nodeUrl}/websockets/chat/messages?txGroupId=${groupId}`;
            }

            const groupSocket = new WebSocket(groupSocketLink);

            // Open Connection
            groupSocket.onopen = () => {

                setTimeout(pingGroupSocket, 50)
            }

            // Message Event
            groupSocket.onmessage = (e) => {

                if (initial === 0) {
                    this.messages = JSON.parse(e.data)
                    initial = initial + 1
                } else {
                    this.renderNewMessages(JSON.parse(e.data))
                }
            }

            // Closed Event
            groupSocket.onclose = () => {
                clearTimeout(groupSocketTimeout)
            }

            // Error Event
            groupSocket.onerror = (e) => {
                clearTimeout(groupSocketTimeout)
                console.log(`[GROUP-SOCKET ==> ${groupId}]: ${e.type}`);
            }

            const pingGroupSocket = () => {
                groupSocket.send('ping')

                groupSocketTimeout = setTimeout(pingGroupSocket, 295000)
            }

        };


        if (chatId !== undefined) {

            if (this.isReceipient) {
                initDirect(chatId)
            } else {
                let groupChatId = Number(chatId)
                initGroup(groupChatId)
            }

        }

        // Add to the messages... TODO: Save messages to localstorage and fetch from it to make it persistent... 
    }

    _sendMessage() {

        this.isLoading = true
        const messageBox = this.shadowRoot.getElementById('messageBox')
        const messageText = messageBox.value

        if (/^\s*$/.test(messageText)) {

            this.isLoading = false
        } else if (messageText.length >= 256) {

            this.isLoading = false
            parentEpml.request('showSnackBar', "Maximum Characters per message is 255")
        } else {

            this.sendMessage()
        }
    }

    async sendMessage(e) {

        this.isLoading = true

        const messageBox = this.shadowRoot.getElementById('messageBox')
        const messageText = messageBox.value

        let _reference = new Uint8Array(64);
        window.crypto.getRandomValues(_reference);

        this.sendTimestamp = Date.now()

        let reference = window.parent.Base58.encode(_reference)

        const sendMessageRequest = async () => {


            if (this.isReceipient === true) {

                let chatResponse = await parentEpml.request('chat', {
                    type: 18,
                    nonce: this.selectedAddress.nonce,
                    params: {
                        timestamp: this.sendTimestamp,
                        recipient: this._chatId,
                        recipientPublicKey: this._publicKey,
                        message: messageText,
                        lastReference: reference,
                        proofOfWorkNonce: 0,
                        isEncrypted: 1,
                        isText: 1
                    }
                })

                _computePow(chatResponse)
            } else {
                let groupResponse = await parentEpml.request('chat', {
                    type: 181,
                    nonce: this.selectedAddress.nonce,
                    params: {
                        timestamp: this.sendTimestamp,
                        groupID: Number(this._chatId),
                        hasReceipient: 0,
                        message: messageText,
                        lastReference: reference,
                        proofOfWorkNonce: 0,
                        isEncrypted: 0,
                        isText: 1
                    }
                })

                _computePow(groupResponse)
            }

        }

        const _computePow = async (chatBytes) => {

            const _chatBytesArray = Object.keys(chatBytes).map(function (key) { return chatBytes[key]; });
            const chatBytesArray = new Uint8Array(_chatBytesArray);


            const chatBytesHash = new window.parent.Sha256().process(chatBytesArray).finish().result;

            const hashPtr = window.parent.sbrk(32, window.parent.heap);
            const hashAry = new Uint8Array(window.parent.memory.buffer, hashPtr, 32);
            hashAry.set(chatBytesHash);

            const difficulty = this.balance === 0 ? 14 : 8;

            const workBufferLength = 8 * 1024 * 1024;
            const workBufferPtr = window.parent.sbrk(workBufferLength, window.parent.heap);

            let nonce = window.parent.computePow(hashPtr, workBufferPtr, workBufferLength, difficulty);

            let _response = await parentEpml.request('sign_chat', {
                nonce: this.selectedAddress.nonce,
                chatBytesArray: chatBytesArray,
                chatNonce: nonce
            })

            getSendChatResponse(_response)

        }

        const getSendChatResponse = (response) => {

            if (response === true) {
                messageBox.value = ""
                this.scrollDownPage()
                this.isLoading = false
            } else if (response.error) {
                parentEpml.request('showSnackBar', response.message)
                this.isLoading = false
            } else {
                // DONE: Show a snackbar..
                parentEpml.request('showSnackBar', "Sending failed, Please retry...")
                this.isLoading = false
            }

        }

        // Exec..
        sendMessageRequest()
    }

    scrollDownPage() {
        const ul = this.shadowRoot.querySelector('ul')
        ul.scrollTop = ul.scrollHeight

        this.shadowRoot.getElementById('messageBox').focus()
    }

    _textArea(e) {

        if (e.keyCode === 13 && !e.shiftKey) this._sendMessage()
    }


    firstUpdated() {
        let configLoaded = false

        // TODO: Load and fetch messages from localstorage (maybe save messages to localstorage...)

        const getAddressPublicKey = () => {

            parentEpml.request('apiCall', {
                type: 'api',
                url: `/addresses/publickey/${this._chatId}`
            }).then(res => {
                this._publicKey = res

                if (res.error === 102) {
                    this._publicKey = false
                } else if (res !== false) {
                    this._publicKey = res
                } else {
                    this._publicKey = false
                }
            })
        };

        setTimeout(() => {
            this.chatId.includes('direct') === true ? this.isReceipient = true : this.isReceipient = false
            this._chatId = this.chatId.split('/')[1]

            this.fetchChatMessages(this._chatId)
            if (this.isReceipient) {
                getAddressPublicKey()
            }
        }, 100)

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
            parentEpml.request('getAccountInfo', null).then(res => {

                this.accountInfo = res
            })
            parentEpml.request('apiCall', {
                url: `/addresses/balance/${window.parent.reduxStore.getState().app.selectedAddress.address}`
            }).then(res => {
                this.balance = res
            })
        })

        parentEpml.imReady()
    }

    isEmptyArray(arr) {
        if (!arr) { return true }
        return arr.length === 0
    }

}

window.customElements.define('chat-page', ChatPage)
