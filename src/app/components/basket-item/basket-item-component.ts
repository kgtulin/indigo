import BasketItem from "../../model/basket-item";

let template = require("./basket-item-component.html").default;
let css = require ("./basket-item-component.css").default;

import Basket from "../../model/basket";
import IndigoComponent from "../../../lib/indigo/indigo-component";

type Props={basket:Basket, item: BasketItem, inputRef: HTMLInputElement, buttonRef: HTMLButtonElement};

export default class BasketItemComponent extends  IndigoComponent{

    css=css;

    props: Props = {
        basket:null as unknown as Basket,
        item:null as unknown as BasketItem,
        inputRef: null as unknown as HTMLInputElement,
        buttonRef: null as unknown as HTMLButtonElement
    }

    onCreate(){
    }

    onCountChange=()=>{
        this.props.inputRef.disabled=true;
        this.props.buttonRef.disabled=true;

        this.props.basket.setCount(this.props.item.id, Number.parseInt(this.props.inputRef.value)).then(()=>{

            this.props.buttonRef.disabled=false;
            this.props.inputRef.disabled=false;
        })
    }

    onDelete=() => {
        this.props.basket.deleteItem(this.props.item.id);
    }

    getTemplate(): string {
        return template;
    }
}
