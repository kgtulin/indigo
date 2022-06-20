import Basket from "./basket";
import Ware from "./ware";

export default class BasketItem{
    ware: Ware;
    count: number = 1;
    id: number;

    constructor(id: number, ware: Ware) {
        this.ware=ware;
        this.id=id;
    }

    summ=()=>{
        return this.ware.price* this.count;
    }
}
