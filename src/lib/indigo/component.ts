import Indigo from "./indigo"

export default class Component{

    public name:string="";
    public baseElement: HTMLElement;
    public vDOMElement: HTMLElement;
    public dataObject: any = null;
    public indigo: Indigo;

    public parent: Component;
    public children: Array<Component> = Array();

    public modifyMode = false;

    public id: number = 0;

    constructor(id:number, name:string, baseElement: HTMLElement, vDOMElement: HTMLElement, dataObject:any, parent: Component, indigo: Indigo){

        this.name=name;
        this.id=id;

        this.baseElement=baseElement;
        this.vDOMElement=vDOMElement;

        this.dataObject=dataObject;
        this.parent=parent;
        this.indigo=indigo;

        if(this.parent)
            this.parent.appendChild(this);

        // Выполняем наследование для data-компонента,
        // компонент может быть наследован от нескольких родителей
        if(this.dataObject.extends){
            for(let item of this.dataObject.extends){
                const base=item();
                Component.ExtendComponentData(dataObject, base)
            }
        }

        // Настраиваем объект this
        if(this.dataObject.methods)
            this.bindMethods(dataObject.methods);

        // Подготавливаем прокси
        if(this.dataObject.data)
            this.prepareProxy(this.dataObject, "data");

        this.dataObject.indigo=indigo;
    }


    prepareProxy(parent: any, itemName:string){
        if(typeof parent[itemName] !== "object") return;

        // Обработчик событий delete и set
        const handler = {

            set: (target:any, key:string, value:any)=>{

                //if(target[key]===value)return(true);

                target[key]=value;
                this.onModified();
                return(true);
            },

            deleteProperty: (target:any, key:string)=> {
                if (key in target) {

                    delete target[key]
                    this.onModified();
                    return(true);
                }
            },
        }

        //Входим в режим изменения данных
        this.modifyMode=true;

        // Создаем прокси для переданого компонента
        parent[itemName] = new Proxy(parent[itemName], handler as Object);

        // Проксируем всех детей
        for(let key in parent[itemName]){
            this.prepareProxy(parent[itemName], key);
        }
        this.modifyMode=false;
    }

    // Настраиваем указатель this на методы из data-компонента
    bindMethods(methods: any){
        for(let method in methods) {
            methods[method] = methods[method].bind(this.dataObject)
        }
    }

    // Наследование child от base.
    // Работает только создание несуществующих полей
    static ExtendComponentData(child: any, base: any){

        if(base.extends)
            for(let item of base.extends)
                Component.ExtendComponentData(base, item);

        for(let item in base){

            const baseItem=base[item];
            const childItem=child[item];

            if(baseItem==="extends") continue;

            if(typeof baseItem === "object"){

                // Поле не существует, создаем его
                if (childItem===null || childItem===undefined) {
                    child[item]={}
                }
                else
                if(typeof childItem != "object")continue; //Поле есть и оно не объект
                Component.ExtendComponentData(child[item], base[item]);
                continue
            }
            else{
                if(childItem === null || childItem===undefined) { //поле пустое, добавляем значение

                    child[item] = baseItem;
                }
            }
        }


    }

    appendChild(component: Component){
        this.children.push(component);
    }

    onModified(){
        if(this.modifyMode)return;

        this.modifyMode=true;

        this.indigo.scheduleComponentRender(this);

        this.modifyMode=false;
    }


    onDestroy(){
        for(const item of this.children)
            item.onDestroy();

        if(this.dataObject.methods.onDestory)
            this.dataObject.methods.onDestroy();
    }


    onCreate(){
        if(this.dataObject.methods.onCreate)
            this.dataObject.methods.onCreate();
    }


    hasParent(parent:Component): boolean
    {
        if(this.parent==parent)return(true)
        if(this.parent==null)return(false);

        return this.parent.hasParent(this.parent);
    }
}
