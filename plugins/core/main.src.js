import { parentEpml, visiblePluginEpml } from './connect.js'
import './streams/streams.js'

// Epml.registerProxyInstance(`core-plugin`, epmlInstance)
// const DHCP_PING_INTERVAL = 1000 * 60 * 10
const DHCP_PING_INTERVAL = 1000 * 10 // 10 seconds
let config = {}
let address
// protocol: 'http',
//     domain: '127.0.0.1',
//         port: 4999,
//             url: '/airdrop/',
//                 dhcpUrl: '/airdrop/ping/'

let haveRegisteredNodeManagement = false

const pingAirdropServer = () => {
    if (!address || !config.coin) return
    const node = config.coin.node.airdrop
    console.log("PING_AIRDROP_SERVER_NODE:  ==> ", node);
    const url = `${node.protocol}://${node.domain}:${node.port}${node.dhcpUrl}${address}`
    fetch(url).then(res => {/* console.log(res)*/ })
}

parentEpml.ready().then(() => {
    // THOUGHTS: The request to register urls should be made once...


    // pluginUrlsConf
    let pluginUrlsConf = [
        {
            url: 'wallet',
            domain: 'core',
            page: 'wallet/index.html',
            title: 'Wallet',
            // icon: 'credit_card',
            icon: 'account_balance_wallet',
            menus: [],
            parent: false
        },
        {
            url: 'send-money',
            domain: 'core',
            page: 'send-money/index.html',
            title: 'Send Money',
            icon: 'send',
            menus: [],
            parent: false
        },
        {
            url: 'reward-share',
            domain: 'core',
            page: 'reward-share/index.html',
            title: 'Reward Share',
            icon: 'call_split',
            menus: [],
            parent: false
        },
        {
            url: 'name-registration',
            domain: 'core',
            page: 'name-registration/index.html',
            title: 'Name Registration',
            icon: 'assignment_ind',
            menus: [],
            parent: false
        },
        {
            url: 'messaging',
            domain: 'core',
            page: 'messaging/index.html',
            title: 'Messaging',
            icon: 'message',
            menus: [
                {
                    url: 'chain-messaging',
                    domain: 'core',
                    page: 'messaging/chain-messaging/index.html',
                    title: 'Chain Messaging',
                    icon: 'toc',
                    menus: [],
                    parent: false
                },
                {
                    url: 'q-chat',
                    domain: 'core',
                    page: 'messaging/q-chat/index.html',
                    title: 'Q-Chat',
                    icon: 'toc',
                    menus: [],
                    parent: false
                }
            ],
            parent: false
        },
        {
            url: 'group-management',
            domain: 'core',
            page: 'group-management/index.html',
            title: 'Group Management',
            icon: 'group',
            menus: [
                {
                    url: 'group-transaction',
                    domain: 'core',
                    page: 'group-management/group-transaction/index.html',
                    title: 'Group Transaction',
                    icon: 'toc',
                    menus: [],
                    parent: false
                }
            ],
            parent: false
        }
    ]

    const registerPlugins = (pluginInfo) => {
        parentEpml.request('registerUrl', pluginInfo)
    }


    parentEpml.subscribe('config', c => {
        config = JSON.parse(c)

        pingAirdropServer()
        // Only register node management if node management is enabled and it hasn't already been registered
        if (!haveRegisteredNodeManagement && config.user.knownNodes[config.user.node].enableManagement) {
            haveRegisteredNodeManagement = true

            let nodeManagementConf = {
                url: 'node-management',
                domain: 'core',
                page: 'node-management/index.html',
                title: 'Node Management',
                icon: 'cloud',
                menus: [],
                parent: false
            }

            let _pluginUrlsConf = [...pluginUrlsConf, nodeManagementConf]
            registerPlugins(_pluginUrlsConf)
        } else {
            registerPlugins(pluginUrlsConf)
        }
    })

    parentEpml.subscribe('selected_address', addr => {
        // console.log('RECEIVED SELECTED ADDRESS STREAM')
        address = addr.address
        pingAirdropServer()
    })
})

setInterval(pingAirdropServer, DHCP_PING_INTERVAL)
