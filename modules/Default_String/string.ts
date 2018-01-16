/// <reference path="../../types.d.ts"/>
let div: HTMLDivElement, mainKey: string;
pack = {
  onInit: (key:string, divElement) => {
    div = divElement;
    mainKey = key;
  },
  onValue: val => {
    (<HTMLInputElement>div.firstChild).value = val;
    com.broadcast('Value',val)
  }
};
