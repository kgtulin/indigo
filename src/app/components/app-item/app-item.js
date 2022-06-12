import Indigo from "../../../lib/indigo/indigo"
var dataPass=true;

export default function AppItem(){return{
    data: {
        message: "App item",
        pass: false
    },
    template: require("./app-item.html").default,
    methods: {

        onToggleStructure: function(){
            this.data.pass=!this.data.pass;
        },
        onclick: function(){
            this.indigo.forceUpdate();
        }
    }
}}
