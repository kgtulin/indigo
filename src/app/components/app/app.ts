import IndigoComponent from "../../../lib/indigo/indigo-component";
import DataSource from "../../model/data-source";
import {TaskItemData} from "../../model/data-source";

let template=require("./app.html").default;
let css=require("./app.css").default;

type State={filter:string, important:boolean, done:boolean, loading: boolean, all:boolean}
type TSummary={total:number, done: number, important:number}

export default class App extends IndigoComponent{
    dataSource: DataSource = null as unknown as DataSource;
    summary: TSummary = null as unknown as TSummary;
    currentItems=Array<TaskItemData>();

    state: State = {
        filter: "",
        important: false,
        done: false,
        loading: true,
        all: true
    }

    onCreate(){
        this.dataSource=new DataSource(this.onChange);
    }

    onBeforeMount() {
        this.currentItems=this.dataSource.getItems(this.state.done, this.state.important, this.state.filter);
        this.summary=this.dataSource.getSummary();
    }

    onMount(){
        this.setState({loading:true})
        this.dataSource.load().then (()=> {
            this.currentItems=this.dataSource.getItems(this.state.done, this.state.important, this.state.filter);
            this.setState({loading: false});
        })
    }

    onChange=()=>{
        this.forceUpdate();
    }

    changeFilter=(filter:string)=>{
        this.setState({filter:filter});
    }

    toggleDone=()=>{
        if(this.state.done==false) {
            this.setState({done: !this.state.done, all:false});
        }
        else {
            if (this.state.important == false) {
                this.setState({done: !this.state.done, all: true});
                return;
            }

            this.setState({done: !this.state.done, all:false});
        }
    }


    toggleAll=()=>{
        if(this.state.all==false)
            this.setState({all:true, done:false, important:false});
    }

    toggleImportant=()=>{

        if(this.state.important==false)
            this.setState({important:!this.state.important, all:false});
        else {
            if (this.state.done == false) {
                this.setState({important: !this.state.important, all: true});
                return;
            }
            this.setState({important: !this.state.important, all: false});
        }
    }

    getTemplate(): string {
        return template;
    }

}
