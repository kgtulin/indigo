import Shop from "./shop";

export default class Ware{
    shop: Shop;

    id: number;
    title: string;
    price: number;
    image: string;
    text: string;

    constructor(shop:Shop, id:number, title:string, price:number, image:string, text:string) {
        this.shop = shop;

        this.id=id;
        this.title=title;
        this.price=price;
        this.image=image;
        this.text=text;
    }
}
