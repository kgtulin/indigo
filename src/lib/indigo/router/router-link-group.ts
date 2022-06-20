import IndigoComponent from "../indigo-component";

export default class RouterLinkGroup extends IndigoComponent{
    props = {
        normalClass: "",
        activeClass: "",
        hoverClass: "",
        visitedClass: ""
    }

    getTemplate(){
        return "<component-children></component-children>";
    }
}
