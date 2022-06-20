import Indigo from "../indigo"

export default class Router{
    indigo: Indigo;

    constructor(indigo: Indigo) {
       this.indigo=indigo;

        window.addEventListener("popstate", (event)=>{
            this.navigate(document.location.pathname+document.location.search);
        });
    }


    match(url:string, result: Map<string, string> = null as unknown as Map<string, string>){

        let path=url.split("/");
        let currentPath=document.location.pathname.split("/");

        if(path.length!=currentPath.length) return false;

        for(let i=0; i<path.length; i++){
            let item=path[i];
            let currentItem=currentPath[i];

            if(item.charAt(0)==":"){
                if(result)
                    result.set(item.slice(1, item.length), currentItem);
            }
            else if(item!==currentItem){
                if(result) result.clear();
                return false;
            }
        }

        return true;
    }

    
    navigate(url:string, title:string="") {
        window.history.pushState({}, "", url);
        document.title=title;
        this.indigo.forceUpdate();
    }
}
