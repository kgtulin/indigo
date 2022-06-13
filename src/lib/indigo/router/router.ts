import Indigo from "../indigo"

export default class Router{
    indigo: Indigo;

    constructor(indigo: Indigo) {
       this.indigo=indigo;

        window.addEventListener("popstate", (event)=>{
            this.navigate(document.location.pathname+document.location.search);
        });
    }


    match(url:string): Map<string, string> | null{

        let path=url.split("/");
        let currentPath=document.location.pathname.split("/");
        let extParams: Map<string, string> = new Map();

        if(path.length!=currentPath.length) return null;

        for(let i=0; i<path.length; i++){
            let item=path[i];
            let currentItem=currentPath[i];

            if(item.charAt(0)==":"){
                extParams.set(item.slice(1, item.length), currentItem);
            }
            else if(item!==currentItem){
                return null;
            }
        }

        return extParams;
    }

    
    navigate(url:string, title:string="") {
        window.history.pushState({}, "", url);
        document.title=title;
        this.indigo.forceUpdate();
    }
}
