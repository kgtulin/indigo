import "./styles.css"
import Indigo from "./lib/indigo/indigo"
import App from "./app/components/app/app"
import AppItem from "./app/components/app-item/app-item"

var test=App();;

let indigo=new Indigo();
indigo.component("app", App);
indigo.component("app-item", AppItem);
indigo.render(document.querySelector("#app"), "app");
