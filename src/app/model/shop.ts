import Ware from "./ware";

export default class Shop{

    data = [
        {id: 1, title: "Ноутбук Huawei MateBook D 15", price: 49690, image: "https://items.s1.citilink.ru/1643758_v01_b.jpg", text: "Ноутбук Huawei MateBook D 15 15.6, IPS, Intel Core i3 10110U 2.1ГГц, 8ГБ, 256ГБ SSD, Intel UHD Graphics , Windows 10 Home, 53012KQY, серебристый"},
        {id: 2, title: "Ноутбук Huawei MateBook 14", price: 69700, image: "https://items.s1.citilink.ru/1617484_v01_b.jpg", text: "Ноутбук Huawei MateBook 14 14, IPS, AMD Ryzen 5 5500U 2.1ГГц, 16ГБ, 512ГБ SSD, AMD Radeon , Windows 10 Home, 53012NVL, серый"},
        {id: 3, title: "Ноутбук Huawei MateBook D 14", price: 49790, image: "https://items.s1.citilink.ru/1559063_v01_b.jpg", text: "Ультрабук Honor MagicBook X15, 15.6, IPS, Intel Core i3 10110U 2.1ГГц, 8ГБ, 256ГБ SSD, Intel UHD Graphics , Windows 10 Home, 5301AAPQ, серый"},
        {id: 4, title: "Ультрабук Honor MagicBook X15", price: 52790, image: "https://items.s1.citilink.ru/1643268_v01_b.jpg", text: "Ноутбук Lenovo IP Gaming 3 15ACH6, 15.6, IPS, AMD Ryzen 5 5600H 3.3ГГц, 8ГБ, 256ГБ SSD, NVIDIA GeForce RTX 3050 для ноутбуков - 4096 Мб, noOS, 82K201D1RK, черный"},
        {id: 5, title: "Ноутбук Lenovo IP Gaming", price: 85890, image: "https://items.s1.citilink.ru/1595005_v01_b.jpg", text: "Ноутбук Acer Aspire 3 A315-56-38MN, 15.6, Intel Core i3 1005G1 1.2ГГц, 8ГБ, 256ГБ SSD, Intel UHD Graphics , Linux, NX.HS5ER.00B, черный"},
        {id: 6, title: "Ноутбук Acer Aspire 3 A315-56-38M", price: 38890, image: "https://items.s1.citilink.ru/1194671_v01_b.jpg", text: "Ноутбук Acer Nitro 5 AN515-57-51GK, 15.6, IPS, Intel Core i5 11400H 2.7ГГц, 16ГБ, 512ГБ SSD, NVIDIA GeForce RTX 3050 Ti для ноутбуков - 4096 Мб, Eshell, NH.QESER.003, черный"},
        {id: 7, title: "Ультрабук Honor MagicBook X14", price: 44890, image: "https://items.s1.citilink.ru/1635667_v01_b.jpg", text: "Ультрабук Honor MagicBook X14, 14, IPS, Intel Core i3 10110U 2.1ГГц, 8ГБ, 256ГБ SSD, Intel UHD Graphics , Windows 10 Home, 5301AAPL, серый"}
    ]

    items: Array<Ware> = Array();

    getWareById=(id:number): Ware =>{
        let result=this.items.find((elem)=>elem.id==id) as Ware;
        return(result);
    }

    load(){
        return(new Promise( (resolve)=>{
            setTimeout(() => {

                for(let item of this.data){
                    let ware=new Ware(this, item.id, item.title, item.price, item.image, item.text);
                    this.items.push(ware);
                }

                resolve(this)
            }, 1000);
        }))
    }

    getWares=()=>{
        return(this.items);
    }
}
