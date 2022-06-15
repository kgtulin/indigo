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

    constructor(id:number, name:string, baseElement: HTMLElement, vDOMElement: HTMLElement, dataObject:any, parent: Component, indigo: Indigo) {

        this.name = name;
        this.id = id;

        this.baseElement = baseElement;
        this.vDOMElement = vDOMElement;

        this.dataObject = dataObject;
        this.parent = parent;

        if (this.parent) this.dataObject.parent = this.parent.dataObject;
        else this.dataObject.parent = null;

        this.indigo = indigo;
        this.dataObject.name = name;

        this.dataObject.router = this.indigo.router;

        if (this.parent)
            this.parent.appendChild(this);

        // Выполняем наследование для data-компонента,
        // компонент может быть наследован от нескольких родителей
        if (this.dataObject.extends) {
            for (let item of this.dataObject.extends) {
                const base = item();
                Component.ExtendComponentData(dataObject, base)
            }
        }

        // Настраиваем объект this
        if (this.dataObject.methods)
            this.bindMethods(dataObject.methods);

        // Подготавливаем прокси
        if (this.dataObject.data)
            this.prepareProxy(this.dataObject, "data");

        this.dataObject.indigo = indigo;

        //Функция поиска провайдера в родительских компонентах
        this.dataObject.provider = (name: string)=>{
            let current: Component = this;
            while(current){
                if(current.dataObject.providers && current.dataObject.providers[name])
                    return(current.dataObject.providers[name]);
                current=current.parent;
            }
            throw Error("Provider \""+name+"\" not found at \""+this.name+"\" component")
        };

    }


    prepareProxy(parent: any, itemName:string){
        if(typeof parent[itemName] !== "object") return;
        if(parent[itemName]==null)return;

        // Обработчик событий delete и set
        const handler = {

            set: (target:any, key:string, value:any) => {

                if(target[key]===value)return(true);

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

            if(typeof methods[method]!="function") continue
            methods[method] = methods[method].bind(this.dataObject)
        }
    }

    // Наследование child от base.
    // Работает только создание несуществующих полей
    static ExtendComponentData(child: any, base: any){

        if(base.extends)
            for(let item of base.extends){
                let subItem=item();
                Component.ExtendComponentData(base, item);
            }

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
        this.modifyMode=true;
        for(const item of this.children)
            item.onDestroy();

        if(this.dataObject.methods && this.dataObject.methods.onDestroy)
            this.dataObject.methods.onDestroy();

        this.children=Array();
        this.modifyMode=false;
    }


    onCreate(){
        this.modifyMode=true;
        if(this.dataObject.methods && this.dataObject.methods.onCreate)
            this.dataObject.methods.onCreate();
        this.modifyMode=false;
    }


    onMount(){
        if(this.dataObject.methods && this.dataObject.methods.onMount)
            this.dataObject.methods.onMount();
    }

    hasParent(parent:Component): boolean
    {
        if(this.parent==parent)return(true)
        if(this.parent==null)return(false);

        return this.parent.hasParent(this.parent);
    }
}
