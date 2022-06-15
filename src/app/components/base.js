export function Base1(){return{
    data: {
        base1String: "Base 1 String"
    },

    methods:{
        test: function(){
            console.log("test")
        }
    }
}}

export function Base2(){return{
    extends: [Base1],
    data: {
        base2String: "Base 2 String"
    }
}}
