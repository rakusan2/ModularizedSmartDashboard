import { ipcRenderer as ipc } from "electron";
ipc.send("ready");

ipc.addListener('modules',(ev:Event,modules:sentModule[])=>{
    
})