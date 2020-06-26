import { parentEpml } from '../connect.js'
import { EpmlStream } from 'epml'


let nodeStatusSocketObject
let nodeStatusSocketTimeout
let nodeStatusSocketcloseGracefully = false
let nodeStatusCount = 0
let nodeStatusRetryOnClose = false
let nodeStateCall = false


const doNodeInfo = async () => {

    const nodeInfo = await parentEpml.request('apiCall', {
        url: '/admin/info'
    })

    parentEpml.request('updateNodeInfo', nodeInfo)
}

// Call doNodeInfo
doNodeInfo()


export const startConfigWatcher = () => {

    parentEpml.ready().then(() => {
        parentEpml.subscribe('node_config', c => {

            nodeStateCall = true
            initNodeStatusCall(JSON.parse(c))
        })
    })

    parentEpml.imReady()
}

const processBlock = (blockObject) => {

    parentEpml.request('updateBlockInfo', blockObject)
}

const doNodeStatus = async (nodeStatusObject) => {

    parentEpml.request('updateNodeStatus', nodeStatusObject)
}


const initNodeStatusCall = (nodeConfig) => {

    if (nodeConfig.node === 0 || nodeConfig.node === 1) {
        pingNodeStatusSocket()
    } else if (nodeStatusSocketObject !== undefined) {
        nodeStatusSocketObject.close()
    }
}


let socketObject
let activeBlockSocketTimeout
let initial = 0
let closeGracefully = false
let isCalled = false
let retryOnClose = false
let blockFirstCall = true


const initBlockSocket = () => {

    let myNode = window.parent.reduxStore.getState().app.nodeConfig.knownNodes[window.parent.reduxStore.getState().app.nodeConfig.node]
    let nodeUrl = myNode.domain + ":" + myNode.port

    let activeBlockSocketLink

    if (window.parent.location.protocol === "https:") {

        activeBlockSocketLink = `wss://${nodeUrl}/websockets/blocks`;
    } else {

        activeBlockSocketLink = `ws://${nodeUrl}/websockets/blocks`;
    }

    const activeBlockSocket = new WebSocket(activeBlockSocketLink);

    // Open Connection
    activeBlockSocket.onopen = (e) => {

        console.log(`[SOCKET-BLOCKS]: Connected.`);
        socketObject = activeBlockSocket

        initial = initial + 1
    }

    // Message Event
    activeBlockSocket.onmessage = (e) => {

        processBlock(JSON.parse(e.data))
    }

    // Closed Event
    activeBlockSocket.onclose = () => {

        console.log(`[SOCKET-BLOCKS]: CLOSED`);
        clearInterval(activeBlockSocketTimeout)

        if (closeGracefully === false && initial <= 52) {

            if (initial <= 52) {

                retryOnClose = true
                setTimeout(pingactiveBlockSocket, 10000)
                initial = initial + 1
            } else {

                // ... Stop retrying...
                retryOnClose = false
            }
        }
    }

    // Error Event
    activeBlockSocket.onerror = (e) => {

        console.log(`[SOCKET-BLOCKS]: ${e.type}`);
    }

    if (blockFirstCall) {

        parentEpml.request('apiCall', {
            url: '/blocks/last'
        }).then(res => {

            processBlock(res)
            blockFirstCall = false
        })
    }
}


export const pingactiveBlockSocket = () => {


    if (!isCalled) {

        initBlockSocket()
        isCalled = true
        activeBlockSocketTimeout = setTimeout(pingactiveBlockSocket, 295000)
    } else if (retryOnClose) {

        retryOnClose = false
        clearTimeout(activeBlockSocketTimeout)
        initBlockSocket()
        isCalled = true
        activeBlockSocketTimeout = setTimeout(pingactiveBlockSocket, 295000)
    } else {

        socketObject.send("non-integer ping")
        activeBlockSocketTimeout = setTimeout(pingactiveBlockSocket, 295000)
    }
}


const initNodeStatusSocket = () => {

    let myNode = window.parent.reduxStore.getState().app.nodeConfig.knownNodes[window.parent.reduxStore.getState().app.nodeConfig.node]
    let nodeUrl = myNode.domain + ":" + myNode.port

    let activeNodeStatusSocketLink

    if (window.parent.location.protocol === "https:") {

        activeNodeStatusSocketLink = `wss://${nodeUrl}/websockets/admin/status`;
    } else {

        activeNodeStatusSocketLink = `ws://${nodeUrl}/websockets/admin/status`;
    }

    const activeNodeStatusSocket = new WebSocket(activeNodeStatusSocketLink);

    // Open Connection
    activeNodeStatusSocket.onopen = (e) => {

        console.log(`[SOCKET-NODE-STATUS]: Connected.`);
        nodeStatusSocketObject = activeNodeStatusSocket

        nodeStatusCount = nodeStatusCount + 1
    }

    // Message Event
    activeNodeStatusSocket.onmessage = (e) => {

        doNodeStatus(JSON.parse(e.data))
    }

    // Closed Event
    activeNodeStatusSocket.onclose = () => {

        console.log(`[SOCKET-NODE-STATUS]: CLOSED`);
        clearInterval(nodeStatusSocketTimeout)

        if (nodeStatusSocketcloseGracefully === false && nodeStatusCount <= 52) {

            if (nodeStatusCount <= 52) {

                nodeStatusRetryOnClose = true
                setTimeout(pingNodeStatusSocket, 10000)
                nodeStatusCount = nodeStatusCount + 1
            } else {

                // ... Stop retrying...
                nodeStatusRetryOnClose = false
            }
        }
    }

    // Error Event
    activeNodeStatusSocket.onerror = (e) => {

        console.log(`[SOCKET-NODE-STATUS]: ${e.type}`);
    }
}


const pingNodeStatusSocket = () => {

    if (nodeStateCall) {

        clearTimeout(nodeStatusSocketTimeout)
        initNodeStatusSocket()
        nodeStateCall = false
        nodeStatusSocketTimeout = setTimeout(pingNodeStatusSocket, 295000)
    } else if (nodeStatusRetryOnClose) {

        nodeStatusRetryOnClose = false
        clearTimeout(nodeStatusSocketTimeout)
        initNodeStatusSocket()
        nodeStatusSocketTimeout = setTimeout(pingNodeStatusSocket, 295000)
    } else {

        nodeStatusSocketObject.send("non-integer ping")
        nodeStatusSocketTimeout = setTimeout(pingNodeStatusSocket, 295000)
    }
}
