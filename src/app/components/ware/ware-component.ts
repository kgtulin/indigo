import Basket from "../../model/basket";
import IndigoComponent from "../../../lib/indigo/indigo-component";
import Ware from "../../model/ware";

let css = require("./ware-component.css").default;
let template =require("./ware-component.html").default;

type Props={ware: Ware, button: HTMLButtonElement}
type State={style:{fontWeight: string, textDecoration: string}}
type Consume={basket: Basket}

export default class WareComponent extends  IndigoComponent{
    css=css;
    basket: Basket = null as unknown as any;

    consume: Consume = {
        basket: null as unknown as Basket
    }

    props: Props = {
        ware: null as unknown as Ware,
        button: null as unknown as HTMLButtonElement
    }

    state: State = {
        style: {fontWeight: "normal",
        textDecoration: "none"}
    }

    onCreate=()=>{

    }

    onAddToBasket=()=>{
        this.props.button.disabled=true;
         this.consume.basket.addItem(this.props.ware).then((basket)=>{
             this.props.button.disabled=false;
         });
    }

    onMouseOver=()=>{
        this.setState({
            style: {fontWeight:"bold", textDecoration: "underline"}
        })
    }

    onMouseOut=()=>{
        this.setState({
            style: {fontWeight:"normal", textDecoration: "none"}
        })
    }

    getTemplate(){
        return (template);
    }
}
