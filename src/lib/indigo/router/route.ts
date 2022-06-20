import IndigoComponent from "../indigo-component";

type Props={url:string, title:string}

export default class Route extends  IndigoComponent{
    props= {url: "", title: ""}

    match = ()=> {
        let result = this.router.match(this.props.url);
        if(result) document.title=this.props.title;
        return(result);
    }

    getTemplate(){
        return `<i-if test="match()"><component-children></component-children></i-if>`;
    }
}
