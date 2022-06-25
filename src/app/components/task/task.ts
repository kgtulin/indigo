import IndigoComponent from "../../../lib/indigo/indigo-component";
let template = require("./task.html").default
let css = require("./task.css").default
import DataSource, {TaskItemData} from "../../model/data-source"


type State={important:boolean, done: boolean}
type Props={item: TaskItemData, dataSource: DataSource}

export default class Task extends IndigoComponent{

    css=css;

    state: State = {
        important: false,
        done: false
    }

    props: Props = {
        item: null as unknown as TaskItemData,
        dataSource: null as unknown as DataSource
    }

    onCreate(){
        this.setState({important:this.props.item.important, done:this.props.item.done})
    }

    toggleDone=(e:Event)=>{
        e.preventDefault();
        this.props.dataSource.updateItem(this.props.item.id, !this.props.item.done, this.props.item.important)
    }

    toggleImportant=(e: Event)=>{
        e.preventDefault();
        this.props.dataSource.updateItem(this.props.item.id, this.props.item.done, !this.props.item.important)
    }

    delete=(e:Event)=>{
        e.preventDefault();
        if(confirm("Действительно удалить задачу \""+this.props.item.title+"\""))
        this.props.dataSource.deleteItem(this.props.item.id);
    }

    getStyles=()=>{
        let result= {textDecoration:"none", fontWeight:"normal"};

        if(this.props.item.done)
            result.textDecoration="line-through";

        if(this.props.item.important)
            result.fontWeight="bold";

        return(result)
    }

    getTemplate(){
        return(template)
    }
}
