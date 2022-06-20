let template = require("./shop-component.html").default;
let css =require("./shop-component.css").default;

import IndigoComponent from "../../../lib/indigo/indigo-component";
import Shop from "../../model/shop";
import Basket from "../../model/basket";

var dataPass=true;
type Props={shop: Shop}
type Consume = {basket: Basket}

export default class ShopComponent extends  IndigoComponent{
    css=css;

    consume: Consume={basket: null as unknown as Basket}

    props = {
        shop: null as unknown as Shop
    }

    getTemplate(){
        return template
    }
}
