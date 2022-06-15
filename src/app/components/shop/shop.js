import Indigo from "../../../lib/indigo/indigo"
import template from "./shop.html"
import {Base1, Base2} from "../base";

var dataPass=true;

export default function Shop(){return{
    extends: [Base1, Base2],
    providers:{
        localString: "Local String"
    },
    data: {
        map: null,
        message: "App item",
        pass: false,
    },
    methods:{
        onCreate() {
            this.data.map=new Map();
            this.data.map.set('test', "passed 1")
        },

        onDestroy() {

        },

        onMount(){
            console.log(this.data.base1String, this.data.base2String);
            this.methods.test();
            this.header.textContent="Test #ref attributes. Match: \""+this.data.map.get("test")+"\"";
            console.log(this.providers['localString']);
        },

        testCall(obj){
        }

    },
    template: template,
}}
