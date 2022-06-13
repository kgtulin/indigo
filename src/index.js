import "./styles.css"
import Indigo from "./lib/indigo/indigo"
import App from "./app/components/app/app"
import Shop from "./app/components/shop/shop"
import Basket from "./app/components/basket/basket"
import Route from "./lib/indigo/router/route"
import RouterLink from "./lib/indigo/router/router-link";
import Home from "./app/components/home/home"

let indigo=new Indigo();
indigo.component("app", App);
indigo.component("shop", Shop);
indigo.component("home", Home);
indigo.component("basket", Basket);
indigo.component("route", Route);
indigo.component("router-link", RouterLink);
indigo.render(document.querySelector("#app"), "app");
