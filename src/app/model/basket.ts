import BasketItem from "./basket-item";
import Shop from "./shop";
import Ware from "./ware";

export default class Basket{

    items:Array<BasketItem> = Array();
    onModified: Function;
    shop: Shop;
    currentId = 4;

    data = [
        {id: 1, wareId: 1, count:1},
        {id: 2, wareId: 2, count:3},
        {id: 3, wareId: 3, count:1}
    ];

    constructor(shop:Shop, onModified: Function){
        this.shop=shop;
        this.onModified=onModified;
    }

    update(){
        this.onModified();
    }

    getItemById=(id:number)=>{
        let index=this.items.findIndex((elem)=>elem.id==id)
        return(this.items[index]);
    }


    getItemByWareId=(id:number):BasketItem => {
        return( this.items.find((elem)=>elem.ware.id==id) as BasketItem );
    }


    sendQuery=(func: Function)=>{
        return(new Promise( (resolve)=>{
            setTimeout(() => {
                resolve(func());
            }, 500);
        }))
    }


    addItem=(ware: Ware)=>{
        return this.sendQuery( ()=>{
            let item: BasketItem = this.getItemById(ware.id) as BasketItem;
            if(item!=null){
                item.count++;
            }
            else {
                let basketItem = new BasketItem(this.currentId++, ware);
                this.items.push(basketItem);
            }
            this.update();

            return this;
        })
    }


    deleteItem=(id: number)=>{
        return this.sendQuery(()=>{
            let index=this.items.findIndex((elem)=>elem.id==id);
            this.items.splice(index, 1);
            this.update();
            return(this)
        })
    }


    setCount=(id:number, count:number)=>{

        return this.sendQuery(()=>{
            let elem=this.items.find((elem)=>elem.id==id) as BasketItem
            elem.count=count;
            this.update();
            return this;
        })
    }


    getCount=(id:number)=>{
        let elem=this.items.find((elem)=>elem.id==id) as BasketItem
        return elem.count;
    }


    load=()=>{

        return this.sendQuery(()=>{
            this.items=Array();

            for(let item of this.data){
                let basketItem=new BasketItem(item.id, this.shop.getWareById(item.wareId));
                basketItem.count = item.count;
                this.items.push(basketItem);
            }
            return this;
        })
    }


    getChildrenCount=()=>{
        return this.items.length;
    }

    getChildren=(index: number)=>{
        return this.items[index];
    }

    getItems=()=>{
        return(this.items);
    }

    getTotalSumm=()=>{
        let result=0;
        for(let item of this.items)
            result+=item.ware.price*item.count;
        return(result);
    }
}
