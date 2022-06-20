let template = require("./app-component.html").default;
let css = require ("./app-component.css").default;

import IndigoComponent from "../../../lib/indigo/indigo-component"
import Shop from "../../model/shop"
import Basket from "../../model/basket"

type AppState={shopLoaded: boolean, basketLoaded: boolean};
type Providers = {shop: Shop, basket: Basket};


export default class AppComponent extends IndigoComponent{
    css=css;

    loaded=false;

    providers: Providers = {
        shop: null as unknown as Shop,
        basket: null as unknown as Basket
    }

    state: AppState = {
        shopLoaded: false,
        basketLoaded: false
    }

    props = {}

    onCreate = () => {
        this.providers.shop = new Shop();
        this.providers.basket = new Basket(this.providers.shop, this.onBasketUpdate);
    }


    onMount=()=>{
        if(this.loaded) return;
        this.providers.shop.load().then(
            ()=> {
                this.providers.basket.load().then(
                    ()=> {
                        this.loaded=true;
                        this.setState({basketLoaded: true, shopLoaded: true})
                    }
                )
            }
        );
    }

    onBasketUpdate= ()=>{
        this.forceUpdate();
    }

    onDestoy=()=>{
    }

    getTemplate(){
        return template;
    }
}
