import Indigo from "./indigo"

class Router{
    indigo: Indigo;
    constructor(indigo: Indigo) {
       this.indigo=indigo;
    }

    isMatch(url:string): boolean{

        return false;
    }

    route(url:string) {
    }

}
