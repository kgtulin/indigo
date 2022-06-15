import template from "./app.html";
import css from "./styles.css"

const globalString="indigo providers"

export default function App(){return{
    providers: {
        global: globalString
    },

    css: css,
    data: {
    },
    methods: {
        onCreate(){
        },

        onDestroy(){
        }
    },

    template: template
}}
