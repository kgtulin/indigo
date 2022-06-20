import Indigo from "../indigo"
import Router from "./router"
import IndigoComponent from "../indigo-component";

type Props={url:string, title: string, link: HTMLElement, normalClass: string, activeClass:string, hoverClass:string, visitedClass: string};
type State={normalClass:string, activeClass:string, hoverClass: string}

export default class RouterLink extends IndigoComponent {
    props: Props = {
        url: "",
        title: "",
        link: null as unknown as HTMLElement,

        normalClass: "",
        activeClass: "",
        hoverClass: "",
        visitedClass: ""
    }

    state: State = {
        normalClass: "",
        activeClass: "",
        hoverClass: ""
    }

    onMount=()=> {
        /*
        if(!this.parent || this.parent.name.toLowerCase()!="router-link-group")
            throw Error("No router-link-block specified")
         */

        if(this.parent.name=="router-link-group"){
            this.setState({
                normalClass: (this.parent.props as any).normalClass,
                activeClass: (this.parent.props as any).activeClass,
                hoverClass: (this.parent.props as any).hoverClass
            })
        }
        else {
                this.setState({
                    normalClass: this.props.normalClass,
                    activeClass: this.props.activeClass,
                    hoverClass: this.props.hoverClass
                });

        }
        this.setClass();
    }

    onNavigate =(e: Event) => {
        e.preventDefault();
        this.router.navigate(this.props.url, this.props.title);
    }

    setClass = ()=>{
        if(this.router.match(this.props.url))
            this.props.link.className=this.state.activeClass;
        else
            this.props.link.className=this.state.normalClass;
    }

    onMouseOver=()=>{
        this.props.link.className=this.state.hoverClass;
    }

    getTemplate(){
        return `<a href="#" @mouseout="setClass" @mouseover="onMouseOver" #link title="{{props.title}}" @click="onNavigate"><component-children></component-children></a>`
    }

}
