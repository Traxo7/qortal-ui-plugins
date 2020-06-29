(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
}((function () { 'use strict';

    const parentEpml = new Epml({
      type: 'WINDOW',
      source: window.parent
    });
    const visiblePluginEpml = new Epml({
      type: 'PROXY',
      source: {
        proxy: parentEpml,
        target: 'visible-plugin',
        id: 'core-plugin' // self id for responses, matches that in proxy.html

      }
    });

    let socketObject;
    let activeBlockSocketTimeout;
    let initial = 0;
    let closeGracefully = false;
    let isCalled = false;
    let retryOnClose = false;
    let blockFirstCall = true;
    let nodeStatusSocketObject;
    let nodeStatusSocketTimeout;
    let nodeStatusSocketcloseGracefully = false;
    let nodeStatusCount = 0;
    let nodeStatusRetryOnClose = false;
    let nodeStateCall = false;

    const doNodeInfo = async () => {
      const nodeInfo = await parentEpml.request('apiCall', {
        url: '/admin/info'
      });
      parentEpml.request('updateNodeInfo', nodeInfo);
    };

    let initStateCount = 0;
    let oldState;

    const closeSockets = () => {
      socketObject.close();
      closeGracefully = true;
      nodeStatusSocketObject.close();
      nodeStatusSocketcloseGracefully = true;
    };

    const startConfigWatcher = () => {
      parentEpml.ready().then(() => {
        parentEpml.subscribe('node_config', c => {
          if (initStateCount === 0) {
            let _oldState = JSON.parse(c);

            oldState = {
              node: _oldState.node,
              knownNodes: _oldState.knownNodes
            };
            initStateCount = initStateCount + 1;
            nodeStateCall = true;
            isCalled = true;
            socketObject !== undefined ? closeSockets() : undefined;
            nodeStatusSocketObject !== undefined ? closeSockets() : undefined;
            initNodeStatusCall(oldState);
            pingactiveBlockSocket(); // Call doNodeInfo

            doNodeInfo();
          }

          let _newState = JSON.parse(c);

          let newState = {
            node: _newState.node,
            knownNodes: _newState.knownNodes
          };

          if (window.parent._.isEqual(oldState, newState) === true) {
            return;
          } else {
            oldState = newState;
            nodeStateCall = true;
            isCalled = true;
            socketObject !== undefined ? closeSockets() : undefined;
            nodeStatusSocketObject !== undefined ? closeSockets() : undefined;
            initNodeStatusCall(newState);
            pingactiveBlockSocket(); // Call doNodeInfo

            doNodeInfo();
          }
        });
      });
      parentEpml.imReady();
    };

    const processBlock = blockObject => {
      parentEpml.request('updateBlockInfo', blockObject);
    };

    const doNodeStatus = async nodeStatusObject => {
      parentEpml.request('updateNodeStatus', nodeStatusObject);
    };

    const initNodeStatusCall = nodeConfig => {
      if (nodeConfig.node == 0) {
        pingNodeStatusSocket();
      } else if (nodeConfig.node == 1) {
        pingNodeStatusSocket();
      } else if (nodeStatusSocketObject !== undefined) {
        nodeStatusSocketObject.close();
        nodeStatusSocketcloseGracefully = true;
      }
    };

    const initBlockSocket = () => {
      let myNode = window.parent.reduxStore.getState().app.nodeConfig.knownNodes[window.parent.reduxStore.getState().app.nodeConfig.node];
      let nodeUrl = myNode.domain + ":" + myNode.port;
      let activeBlockSocketLink;

      if (window.parent.location.protocol === "https:") {
        activeBlockSocketLink = `wss://${nodeUrl}/websockets/blocks`;
      } else {
        activeBlockSocketLink = `ws://${nodeUrl}/websockets/blocks`;
      }

      const activeBlockSocket = new WebSocket(activeBlockSocketLink); // Open Connection

      activeBlockSocket.onopen = e => {
        console.log(`[SOCKET-BLOCKS]: Connected.`);
        closeGracefully = false;
        socketObject = activeBlockSocket;
        initial = initial + 1;
      }; // Message Event


      activeBlockSocket.onmessage = e => {
        processBlock(JSON.parse(e.data));
      }; // Closed Event


      activeBlockSocket.onclose = () => {
        console.log(`[SOCKET-BLOCKS]: CLOSED`);
        processBlock({});
        blockFirstCall = true;
        clearInterval(activeBlockSocketTimeout);

        if (closeGracefully === false && initial <= 52) {
          if (initial <= 52) {
            retryOnClose = true;
            setTimeout(pingactiveBlockSocket, 10000);
            initial = initial + 1;
          } else {
            // ... Stop retrying...
            retryOnClose = false;
          }
        }
      }; // Error Event


      activeBlockSocket.onerror = e => {
        console.log(`[SOCKET-BLOCKS]: ${e.type}`);
        blockFirstCall = true;
        processBlock({});
      };

      if (blockFirstCall) {
        parentEpml.request('apiCall', {
          url: '/blocks/last'
        }).then(res => {
          processBlock(res);
          blockFirstCall = false;
        });
      }
    };

    const pingactiveBlockSocket = () => {
      if (isCalled) {
        isCalled = false;
        initBlockSocket();
        activeBlockSocketTimeout = setTimeout(pingactiveBlockSocket, 295000);
      } else if (retryOnClose) {
        retryOnClose = false;
        clearTimeout(activeBlockSocketTimeout);
        initBlockSocket();
        isCalled = true;
        activeBlockSocketTimeout = setTimeout(pingactiveBlockSocket, 295000);
      } else {
        socketObject.send("non-integer ping");
        activeBlockSocketTimeout = setTimeout(pingactiveBlockSocket, 295000);
      }
    };

    const initNodeStatusSocket = () => {
      let myNode = window.parent.reduxStore.getState().app.nodeConfig.knownNodes[window.parent.reduxStore.getState().app.nodeConfig.node];
      let nodeUrl = myNode.domain + ":" + myNode.port;
      let activeNodeStatusSocketLink;

      if (window.parent.location.protocol === "https:") {
        activeNodeStatusSocketLink = `wss://${nodeUrl}/websockets/admin/status`;
      } else {
        activeNodeStatusSocketLink = `ws://${nodeUrl}/websockets/admin/status`;
      }

      const activeNodeStatusSocket = new WebSocket(activeNodeStatusSocketLink); // Open Connection

      activeNodeStatusSocket.onopen = e => {
        console.log(`[SOCKET-NODE-STATUS]: Connected.`);
        nodeStatusSocketcloseGracefully = false;
        nodeStatusSocketObject = activeNodeStatusSocket;
        nodeStatusCount = nodeStatusCount + 1;
      }; // Message Event


      activeNodeStatusSocket.onmessage = e => {
        doNodeStatus(JSON.parse(e.data));
      }; // Closed Event


      activeNodeStatusSocket.onclose = () => {
        console.log(`[SOCKET-NODE-STATUS]: CLOSED`);
        doNodeStatus({});
        clearInterval(nodeStatusSocketTimeout);

        if (nodeStatusSocketcloseGracefully === false && nodeStatusCount <= 52) {
          if (nodeStatusCount <= 52) {
            nodeStatusRetryOnClose = true;
            setTimeout(pingNodeStatusSocket, 10000);
            nodeStatusCount = nodeStatusCount + 1;
          } else {
            // ... Stop retrying...
            nodeStatusRetryOnClose = false;
          }
        }
      }; // Error Event


      activeNodeStatusSocket.onerror = e => {
        console.log(`[SOCKET-NODE-STATUS]: ${e.type}`);
        doNodeStatus({});
      };
    };

    const pingNodeStatusSocket = () => {
      if (nodeStateCall) {
        clearTimeout(nodeStatusSocketTimeout);
        initNodeStatusSocket();
        nodeStateCall = false;
        nodeStatusSocketTimeout = setTimeout(pingNodeStatusSocket, 295000);
      } else if (nodeStatusRetryOnClose) {
        nodeStatusRetryOnClose = false;
        clearTimeout(nodeStatusSocketTimeout);
        initNodeStatusSocket();
        nodeStatusSocketTimeout = setTimeout(pingNodeStatusSocket, 295000);
      } else {
        nodeStatusSocketObject.send("non-integer ping");
        nodeStatusSocketTimeout = setTimeout(pingNodeStatusSocket, 295000);
      }
    };

    // const txWatcher = new UnconfirmedTransactionWatcher()

    const setAccountInfo = async addr => {
      const names = await parentEpml.request('apiCall', {
        url: `/names/address/${addr}`
      });
      const addressInfo = await parentEpml.request('apiCall', {
        url: `/addresses/${addr}`
      });
      let accountInfo = {
        names: names,
        addressInfo: addressInfo
      };
      parentEpml.request('setAccountInfo', accountInfo);
    };

    const objectToArray = object => {
      let groupList = object.groups.map(group => group.groupId === 0 ? {
        groupId: group.groupId,
        url: `group/${group.groupId}`,
        groupName: "Qortal General Chat",
        sender: group.sender,
        senderName: group.senderName,
        timestamp: group.timestamp === undefined ? 1 : group.timestamp
      } : { ...group,
        url: `group/${group.groupId}`
      });
      let directList = object.direct.map(dc => {
        return { ...dc,
          url: `direct/${dc.address}`
        };
      });
      let chatHeadMasterList = [...groupList, ...directList];
      return chatHeadMasterList;
    };

    const sortActiveChat = (activeChatObject, localChatHeads) => {
      let oldChatHeads = JSON.parse(localChatHeads);

      if (window.parent._.isEqual(oldChatHeads, activeChatObject) === true) {
        return;
      } else {
        let oldActiveChats = objectToArray(oldChatHeads);
        let newActiveChats = objectToArray(activeChatObject);
        let results = newActiveChats.filter(newChat => {
          let value = oldActiveChats.some(oldChat => newChat.timestamp === oldChat.timestamp);
          return !value;
        });
        results.forEach(chat => {
          if (chat.sender !== window.parent.reduxStore.getState().app.selectedAddress.address) {
            if (chat.sender !== undefined) parentEpml.request('showNotification', chat);
          }
        });
      }
    };

    let initialChatWatch = 0;

    const chatHeadWatcher = activeChats => {
      let addr = window.parent.reduxStore.getState().app.selectedAddress.address;
      let key = `${addr.substr(0, 10)}_chat-heads`;

      try {
        let localChatHeads = localStorage.getItem(key);

        if (localChatHeads === null) {
          parentEpml.request('setLocalStorage', {
            key: key,
            dataObj: activeChats
          }).then(ms => {
            parentEpml.request('setChatHeads', activeChats).then(ret => {// ...
            });
          });
        } else {
          parentEpml.request('setLocalStorage', {
            key: key,
            dataObj: activeChats
          }).then(ms => {
            parentEpml.request('setChatHeads', activeChats).then(ret => {// ...
            });
          });

          if (initialChatWatch >= 1) {
            sortActiveChat(activeChats, localChatHeads);
          } else {
            initialChatWatch = initialChatWatch + 1;
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    //     return mostRecentBlock
    // })

    let socketObject$1;
    let activeChatSocketTimeout;
    let initial$1 = 0;
    let closeGracefully$1 = false;
    let onceLoggedIn = false;
    let retryOnClose$1 = false;
    parentEpml.subscribe('logged_in', async isLoggedIn => {
      const initChatHeadSocket = () => {
        let myNode = window.parent.reduxStore.getState().app.nodeConfig.knownNodes[window.parent.reduxStore.getState().app.nodeConfig.node];
        let nodeUrl = myNode.domain + ":" + myNode.port;
        let activeChatSocketLink;

        if (window.parent.location.protocol === "https:") {
          activeChatSocketLink = `wss://${nodeUrl}/websockets/chat/active/${window.parent.reduxStore.getState().app.selectedAddress.address}`;
        } else {
          activeChatSocketLink = `ws://${nodeUrl}/websockets/chat/active/${window.parent.reduxStore.getState().app.selectedAddress.address}`;
        }

        const activeChatSocket = new WebSocket(activeChatSocketLink); // Open Connection

        activeChatSocket.onopen = () => {
          console.log(`[SOCKET]: Connected.`);
          socketObject$1 = activeChatSocket;
          initial$1 = initial$1 + 1;
        }; // Message Event


        activeChatSocket.onmessage = e => {
          chatHeadWatcher(JSON.parse(e.data));
        }; // Closed Event


        activeChatSocket.onclose = () => {
          console.log(`[SOCKET]: CLOSED`);
          clearInterval(activeChatSocketTimeout);

          if (closeGracefully$1 === false && initial$1 <= 52) {
            if (initial$1 <= 52) {
              parentEpml.request('showSnackBar', "Connection to the Qortal Core was lost, is your Core running ?");
              retryOnClose$1 = true;
              setTimeout(pingActiveChatSocket, 10000);
              initial$1 = initial$1 + 1;
            } else {
              parentEpml.request('showSnackBar', "Cannot connect to the Qortal Core, restart UI and Core!");
            }
          }
        }; // Error Event


        activeChatSocket.onerror = e => {
          console.log(`[SOCKET]: ${e.type}`);
        };
      };

      const pingActiveChatSocket = () => {
        if (window.parent.reduxStore.getState().app.loggedIn === true) {
          if (!onceLoggedIn) {
            initChatHeadSocket();
            onceLoggedIn = true;
            activeChatSocketTimeout = setTimeout(pingActiveChatSocket, 295000);
          } else if (retryOnClose$1) {
            retryOnClose$1 = false;
            clearTimeout(activeChatSocketTimeout);
            initChatHeadSocket();
            onceLoggedIn = true;
            activeChatSocketTimeout = setTimeout(pingActiveChatSocket, 295000);
          } else {
            socketObject$1.send('ping');
            activeChatSocketTimeout = setTimeout(pingActiveChatSocket, 295000);
          }
        } else {
          if (onceLoggedIn && !closeGracefully$1) {
            closeGracefully$1 = true;
            socketObject$1.close();
            clearTimeout(activeChatSocketTimeout);
            onceLoggedIn = false;
          }
        }
      };

      if (isLoggedIn === 'true') {
        // console.log('"logged_in stream" in core/main.js', isLoggedIn)
        const addresses = await parentEpml.request('addresses'); // Call Set Account Info...

        setAccountInfo(window.parent.reduxStore.getState().app.selectedAddress.address); // Start Chat Watcher Socket

        pingActiveChatSocket(); // const parsedAddresses = addresses
        // addrWatcher.reset()
        // parsedAddresses.forEach(addr => addrWatcher.addAddress(addr))
        // txWatcher.reset()
        // parsedAddresses.forEach(addr => txWatcher.addAddress(addr))
      } else {
        if (onceLoggedIn) {
          closeGracefully$1 = true;
          socketObject$1.close();
          clearTimeout(activeChatSocketTimeout);
          onceLoggedIn = false;
        }

        initialChatWatch = 0;
      }
    }); // onNewBlock(async block => {
    //     mostRecentBlock = block
    //     blockStream.emit(block)
    //     addrWatcher.testBlock(block)
    // })
    // check()

    startConfigWatcher();

    // const DHCP_PING_INTERVAL = 1000 * 60 * 10

    const DHCP_PING_INTERVAL = 1000 * 10; // 10 seconds

    let config = {};
    let address; // protocol: 'http',
    //     domain: '127.0.0.1',
    //         port: 4999,
    //             url: '/airdrop/',
    //                 dhcpUrl: '/airdrop/ping/'

    let haveRegisteredNodeManagement = false;

    const pingAirdropServer = () => {
      if (!address || !config.coin) return;
      const node = config.coin.node.airdrop;
      console.log("PING_AIRDROP_SERVER_NODE:  ==> ", node);
      const url = `${node.protocol}://${node.domain}:${node.port}${node.dhcpUrl}${address}`;
      fetch(url).then(res => {
        /* console.log(res)*/
      });
    };

    parentEpml.ready().then(() => {
      // THOUGHTS: The request to register urls should be made once...
      // pluginUrlsConf
      let pluginUrlsConf = [{
        url: 'wallet',
        domain: 'core',
        page: 'wallet/index.html',
        title: 'Wallet',
        // icon: 'credit_card',
        icon: 'account_balance_wallet',
        menus: [],
        parent: false
      }, {
        url: 'send-money',
        domain: 'core',
        page: 'send-money/index.html',
        title: 'Send Money',
        icon: 'send',
        menus: [],
        parent: false
      }, {
        url: 'reward-share',
        domain: 'core',
        page: 'reward-share/index.html',
        title: 'Reward Share',
        icon: 'call_split',
        menus: [],
        parent: false
      }, {
        url: 'name-registration',
        domain: 'core',
        page: 'name-registration/index.html',
        title: 'Name Registration',
        icon: 'assignment_ind',
        menus: [],
        parent: false
      }, {
        url: 'messaging',
        domain: 'core',
        page: 'messaging/index.html',
        title: 'Messaging',
        icon: 'message',
        menus: [{
          url: 'chain-messaging',
          domain: 'core',
          page: 'messaging/chain-messaging/index.html',
          title: 'Chain Messaging',
          icon: 'toc',
          menus: [],
          parent: false
        }, {
          url: 'q-chat',
          domain: 'core',
          page: 'messaging/q-chat/index.html',
          title: 'Q-Chat',
          icon: 'toc',
          menus: [],
          parent: false
        }],
        parent: false
      }, {
        url: 'group-management',
        domain: 'core',
        page: 'group-management/index.html',
        title: 'Group Management',
        icon: 'group',
        menus: [{
          url: 'group-transaction',
          domain: 'core',
          page: 'group-management/group-transaction/index.html',
          title: 'Group Transaction',
          icon: 'toc',
          menus: [],
          parent: false
        }],
        parent: false
      }];

      const registerPlugins = pluginInfo => {
        parentEpml.request('registerUrl', pluginInfo);
      };

      parentEpml.subscribe('config', c => {
        config = JSON.parse(c);
        pingAirdropServer(); // Only register node management if node management is enabled and it hasn't already been registered

        if (!haveRegisteredNodeManagement && config.user.knownNodes[config.user.node].enableManagement) {
          haveRegisteredNodeManagement = true;
          let nodeManagementConf = {
            url: 'node-management',
            domain: 'core',
            page: 'node-management/index.html',
            title: 'Node Management',
            icon: 'cloud',
            menus: [],
            parent: false
          };
          let _pluginUrlsConf = [...pluginUrlsConf, nodeManagementConf];
          registerPlugins(_pluginUrlsConf);
        } else {
          registerPlugins(pluginUrlsConf);
        }
      });
      parentEpml.subscribe('selected_address', addr => {
        // console.log('RECEIVED SELECTED ADDRESS STREAM')
        address = addr.address;
        pingAirdropServer();
      });
    });
    setInterval(pingAirdropServer, DHCP_PING_INTERVAL);

})));
