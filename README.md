# Modulerized SmartDashboard

## Module
An isolate frame within the dashboard with code that may be give one or more keys depending on the users use case and the modules requirements

### Requirement
Each frame requires an [options.json](#options.json) file and an HTML file, JS file, or both.

[PUG](https://pugjs.org/api/getting-started.html) or [TS](https://www.typescriptlang.org/) files are also acceptable

### Keys
Keys come in the form of `"/SmartDashboard/SomeParent/SomeKey"`
This project than organizes it into a tree and presents it to the user to be assigned to modules

### Broadcast
The broadcast system consists of transmit and receive channels that are individually connected by the user.

Each module can have any number of these channels tho their names have to unique within that module.

These channels can be made a requirement which would postpone initialization of the module until they have been connected.

### No HTML
It is possible for a module to not have HTML

In this case the modules image will be used instead

### HTML 
Unless the HTML file contains a doctype, the entire contents will be placed in inside a `<div>` in the body of an `<iframe>`

### JS

The JS file will be placed inside of the body of the iframe and should be in the following format
```ts
pack = {
  /** Runs when after module is initialized and before anything else */
  onInit: (keys: string | string[], div: HTMLDivElement) =>{
      // keys - The full path of the keys assigned to the module instance
      // div - The container of the module instance
  };
  /** Runs on bots connection change or when requested */
  onConnect: (status: boolean, address: string) => {
      // status - True if Connected to the bot
      // address - The address of the bot
  };
  /** On Value change */
  onValue: (val: any, key: string) => {
      // val - The value of the key
      // key - The key with the updated value
  };
  /** On Name change */
  onName: (name: string) => {
      // name - The new name of the module instance
  }
  /** on key delete */
  onDelete: (key: string) => {
      // key - The deleted key
  };
  /** On Message from another module instance */
  onMessage: (from: string, message: any, reply: (message: any) => any) => {
      // from - The name of the module sending the message
      // message - The message that has been sent 
      //            This can be anything
      // reply - method for replying back
  }
  /** On Broadcast Receive */
  onReceive?: (on: string, message: any) => {
      // on - Channel name
      // message - Received message
  }
  /** On Menu Input */
  onMenu?: (key: string, val: any) => {
      // key - Key of Menu Item
      // val - New Value of Menu Item
  }
}
```
All of these methods are optional.

___

The module also has access to `com` for communicating with the main window
```ts
class com {
  /**
   *  Send Message
   * target - The Name of the recipient
   * message - The message being sent
   *  */
  send(target: string, message: any): void
  /**
   * Broadcast Message
   * name - channel name
   * message - channel message
   */
  sendOn(name: string, message: any): void
  /** 
   * Update value
   * 
   * if key is absent than all keys will be updated
   * val - The new Value
   * key - The key being changed
   * onError - Callback Function with keys that caused an error and the reason */
  update(val: any, key?: string, onError?: (key: string | string[], reason: string) => any): void
  update(val: any, onError: (key: string | string[], reason: string) => any): void
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
```

### options.json
The options file that is required by each module

The ? means that the key is optional
```ts
{
  /** Name of the Module as it will be displayed to the user */
  name: string
  /** Version of the module */
  version: string
  /** 
   * Key name blob or blobs required by the module
   * Keys not starting with / will have /SmartDashboard/ automaticaly added
   * "*" will be matched to all keys 
   * */
  keys?: string | string[] | {
    [key: string]: {
      /** type of val assigned */
      type?: string
      /** Value permanents assigned */
      permanent?: boolean
    }
  }
  /** The size of the rendered module */
  size?:{
    height:Number
    width:Number
  }
  /** The HTML file of the module */
  html?: string;
  /** The CSS file of the module */
  css?: string | string[]
  /** The JS file of the module */
  js?: string
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
```