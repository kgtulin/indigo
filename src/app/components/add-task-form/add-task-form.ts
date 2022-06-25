import IndigoComponent from "../../../lib/indigo/indigo-component";
import DataSource from "../../model/data-source";

let template=require("./add-task-form.html").default
let css=require("./add-task-form.css").default

type Props={dataSource: DataSource, input: HTMLInputElement}

export default class AddTaskForm extends IndigoComponent{
    css=css;

    props: Props=null as unknown as Props;

    onAddItem=()=>{
        this.props.dataSource.addItem(this.props.input.value);
    }


    getTemplate(){
        return template
    }
}
