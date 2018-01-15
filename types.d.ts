declare type moduleKeys =
  | string
  | string[]
  | {
    [key: string]: {
      /** type of val assigned */
      type?: string;
      /** Value permanents assigned */
      permanent?: boolean;
    };
  };
declare interface modulePackage {
  /** Runs when after module is initialized and before anything else */
  onInit?: (keys: moduleKeys, div: HTMLDivElement, menu: { [key: string]: any }) => { name: string } | void;
  /** Runs on bots connection change */
  onConnect?: (status: boolean, address: string) => any;
  /** On Value change */
  onValue?: (val: any, key: string) => any;
  /** On Name change */
  onName?: (name: string) => any
  /** on key delete */
  onDelete?: (key: string) => any;
  /** On Message */
  onMessage?: (from: string, message: any, reply: (m: any) => any) => any
  /** On Broadcast Receive */
  onReceive?: (on: string, message: any) => any
  /** On Menu Input */
  onMenu?: (key: string, val: any) => any
}
declare interface packageCom {
  /**
   *  Send Message
   * @argument target The Name of the recipient
   * @argument message The message being sent
   *  */
  send(target: string, message: any): void
  /**
   * Broadcast Message
   * @argument name channel name
   * @argument message channel message
   */
  sendOn(name: string, message: any): void
  /** 
   * Update value
   * 
   * if key is absent than all keys will be updated
   * @argument val The new Value
   * @argument key The key being changed
   * @argument onError Callback Function with keys that caused an error and the reason */
  update(val: any, key: string, onError?: (key: string | string[], reason: string) => any): void
  update(val: any, onError?: (key: string | string[], reason: string) => any): void
  /** 
   * Delete a key from NetworkTables
   * 
   * If key is absent then all keys will be deleted
   *  */
  delete(key?: string, onError?: (key: string, reason: string) => any): void
  /** 
   * Asks for connection info
   *  */
  getConnectionStatus(): void
}
declare interface mainOptions {
  root: string;
  size: {
    height: number;
    width: number;
  };
  modules: mainOptionModule[];
}
declare interface mainOptionModule {
  dirName: string;
  name: string
  gitLoc?: string
  version?: string
  shown?: visibleModule[];
}
declare interface visibleModule {
  hideName: boolean
  name: string;
  key: moduleKeys;
  location: {
    x: number;
    y: number;
  };
  menu:{
    [key:string]:any
  }
  transmitters?:{
    [key:string]:string
  }
  receivers?:{
    [key:string]:string
  }
  force: boolean;
}

declare interface moduleOptions {
  /** Name of the Module as it will be displayed to the user */
  name: string;
  /** Version of the module */
  version: string
  /** Key or Keys required by the module */
  keys?: moduleKeys;
  /** The size of the rendered module */
  size?: {
    height: Number
    width: Number
  }
  /** The HTML file of the module */
  html?: string;
  /** The CSS file of the module */
  css?: string | string[]
  /** The JS file of the module */
  js?: string;
  /** Other JS files used by the module */
  jsLib?: string | string[]
  /** The JS file that will run in NodeJS */
  nodejs?: string
  /** The image displayed to the user in the menu */
  img?: string
  /** Do not add label next to the module */
  hideName?: boolean
  /** Allows a parent of keys to pe allocated */
  parent?: boolean | {
    /** Same as `contains: { "~type~" : { "val" : type } }` */
    type?: string,
    /** 
     * Specifies the keys that the parent needs to have.
     * These keys are relative to the parent
     * */
    contains?: {
      [key: string]: {
        type?: string,
        val?: any
      }
    }
  }
  /** The module can only be allocated once */
  one?: boolean
  /** The modules menu */
  menu?: {
    /** Menu Item Name */
    name: string
    /** Type of menu Item */
    type: string
    /** Value for menu Item */
    val?: any
    /** Default Value */
    default?: any
    /** Min Value if supported */
    min?: number
    /** Min Value if supported */
    max?: number
  }[]
  /** Module Communication */
  com?: {
    /** Channel Name */
    name?: string
    /** Is this a Transmit channel */
    send?: boolean
    /** Is it required */
    required?: boolean
  }[]
}
declare interface sentModule { loc: string, module: moduleOptions, shown?: visibleModule[] }
declare var pack: modulePackage

interface normalMessage {
  from: string,
  to: string,
  m: any
}
interface mainMessage {
  from: 'main',
  to: string,
  m: mainMessageTypes
}
interface updateMessage {
  type: 'update'
  key: string
  val: any
  flags: number
}
interface deleteMessage {
  type: 'delete'
  key: string
}
interface renameMessage {
  type: 'rename'
  newName: string
}
interface connectMessage {
  type: 'connect'
  connected: boolean
  address: string
}
interface initialMessage {
  type: 'init'
  keys: moduleKeys
  menu: { [key: string]: any }
}
interface broadcastMessage {
  type: 'broadcast'
  name: string
  m: any
}
declare type mainMessageTypes = updateMessage | deleteMessage | renameMessage | connectMessage | initialMessage | broadcastMessage
declare type sentMessage = mainMessage | normalMessage