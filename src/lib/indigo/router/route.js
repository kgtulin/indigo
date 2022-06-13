export default function Route(){ return{
    data:{
        url: "",
        title: ""
    },
    methods:{
        match: function () {
            let result = this.router.match(this.data.url);
            if(result) document.title=this.data.title;
            return(result);
        }
    },

    template: `
        <i-if test="methods.match()">
            <component-children></component-children>
        </i-if> 
    `
}}
