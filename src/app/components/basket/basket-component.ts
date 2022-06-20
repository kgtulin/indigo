import IndigoComponent from "../../../lib/indigo/indigo-component";

let template = require("./basket-component.html").default;
let css = require ("./basket-component.css").default;
import Basket from "../../model/basket";

type Props={basket: Basket};

export default class BasketComponent extends IndigoComponent{
    css=css
    state= {};
    props: Props = {
        basket: null as unknown as Basket
    }

    onModify=() =>{
        this.props.basket.update();
    }

    getTemplate(){
        return(template);
    }
}
