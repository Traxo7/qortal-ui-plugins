import { LitElement, html, css } from 'lit-element'
import { Epml } from '../../../epml.js'

// Components
// import './ChatMessage.js'
import './ChatScroller.js'
import './TimeAgo.js'

import '@polymer/paper-spinner/paper-spinner-lite.js'

const parentEpml = new Epml({ type: 'WINDOW', source: window.parent })

class ChatPage extends LitElement {
    static get properties() {
        return {
            selectedAddress: { type: Object },
            config: { type: Object },
            messages: { type: Array },
            _messages: { type: Array },
            newMessages: { type: Array },
            chatId: { type: String },
            myAddress: { type: String },
            isReceipient: { type: Boolean },
            isLoading: { type: Boolean },
            sendTimestamp: { type: Number },
            _publicKey: { type: Object },
            balance: { type: Number },
            socketTimeout: { type: Number },
            messageSignature: { type: String }, // maybe use this as an ID for each message, but also considering its length
            _initialMessages: { type: Array },
            isUserDown: { type: Boolean },
            isPasteMenuOpen: { type: Boolean }
        }
    }

    static get styles() {
        return css`

        html {
            scroll-behavior: smooth;
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
            overflow: auto;
            outline: none;
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

        /**
         * Bindings
         */
        // this.getNewMessage = this.getNewMessage.bind(this)
        this.getOldMessage = this.getOldMessage.bind(this)
        this._sendMessage = this._sendMessage.bind(this)
        this._downObserverhandler = this._downObserverhandler.bind(this)


        this.selectedAddress = {}
        this.chatId = ''
        this.myAddress = ''
        this.messages = []
        this._messages = []
        this.newMessages = []
        this._publicKey = { key: '', hasPubKey: false }
        this.messageSignature = ''
        this._initialMessages = []
        this.balance = 1
        this.sendTimestamp = 0
        this.isReceipient = false
        this.isLoadingMessages = true
        this.isLoading = false
        this.isUserDown = false
        this.isPasteMenuOpen = false
    }

    render() {

        // TODO: Build a nice preloader for loading messages...
        return html`
            ${this.isLoadingMessages ? html`<h1>Loading Messages...</h1>` : this.renderChatScroller(this._initialMessages)}

            <div class="chat-message clearfix">
                <textarea tabindex='1' ?autofocus=${true} @keydown=${(e) => this._textArea(e)} ?disabled=${this.isLoading || this.isLoadingMessages} id="messageBox" placeholder="Message${this.isReceipient === true ? ` ${this._chatId}` : '...'}" rows="1"></textarea>
                <button ?disabled=${this.isLoading || this.isLoadingMessages} @click=${() => this._sendMessage()} >${this.isLoading === false ? "Send" : html`<paper-spinner-lite active></paper-spinner-lite>`}</button>
            </div>
        `
    }

    renderChatScroller(initialMessages) {

        return html`<chat-scroller .initialMessages=${initialMessages} .getOldMessage=${this.getOldMessage} > </chat-scroller>`
    }

    getOldMessage(scrollElement) {

        if (this._messages.length <= 15 && this._messages.length >= 1) { // 15 is the default number of messages...

            let __msg = [...this._messages]
            this._messages = []

            return { oldMessages: __msg, scrollElement: scrollElement }
        } else if (this._messages.length > 15) {

            return { oldMessages: this._messages.splice(this._messages.length - 15), scrollElement: scrollElement }
        } else {

            return false
        }
    }

    processMessages(messages, isInitial) {

        if (isInitial) {

            this.messages = messages.map((eachMessage) => {

                if (eachMessage.isText === true) {
                    this.messageSignature = eachMessage.signature
                    let _eachMessage = this.decodeMessage(eachMessage)
                    return _eachMessage
                }
            })

            this._messages = [...this.messages]

            const adjustMessages = () => {

                let __msg = [...this._messages]
                this._messages = []
                this._initialMessages = __msg
            }

            // TODO: Determine number of initial messages by screen height...
            this._messages.length <= 15 ? adjustMessages() : this._initialMessages = this._messages.splice(this._messages.length - 15);

            this.isLoadingMessages = false
            setTimeout(() => this.downElementObserver(), 500)
        } else {

            let _newMessages = messages.map((eachMessage) => {

                if (eachMessage.isText === true) {
                    let _eachMessage = this.decodeMessage(eachMessage)

                    if (this.messageSignature !== eachMessage.signature) {

                        this.messageSignature = eachMessage.signature

                        // What are we waiting for, send in the message immediately...
                        this.renderNewMessage(_eachMessage)
                    }

                    return _eachMessage
                }
            })

            this.newMessages = this.newMessages.concat(_newMessages)

        }


    }

    /**
    * New Message Template implementation, takes in a message object.
    * @param { Object } messageObj
    * @property id or index
    * @property sender and other info..
    */

    newMessageRow(messageObj) {

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

    renderNewMessage(newMessage) {

        const viewElement = this.shadowRoot.querySelector('chat-scroller').shadowRoot.getElementById('viewElement')
        const downObserver = this.shadowRoot.querySelector('chat-scroller').shadowRoot.getElementById('downObserver')
        const li = document.createElement('li');
        li.innerHTML = this.newMessageRow(newMessage)
        li.id = newMessage.signature
        li.firstElementChild.firstElementChild.nextElementSibling.textContent = newMessage.decodedMessage;

        if (newMessage.sender === this.selectedAddress.address) {

            viewElement.insertBefore(li, downObserver)
            viewElement.scrollTop = viewElement.scrollHeight
        } else {

            viewElement.insertBefore(li, downObserver)
        }
    }

    /**
     *  Decode Message Method. Takes in a message object and returns a decoded message object
     * @param {Object} encodedMessageObj 
     * 
     */

    decodeMessage(encodedMessageObj) {
        let decodedMessageObj = {}

        if (this.isReceipient === true) {
            // direct chat

            if (encodedMessageObj.isEncrypted === true && this._publicKey.hasPubKey === true) {

                let decodedMessage = window.parent.decryptChatMessage(encodedMessageObj.data, window.parent.reduxStore.getState().app.selectedAddress.keyPair.privateKey, this._publicKey.key, encodedMessageObj.reference)
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

                    this.isLoadingMessages = true
                    this.processMessages(JSON.parse(e.data), true)
                    initial = initial + 1
                } else {

                    this.processMessages(JSON.parse(e.data), false)
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

                    this.isLoadingMessages = true
                    this.processMessages(JSON.parse(e.data), true)
                    initial = initial + 1
                } else {

                    this.processMessages(JSON.parse(e.data), false)
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

            this.sendMessage(messageBox, messageText)
        }
    }

    async sendMessage(messageBox, messageText) {

        this.isLoading = true

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
                        recipientPublicKey: this._publicKey.key,
                        message: messageText,
                        lastReference: reference,
                        proofOfWorkNonce: 0,
                        isEncrypted: this._publicKey.hasPubKey === false ? 0 : 1,
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
                        isEncrypted: 0, // Set default to be not encrypted for groups
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
                this.isLoading = false
                // messageBox.focus()
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


    /**
     *  _textArea Method gets called whenver a user presses a key in the textarea
     * @param {Event} e - where e is the event object
     */

    _textArea(e) {

        if (e.keyCode === 13 && !e.shiftKey) this._sendMessage()
    }


    /**
     * Method to set if the user's location is down in the chat
     * @param { Boolean } isDown 
     */

    setIsUserDown(isDown) {

        this.isUserDown = isDown
        // console.log(this.isUserDown);
    }

    _downObserverhandler(entries) {

        if (entries[0].isIntersecting) {

            this.setIsUserDown(true)
        } else {

            this.setIsUserDown(false)
        }
    }

    downElementObserver() {
        const downObserver = this.shadowRoot.querySelector('chat-scroller').shadowRoot.getElementById('downObserver')

        const options = {
            root: this.shadowRoot.getElementById('viewElement'),
            rootMargin: '500px',
            threshold: 1
        }
        const observer = new IntersectionObserver(this._downObserverhandler, options)
        observer.observe(downObserver)
    }


    firstUpdated() {

        // TODO: Load and fetch messages from localstorage (maybe save messages to localstorage...)

        const textarea = this.shadowRoot.getElementById('messageBox')

        document.onkeypress = (e) => {

            if (textarea.matches(':focus')) {
                // ...
            } else {
                textarea.focus()
            }
        }

        const getAddressPublicKey = () => {

            parentEpml.request('apiCall', {
                type: 'api',
                url: `/addresses/publickey/${this._chatId}`
            }).then(res => {

                if (res.error === 102) {

                    this._publicKey.key = ''
                    this._publicKey.hasPubKey = false
                    this.fetchChatMessages(this._chatId)
                } else if (res !== false) {

                    this._publicKey.key = res
                    this._publicKey.hasPubKey = true
                    this.fetchChatMessages(this._chatId)
                } else {

                    this._publicKey.key = ''
                    this._publicKey.hasPubKey = false
                    this.fetchChatMessages(this._chatId)
                }
            })
        };

        setTimeout(() => {
            this.chatId.includes('direct') === true ? this.isReceipient = true : this.isReceipient = false
            this._chatId = this.chatId.split('/')[1]

            if (this.isReceipient) {
                getAddressPublicKey()
            } else {

                this.fetchChatMessages(this._chatId)
            }

        }, 100)

        parentEpml.ready().then(() => {
            parentEpml.subscribe('selected_address', async selectedAddress => {
                this.selectedAddress = {}
                selectedAddress = JSON.parse(selectedAddress)
                if (!selectedAddress || Object.entries(selectedAddress).length === 0) return
                this.selectedAddress = selectedAddress
            })
            parentEpml.request('apiCall', {
                url: `/addresses/balance/${window.parent.reduxStore.getState().app.selectedAddress.address}`
            }).then(res => {
                this.balance = res
            })
            parentEpml.subscribe('frame_paste_menu_switch', async res => {

                res = JSON.parse(res)
                if (res.isOpen === false && this.isPasteMenuOpen === true) {

                    this.pasteToTextBox(textarea)
                    this.isPasteMenuOpen = false
                }
            })
        })

        parentEpml.imReady()

        textarea.addEventListener('contextmenu', (event) => {

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

                    this.pasteMenu(event)
                    this.isPasteMenuOpen = true

                    // Prevent Default and Stop Event Bubbling
                    event.preventDefault()
                    event.stopPropagation()

                }
            }

            checkSelectedTextAndShowMenu()

        })
    }

    pasteToTextBox(textarea) {

        // Return focus to the window
        window.focus()

        navigator.clipboard.readText().then(clipboardText => {

            textarea.value += clipboardText
            textarea.focus()
        });
    }

    pasteMenu(event) {

        let eventObject = { pageX: event.pageX, pageY: event.pageY, clientX: event.clientX, clientY: event.clientY }
        parentEpml.request('openFramePasteMenu', eventObject)
    }

    isEmptyArray(arr) {
        if (!arr) { return true }
        return arr.length === 0
    }

}

window.customElements.define('chat-page', ChatPage)
