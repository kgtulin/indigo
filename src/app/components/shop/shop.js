import Indigo from "../../../lib/indigo/indigo"
import template from "./shop.html"
var dataPass=true;

export default function Shop(){return{
    data: {
        message: "App item",
        pass: false,
        match: null
    },
    methods:{
        onCreate() {
            this.data.match = this.router.match("/shop/:id");
        },

        onDestroy() {
        },

        onMount(){
            this.header.textContent="Test #ref attributes";
        }
    },
    template: template,
}}
