declare var pack
let div: HTMLDivElement, mainKey: string;
pack = {
  onInit: (key, divElement) => {
    div = divElement;
    mainKey = key;
  },
  onValue: val => {
    (<HTMLInputElement>div.firstChild).value = val;
  }
};
