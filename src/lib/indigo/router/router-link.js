import Indigo from "../indigo"
import Router from "./router"

export default function RouterLink(){ return {
    data: {
        url: "",
        title: "",

        normalClass: "",
        activeClass: "",
        hoverClass: ""
    },
    methods: {

        onMount() {
            this.methods.setClass();
        },

        onNavigate: function (e) {
            e.preventDefault();
            this.router.navigate(this.data.url, this.data.title);
        },

        setClass: function(){
            if(this.router.match(this.data.url))
                this.link.className=this.data.activeClass;
            else
                this.link.className=this.data.normalClass;
        },

        onMouseOver(){
            this.link.className=this.data.hoverClass;
        },
    },
    template:`
        <a href="#" @mouseout="setClass" @mouseover="onMouseOver" #link title="{{data.title}}" @click="onNavigate"><component-children></component-children></a>
    `
}}
