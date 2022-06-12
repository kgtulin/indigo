export default function App(){
    return{
        data: {
            defaultValue: 1000,
            testArray: ["ar1", "ar2", "ar3"],
            basket:{
                login: "kgtulin@hotmail.com",
                wares: [
                    {price: 100, name: "Samsung a100"},
                    {price: 200, name: "iPhone 5"}
                ]
            }
        },
        methods: {
            onParentEvent: (ext:string) => {
            }
        },
        template: require("./app.html").default
}}
