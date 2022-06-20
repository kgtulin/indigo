import "./styles.css"
import Indigo from "./lib/indigo/indigo"
import AppComponent from "./app/components/app/app-component"
import ShopComponent from "./app/components/shop/shop-component"
import BasketComponent from "./app/components/basket/basket-component"
import WareComponent from "./app/components/ware/ware-component";
import Route from "./lib/indigo/router/route"
import RouterLink from "./lib/indigo/router/router-link";
import RouterLinkGroup from "./lib/indigo/router/router-link-group";
import BasketItemComponent from "./app/components/basket-item/basket-item-component";
import WareDetailsComponent from "./app/components/ware-details/ware-details-component"


let indigo=new Indigo();
indigo.component("app", AppComponent);
indigo.component("shop", ShopComponent);
indigo.component("basket", BasketComponent);
indigo.component("ware", WareComponent)
indigo.component("ware-details", WareDetailsComponent)
indigo.component("basket-item", BasketItemComponent)
indigo.component("route", Route);
indigo.component("router-link", RouterLink);
indigo.component("router-link-group", RouterLinkGroup);

indigo.filter("test", function (value) {
    return("Test: "+value)
})

indigo.render(document.querySelector("#app"), "app");
