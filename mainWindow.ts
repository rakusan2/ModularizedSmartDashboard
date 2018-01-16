import { ipcRenderer as ipc } from "electron";
let root = ""
let rootRegExp = /(.*)/
let removeRoot = (s: string) => s
let rootNode: ntNode = { name: "/", children: [] }

ipc.send("ready");

ipc.addListener('modules', (ev: Event, modules: sentModule[]) => {


})
ipc.addListener('options', (ev: Event, mesg: { root?: string }) => {
    if (typeof mesg.root === "string") {
        root = mesg.root
        rootRegExp = new RegExp(`${root}(.*)`)
        removeRoot = s => {
            let test = rootRegExp.exec(s)
            return (test == null ? s : test[1])
        }
    }
})
ipc.addListener('add', (ev: Event, mesg: ntMesg) => {
    updateNodeVal(mesg.key,mesg.val,mesg.flags)
})
ipc.addListener('delete', (ev: Event, mesg: ntMesg) => {
    travel(rootNode,mesg.key,(name,node)=>{
        if(name == "~type~"){
            delete node.type
        }else{
            let childIndex = firstChildLoc(node.children,name)
            if(childIndex>=0){
                node.children.splice(childIndex,1)
            }
        }
    })
    cleanNode(rootNode)
 })
ipc.addListener('update', (ev: Event, mesg: ntMesg) => {
    updateNodeVal(mesg.key,mesg.val,mesg.flags)
 })
ipc.addListener('flagChange', (ev: Event, mesg: ntMesg) => {
    travel(rootNode,mesg.key,(name,node)=>{
        if(name=="~type~")return
        let child = firstChild(node.children,name)
        if(child != undefined){
            child.flags = mesg.flags
        }
    })
 })

function updateNodeVal(key:string,val:any,flags:number){
    travel(rootNode, key, (name, node) => {
        if (name == "~type~") {
            node.type = val
        } else {
            let child = firstChild(node.children, name)
            if (child == undefined) {
                node.children.push({ name, val, children: [],flags })
            } else {
                child.val = val
                child.flags
            }
        }
    })
}

function travel(root: ntNode, fullPath: string, callback: (finName: string, finNode: ntNode) => any) {
    let path = fullPath.split('/')
    let traveler = root
    if (path.length <= 1) return
    for (let i = 1; i < path.length - 1; i++) {
        let child = firstChild(traveler.children, path[i])
        if (child == undefined) {
            child = { name: path[i], children: [] }
            traveler.children.push(child)
        }
        traveler = child
    }
    callback(path[path.length - 1], traveler)
}
function cleanNode(root:ntNode){
    if(root.children.length>0){
        for(let i=root.children.length-1;i>=0;i--){
            if(cleanNode(root.children[1])){
                root.children.splice(i,1)
            }
        }
    }
    if(root.children.length == 0 && !('val' in root && 'type' in root)){
        return true
    }
    return false
}

function firstChild(children: ntNode[], name: string) {
    for (let i = 0; i < children.length; i++) {
        if (children[i].name == name) return children[i]
    }
}
function firstChildLoc(children: ntNode[], name: string){
    for (let i = 0; i < children.length; i++) {
        if (children[i].name == name) return i
    }
    return -1
}

function addModule(name:string,html:string,css?:string[],js?:string[]){
    let frame = document.createElement('iframe')
    let head = document.createElement('head')
    let body = document.createElement('body')
    body.innerHTML = html
    frame.contentDocument.appendChild(body)
}

interface ntMesg {
    key: string
    val: any
    valType: String
    id: Number
    flags: number
}
interface ntNode {
    name: string
    val?: any
    type?: string
    children: ntNode[],
    flags?:number
}