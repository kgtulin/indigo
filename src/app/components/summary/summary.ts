import IndigoComponent from "../../../lib/indigo/indigo-component";

let template=require("./summary.html").default;
let css = require("./summary.css").default;

export default class Summary extends IndigoComponent {

    getTemplate(){
        return template;
    }
}
