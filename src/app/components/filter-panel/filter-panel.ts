import IndigoComponent from "../../../lib/indigo/indigo-component";

let template=require("./filter-panel.html").default;
let css = require("./filter-panel.css").default;

type Props = {
    done: boolean,
    important: boolean,
    all:boolean
    text: string,
    changeText: Function,
    toggleDone: Function,
    toggleImportant: Function,
    input: HTMLInputElement
}

export default class FilterPanel extends IndigoComponent{
    props: Props = null as unknown as Props

    getTemplate(): string {
        return template;
    }

    getDoneStyle=()=>{
        if(this.props.done)
            return {backgroundColor:"blue"}
        else
            return {}
    }

    getImportantStyle=()=>{

        if(this.props.important)
            return {backgroundColor:"blue"}
        else
            return {}
    }

    getAllStyle=()=>{

        if(this.props.all)
            return {backgroundColor:"blue"}
        else
            return {}
    }

    changeText=()=>{
        this.props.changeText(this.props.input.value)
    }
}
