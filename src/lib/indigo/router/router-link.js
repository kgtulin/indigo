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
            if(!this.parent || this.parent.name.toLowerCase()!="router-link-group")
                throw Error("No router-link-block specified")

            this.data.class=this.parent.data.class;
            this.data.normalClass = this.parent.data.normalClass;
            this.data.activeClass = this.parent.data.activeClass;
            this.data.hoverClass = this.parent.data.hoverClass;

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
