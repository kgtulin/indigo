import Basket from "../../model/basket";
import IndigoComponent from "../../../lib/indigo/indigo-component";
import Ware from "../../model/ware";
import Shop from "../../model/shop";

let css = require("./ware-details-component.css").default;
let template =require("./ware-details-component.html").default;

type Props={shop:Shop; button:HTMLButtonElement}
type State={classes: { }, styles: {} }
type Consume={basket: Basket}

export default class WareDetailsComponent extends IndigoComponent{
    css=css;
    ware: Ware=null as unknown as Ware;

    consume: Consume = {basket: null as unknown as Basket}
    props: Props = {shop: null as unknown as Shop, button: null as unknown as HTMLButtonElement}
    state: State = {
        classes: {
            [css["hover"]]: false,
            [css["down"]]: false
        },
        styles: {
            textDecoration: "none",
            fontWeight: "normal"
        }
    }

    onCreate() {
        let url=new Map<string, string>();
        this.router.match("/ware/:id", url);
        let id=url.get("id") as string;
        this.ware=this.props.shop.getWareById(Number.parseInt(id));
    }

    onAddToBasket=()=>{
        this.props.button.disabled=true;
        this.consume.basket.addItem(this.ware).then((basket)=>{
            this.props.button.disabled=false;
        });
    }

    getTemplate(){
        return(template);
    }

    onMouseOverImage=()=>{
        this.setState({classes:{[css['hover']]:true}})
    }

    onMouseDownImage=()=>{
        this.setState({classes: {[css["down"]]: true}})
    }

    onMouseOutImage=()=>{
        this.setState({classes:{[css["hover"]]:false}})
    }

    onMouseUpImage=()=>{
        this.setState({classes: {[css['down']]:false}})
    }

    priceOver=()=>{
        this.setState({ styles:{
                textDecoration: "underline",
                fontWeight: "bold"
            }
        })
    }

    priceOut=()=> {
        this.setState({ styles:{
                textDecoration: "none",
                fontWeight: "normal"
            }
        })
    }
}
