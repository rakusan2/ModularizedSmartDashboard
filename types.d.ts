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
declare interface package {
  /** Runs when after module is initialized and before anything else */
  onInit?: (key: string, div: HTMLDivElement) => { name: string } | void;
  /** Runs on bots connection change */
  onConnect?: (status: boolean) => any;
  /** On Value change */
  onValue?: (val: any, key: string) => any;
  /** On Name change */
  onName?: (name: string) => any
  /** on key delete */
  onDelete?: (key: string) => any;
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
  force: string;
}

declare interface moduleOptions {
  name: string;
  version: string
  html?: string | string[];
  js?: string | string[];
  nodejs?: string
  css?: string | string[];
  keys?: moduleKeys;
  hideName?: boolean
  parent?: boolean | { type?: string, contains?: { [key: string]: { type?: string, val?: any } } }
  one: boolean
}
declare interface sentModule { loc: string, module: moduleOptions, shown?: visibleModule[] }
declare var pack: package