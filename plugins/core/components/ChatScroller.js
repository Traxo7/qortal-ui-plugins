import { LitElement, html, css } from 'lit-element'

class ChatScroller extends LitElement {
    static get properties() {
        return {
            getNewMessage: { attribute: false },
            getOldMessage: { attribute: false },
            initialMessages: { type: Array }, // First set of messages to load.. 15 messages max ( props )
            messages: { type: Array }
        }
    }

    static get styles() {
        return css`
        html {
            --scrollbarBG: #a1a1a1;
            --thumbBG: #6a6c75;
        }

        *::-webkit-scrollbar {
            width: 11px;
        }

        * {
            scrollbar-width: thin;
            scrollbar-color: var(--thumbBG) var(--scrollbarBG);
        }

        *::-webkit-scrollbar-track {
            background: var(--scrollbarBG);
        }

        *::-webkit-scrollbar-thumb {
            background-color: var(--thumbBG);
            border-radius: 6px;
            border: 3px solid var(--scrollbarBG);
        }
        ul {
            list-style: none;
            margin: 0;
            padding: 20px;
        }
        .chat-list {
            overflow-y: auto;
            height: 91vh;
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

        /* #upObserver {
            margin-top: 0px
        } */
        `
    }

    constructor() {
        super()

        this.messages = []
        this._upObserverhandler = this._upObserverhandler.bind(this)
        this.isLoading = false
        this.myAddress = window.parent.reduxStore.getState().app.selectedAddress.address
    }


    render() {

        return html`
                <ul id="viewElement" class="chat-list clearfix">
                    <div id="upObserver"></div>
                    ${html`${this.renderChatMessages(this.initialMessages)}`}
                    <div id="downObserver"></div>
                </ul>
        `
    }


    messageRow(messageObj) {

        return html`
            <li id=${messageObj.signature} class="clearfix">
                <div class="message-data ${messageObj.sender === this.myAddress ? "align-right" : ""}">
                    <span class="message-data-name">${messageObj.senderName ? messageObj.senderName : messageObj.sender}</span>
                    <span class="message-data-time"><message-time timestamp=${messageObj.timestamp}></message-time></span>

                </div>
                <div class="message ${messageObj.sender === this.myAddress ? "my-message float-right" : "other-message"}">${messageObj.decodedMessage}</div>
            </li>
        `
    }

    oldMessageRow(messageObj) {

        return `
            <li class="clearfix">
                <div class="message-data ${messageObj.sender === this.myAddress ? "align-right" : ""}">
                    <span class="message-data-name">${messageObj.senderName ? messageObj.senderName : messageObj.sender}</span>
                    <span class="message-data-time"><message-time timestamp=${messageObj.timestamp}></message-time></span>

                </div>
                <div id="messageContent" class="message ${messageObj.sender === this.myAddress ? "my-message float-right" : "other-message"}">${messageObj.decodedMessage}</div>
            </li>
        `
    }


    renderChatMessages(messages) {

        return messages.map((message) => {

            return html`${this.messageRow(message)}`;
        })
    }

    renderOldMessages(listOfOldMessages) {

        let { oldMessages, scrollElement } = listOfOldMessages

        const upObserver = this.shadowRoot.getElementById('upObserver');

        let _oldMessages = oldMessages.reverse();
        _oldMessages.forEach(oldMessage => {
            const li = document.createElement('li');
            li.innerHTML = this.oldMessageRow(oldMessage);
            li.id = oldMessage.signature
            li.firstElementChild.firstElementChild.nextElementSibling.textContent = oldMessage.decodedMessage;
            upObserver.after(li);
            scrollElement.scrollIntoView({ behavior: 'auto', block: 'center' });
        })
    }


    _getOldMessage(_scrollElement) {

        let listOfOldMessages = this.getOldMessage(_scrollElement)

        if (listOfOldMessages) {
            this.renderOldMessages(listOfOldMessages)
        }
    }

    _upObserverhandler(entries) {

        if (entries[0].isIntersecting) {
            let _scrollElement = entries[0].target.nextElementSibling

            this._getOldMessage(_scrollElement)
        }
    }

    upElementObserver() {
        const upObserver = this.shadowRoot.getElementById('upObserver');

        const options = {
            root: this.shadowRoot.getElementById('viewElement'),
            rootMargin: '0px',
            threshold: 1
        }
        const observer = new IntersectionObserver(this._upObserverhandler, options)
        observer.observe(upObserver)
    }


    firstUpdated() {

        // Intialize Observers
        this.upElementObserver()

        const viewElement = this.shadowRoot.getElementById('viewElement');
        viewElement.scrollTop = viewElement.scrollHeight + 50;
    }

}

window.customElements.define('chat-scroller', ChatScroller)

