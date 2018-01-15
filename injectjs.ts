function addModule(name: string, callback: (pack: modulePackage, com: packageCom) => any) {
    let pack: modulePackage = {}
    function sendMessage(name: string, m: any) {
        parent.window.postMessage({ from: name, to: name, m }, '*')
    }
    callback(pack, {
        send: sendMessage,
        sendOn: (name, message) => {
            sendMessage('main', { type: 'broadcast', name, m: message })
        },
        update: (val: any, key?: string | ((key: string | string[], reason: string) => any), onError?: (key: string | string[], reason: string) => any) => {
            if (typeof key === 'string') {
                sendMessage('main', { type: 'update', key, val })
            } else {
                sendMessage('main', { type: 'update', val })
            }
        },
        delete: (key, onError) => {
            sendMessage('main', { type: 'delete', key })
        },
        getConnectionStatus: () => {
            sendMessage('main', { type: 'connect' })
        }
    })
    window.addEventListener('message', function (ev) {
        let message = ev.data as sentMessage
        if (!('to' in message) || message.to != name) return
        if (message.from != 'main' && pack.onMessage != undefined) {
            pack.onMessage(message.from, message.m, (m) => {
                ev.source.postMessage({ from: name, to: message.to }, "*")
            })
        } else if (message.from == 'main') {
            let mesg = message.m as mainMessageTypes
            switch (mesg.type) {
                case 'update': {
                    if (pack.onValue != undefined)
                        pack.onValue(mesg.val, mesg.key)
                    break;
                }
                case 'delete': {
                    if (pack.onDelete != undefined)
                        pack.onDelete(mesg.key)
                    break;
                }
                case 'rename': {
                    if (pack.onName != undefined)
                        pack.onName(mesg.newName)
                    break;
                }
                case 'connect': {
                    if (pack.onConnect != undefined)
                        pack.onConnect(mesg.connected, mesg.address)
                    break;
                }
                case 'broadcast': {
                    if (pack.onReceive != undefined)
                        pack.onReceive(mesg.name, mesg.m)
                    break;
                }
                case 'init': {
                    if (pack.onInit != undefined)
                        pack.onInit(mesg.keys, document.getElementById('main') as HTMLDivElement, mesg.menu)
                }
            }
        }
    })

    sendMessage('main', { registered: name })
}