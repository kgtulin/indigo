import Component from "./component";
import evalExpression from "../jsep/expressions";
import Router from "./router/router";

class SwithStatus{
    public value: any;
    public casePassed = false;

    constructor(value: any, casePassed: boolean){
        this.value=value;
        this.casePassed=casePassed;
    }
}

class EventListener{
    type: string = "";
    element: HTMLElement | null = null;
    func: Function | null = null;
}

export default class Indigo {
    static scheduleComponentInterval = 50;

    public router : Router;

    private eventListeners: Array<EventListener> = Array();

    private componentStack: Array<Component> = Array();
    private componentOutletStack: Array<ChildNode> = Array();
    private currentComponentOutlet: ChildNode | null = null;

    private sourceTree: HTMLElement;
    private vDOMTree: HTMLElement;

    private namespace = new Map<string, Object>();
    private namespaceStack = Array<Map<String, Object>>();

    private filters: Map<String, Function> = new Map<String, Function>();
    private installedComponents: Map<string, Function> = new Map();

    private currentComponent: Component;
    private rootComponent: Component | null = null;

    private scheduleIntervalId = -1;

    private renderer = Array<Component>();

    private rDOMTree: HTMLElement | null = null;
    private currentRenderComponent: string = "";

    private switchStack = Array<SwithStatus>();

    private componentCache = new Map<number, Component>();
    private cacheId = 0;


    constructor() {
        this.sourceTree = null as unknown as HTMLElement;
        this.vDOMTree = null as unknown as HTMLElement;
        this.currentComponent = null as unknown as Component;
        this.router = new Router(this);
    }


    resetAttributes(){

        this.resetEventListeners();

        this.componentStack = Array();

        this.namespace = new Map<string, Object>();
        this.namespaceStack = Array<Map<String, Object>>();

        this.currentComponent = null as unknown as Component;

        this.scheduleIntervalId = -1;

        this.renderer = Array<Component>();

        this.switchStack = Array<SwithStatus>();

        this.componentCache = new Map<number, Component>();
        this.cacheId = 0;

        this.rootComponent = null;
    }


    render(target: HTMLElement, componentName: string) {
        if(this.scheduleIntervalId!=-1) {
            window.clearInterval(this.scheduleIntervalId);
        }

        this.scheduleIntervalId=-1;

        if(this.rootComponent)
            this.rootComponent.onDestroy();

        this.resetAttributes();

        this.rDOMTree = target;
        this.currentRenderComponent = componentName;

        this.sourceTree = document.createElement("DIV");
        this.vDOMTree = document.createElement("DIV");

        this.currentComponent = this.createComponent(componentName, this.sourceTree, this.vDOMTree);
        this.rootComponent=this.currentComponent;
        this.vDOMTree.setAttribute("indigo-cache-id", this.currentComponent.id.toString());

        this.sourceTree.innerHTML = this.currentComponent.dataObject.template;
        this.parseVDOMTree(this.sourceTree, this.vDOMTree);

        this.rootComponent.onCreate();

        this.componentStack = new Array<Component>();

        this.parseRDOMTree(this.vDOMTree, target, false, null as unknown as HTMLElement);
    }


    forceUpdate() {

        if(this.scheduleIntervalId!=-1) window.clearInterval(this.scheduleIntervalId);
        this.scheduleIntervalId=-1;

        if(this.rootComponent)
            for(let item of this.rootComponent.children)
                item.onDestroy();

        this.resetAttributes();

        this.sourceTree = document.createElement("DIV");
        this.vDOMTree = document.createElement("DIV");

        if(this.rootComponent)
            this.currentComponent=this.rootComponent;
        else {
            this.currentComponent = this.createComponent(this.currentRenderComponent, this.sourceTree, this.vDOMTree);
            this.rootComponent=this.currentComponent;
        }

        this.vDOMTree.setAttribute("indigo-cache-id", this.currentComponent.id.toString());

        this.sourceTree.innerHTML = this.currentComponent.dataObject.template;
        this.parseVDOMTree(this.sourceTree, this.vDOMTree);

        this.componentStack = new Array<Component>();
        this.parseRDOMTree(this.vDOMTree, this.rDOMTree as HTMLElement, false, null as unknown as HTMLElement);
    }


    updateRDOMTree(){

    if(this.scheduleIntervalId!=-1) window.clearInterval(this.scheduleIntervalId);
        this.scheduleIntervalId=-1;

        this.resetEventListeners();
        this.currentComponent = this.rootComponent as Component;
        this.componentStack = new Array<Component>();

        this.parseRDOMTree(this.vDOMTree, this.rDOMTree as HTMLElement, false, null as unknown as HTMLElement);
    }


    resetEventListeners(){
        while(this.eventListeners.length){
            const listener = this.eventListeners[0] as EventListener;

            (listener.element as EventTarget).removeEventListener(listener.type, listener.func as EventListenerOrEventListenerObject);
            this.eventListeners.splice(0, 1);
        }

    }

    pushNamespace() {
        this.namespaceStack.push(this.namespace);
        this.namespace = new Map<string, Object>();
    }

    popNamespace() {
        this.namespace = this.namespaceStack.pop() as Map<string, Object>;
    }

    pushComponent(component: Component | null = null) {
        this.componentStack.push(this.currentComponent);
        if (component)
            this.currentComponent = component;
    }

    popComponent() {
        this.currentComponent = this.componentStack.pop() as Component;
    }


    parseInterpolation(text: string) {

        let normalRegexp = /{{(.+?)}}/;
        let filterRegexp = /{{[\n\r\t\x20]*(.+?)[\n\r\t\0x20]*\|[\n\r\t\0x20]*(.+)[\n\r\t\0x20]*}}/;
        let result = text;

        let match: RegExpMatchArray | null = null;

        while ((match = result.match(filterRegexp)) || (match = result.match(normalRegexp))) {

            if (match.length == 3) {

                let pars = match[1].trim();
                let filter = (match[2]).trim();

                let expressionText = this.evalExpression(pars, this.currentComponent.dataObject);

                let func = this.getFilter(filter);

                expressionText = func(expressionText);
                result = result.replace(filterRegexp, expressionText);
            } else if (match.length == 2) {

                let pars = match[1].trim();
                let expressionText = this.evalExpression(pars, this.currentComponent.dataObject);
                result = result.replace(normalRegexp, expressionText);
            }
        }

        return (result)
    }

    //Поиск следующего _элемента_ в цепочке
    findNextNode(node: ChildNode) {
        let current = node.nextSibling;

        while (current != null) {

            if (current.nodeName != "#text" && current.nodeName != "#comment")
                break;
            else
                current = current.nextSibling;
        }
        return (current);
    }

    // Поиск предыдущего _элемента_ в цепочке
    findPrevNode(node: ChildNode) {
        let current = node.previousSibling;

        while (current != null) {

            if (current.nodeName != "#text" && current.nodeName != "#comment")
                break;
            else
                current = current.previousSibling;
        }
        return (current);
    }


    parseIf(srcElement: HTMLElement, destElement: HTMLElement) {

        let testExpr = srcElement.getAttribute("test");
        let testValue = false;

        if (testExpr)
            testValue = this.evalExpression(testExpr, this.currentComponent.dataObject) as boolean;

        if (testValue)
            this.parseVDOMTree(srcElement, destElement);
    }

    parseElse(srcElement: HTMLElement, destElement: HTMLElement) {
        let ifNode = this.findPrevNode(srcElement) as HTMLElement;

        if (!ifNode || ifNode.nodeName.toLowerCase() != "i-if")
            throw Error("Mismatch of IF-ELSE tags")

        const expr = ifNode.getAttribute("test");
        let testValue = false;

        if (expr)
            testValue = this.evalExpression(expr, this.currentComponent.dataObject) as boolean;

        if (!testValue)
            this.parseVDOMTree(srcElement, destElement);
    }

    parseFor(srcElement: HTMLElement, destElement: HTMLElement) {
        let test: string = srcElement.getAttribute("test") as string;

        let forOfRegexp = /[\x20\t]*([a-zA-Z0-9$@_\-]+)[\t\x20]+of[\t\x20]+([a-zA-Z0-9_@$,"'|&<>!=%/*+\-.\[\]\\()]+)/;
        let forInRegexp = /[\x20\t]*([a-zA-Z0-9$@_\-]+)[\t\x20]+in[\t\x20]+([a-zA-Z0-9_@$,"'|&<>!=%/*+-.\[\]\\()]+)/;

        let result = test.match(forOfRegexp) as RegExpMatchArray;

        if (result) {

            let array = this.evalExpression(result[2], this.currentComponent.dataObject);
            let item = result[1];
            let value = null;
            let index = 0;
            let even = true;
            let odd = false;


            for (value of array) {
                this.namespace.set(item, value);
                this.namespace.set("index", index);
                this.namespace.set("even", even);
                this.namespace.set("odd", !odd);

                this.pushNamespace();
                this.parseVDOMTree(srcElement, destElement);
                this.popNamespace();

                index++;
                even = !even;
                odd = !odd;
            }

        }
        else
        if ((result = test.match(forInRegexp) as RegExpMatchArray)!=null) {

            let array = this.evalExpression(result[2], this.currentComponent.dataObject);
            let item = result[1];
            let index = 0;
            let even = true;
            let odd = false;

            for (let value in (array as Array<any>)) {
                this.namespace.set(item, value);

                this.namespace.set("index", index);
                this.namespace.set("even", even);
                this.namespace.set("odd", odd);

                this.pushNamespace();
                this.parseVDOMTree(srcElement, destElement);
                this.popNamespace();

                index++;
                even = !even;
                odd = !odd;
            }
        } else
            throw Error("Unknown loop type");
    }


    parseWhile(srcElement: HTMLElement, destElement: HTMLElement) {
        let test: string = srcElement.getAttribute("test") as string;
        let condition = this.evalExpression(test, this.currentComponent.dataObject);

        let index = 0;
        let even = true;
        let odd = false;


        while(condition as boolean) {
            this.namespace.set("index", index);
            this.namespace.set("even", even);
            this.namespace.set("odd", !odd);

            this.pushNamespace();
            this.parseVDOMTree(srcElement, destElement);
            this.popNamespace();

            index++;
            even = !even;
            odd = !odd;
        }
    }


    parseSwitch(srcElement: HTMLElement, destElement: HTMLElement) {
        let expr = srcElement.getAttribute("test") as string;

        let currentSwitchValue = this.evalExpression(expr, this.currentComponent.dataObject);

        this.switchStack.push(new SwithStatus(currentSwitchValue, false));

        this.parseVDOMTree(srcElement, destElement);

        this.switchStack.pop();
    }

    parseCase(srcElement: HTMLElement, destElement: HTMLElement) {
        if (this.switchStack.length == 0)
            throw Error("Mismatch of SWITCH-CASE tags in " + this.currentComponent.name)

        let status = this.switchStack[this.switchStack.length - 1];

        if (status.casePassed) return;

        let value = srcElement.getAttribute("value") as string;
        //let value=this.evalExpression(expr, this.currentComponent.dataObject);

        if (value == status.value) {
            this.parseVDOMTree(srcElement, destElement);
            status.casePassed = true;
        }

    }

    parseDefault(srcElement: HTMLElement, destElement: HTMLElement) {
        if (this.switchStack.length == 0)
            throw Error("Mismatch of SWITCH-DEFAULT tags in " + this.currentComponent.name);

        let status = this.switchStack[this.switchStack.length - 1];
        if (status.casePassed) return;

        this.parseVDOMTree(srcElement, destElement);
    }

    _createComponent(currentSrcNode: HTMLElement, currentDestNode: HTMLElement) {

        this.pushComponent(this.createComponent(currentDestNode.nodeName.toLowerCase(), currentSrcNode, currentDestNode));
        currentDestNode.setAttribute("indigo-cache-id", this.currentComponent.id.toString());

        this.copyVDOMAttributes(currentSrcNode as HTMLElement, currentDestNode as HTMLElement);
        let tempDestNode = null;

        this.currentComponent.onCreate();

        //Обрабатывем элементы внутре тега компонента
        //if (currentSrcNode.firstChild) {
        //    tempDestNode = document.createElement("DIV");
        //    this.parseVDOMTree(currentSrcNode, tempDestNode);
        //}

        //Готовим шаблон
        let srcTempNode = document.createElement(currentSrcNode.nodeName);
        srcTempNode.innerHTML = this.currentComponent.dataObject.template;

        //Промсматриваем дерево  в глубь
        this.parseVDOMTree(srcTempNode, currentDestNode);

        this.popComponent();
    }


    parseVDOMTreeItem(srcElement: ChildNode, parentDestElement: ChildNode) {

        let currentDestElement: ChildNode = null as any; // Новый элемент добавляемый в parentDestElement

        switch (srcElement.nodeName.toLowerCase()) {
            case "#text":
                let text = this.parseInterpolation(srcElement.textContent as string);
                currentDestElement = document.createTextNode(text);
                break;

            case "#comment":
                currentDestElement = document.createComment(srcElement.textContent as string);
                break;

            case "component-children":

                let tempElement=document.createElement("component-children");
                this.parseVDOMTree(this.currentComponent.baseElement, tempElement);

                while(tempElement.firstChild){
                    let elem=tempElement.firstChild;
                    elem.remove();
                    parentDestElement.appendChild(elem);
                }

                return;

            case "i-for":
                this.parseFor(srcElement as HTMLElement, parentDestElement as HTMLElement);
                return;

            case "i-if":
                this.parseIf(srcElement as HTMLElement, parentDestElement as HTMLElement);
                return;

            case "i-else":
                this.parseElse(srcElement as HTMLElement, parentDestElement as HTMLElement);
                return;

            case "i-switch":
                this.parseSwitch(srcElement as HTMLElement, parentDestElement as HTMLElement);
                return;

            case "i-case":
                this.parseCase(srcElement as HTMLElement, parentDestElement as HTMLElement);
                return;

            case "i-default":
                this.parseDefault(srcElement as HTMLElement, parentDestElement as HTMLElement);
                return;

            default:
                currentDestElement = document.createElement(srcElement.nodeName);

                if (this.checkComponent(srcElement.nodeName))
                    this._createComponent(srcElement as HTMLElement, currentDestElement as HTMLElement)
                else
                    this.copyVDOMAttributes(srcElement as HTMLElement, currentDestElement as HTMLElement);
        }

        if (currentDestElement) {

            parentDestElement.appendChild(currentDestElement);

            if (!this.checkComponent(srcElement.nodeName))
                this.parseVDOMTree(srcElement, currentDestElement);
        }
    }

    parseVDOMTree(srcElement: ChildNode, destElement: ChildNode) {

        let currentElement = srcElement.firstChild;

        this.pushNamespace();
        while (currentElement) {
            this.parseVDOMTreeItem(currentElement, destElement);
            currentElement = currentElement.nextSibling;
        }
        this.popNamespace();
    }


    parseRDOMTreeItem(srcElement: HTMLElement, parentDestElement: HTMLElement, destElement: HTMLElement | null) {

        switch(srcElement.nodeName.toLowerCase()){
            case "#text":
                if(destElement) {
                    destElement.textContent = srcElement.textContent;
                }
                else if (srcElement.textContent != null) {

                    destElement = document.createTextNode(srcElement.textContent) as unknown as HTMLElement;
                    parentDestElement.appendChild(destElement as Node);
                }
                return;

            case "#comment":
                if(destElement) {

                    destElement.textContent = srcElement.textContent;
                }
                else{

                    destElement = document.createComment(srcElement.textContent as string) as unknown as HTMLElement;
                    parentDestElement.appendChild(destElement);
                }
                return;


            default:
                if(!destElement){
                    destElement = document.createElement(srcElement.nodeName);
                    parentDestElement.appendChild(destElement);
                }

                this.copyRDOMAttributes(srcElement, destElement as HTMLElement);
                this.parseRDOMTree(srcElement, destElement, false, null as unknown as HTMLElement);

        }

    }

    parseRDOMTree(srcElement: HTMLElement, destElement: HTMLElement, continueParse:boolean=false, tempElement: HTMLElement | null = null): HTMLElement {

        let currentSrc = srcElement.firstChild as HTMLElement | null;
        let currentDest;

        if(continueParse)
            currentDest=tempElement;
        else
            currentDest=destElement.firstChild as HTMLElement | null;

        while (currentSrc) {

            let hasComponent=false
            if(currentSrc.nodeName.toLowerCase()!="#text" && currentSrc.nodeName.toLowerCase()!="#comment" && currentSrc.hasAttribute("indigo-cache-id"))
                hasComponent=true;

            if(hasComponent){
                let componentId=Number.parseInt(currentSrc.getAttribute("indigo-cache-id") as string);
                let component=this.componentCache.get(componentId);

                this.pushComponent(component);
                currentDest=this.parseRDOMTree(currentSrc, destElement, true, currentDest as HTMLElement);
                (component as Component).onMount();
                this.popComponent();

                currentSrc = currentSrc.nextSibling as HTMLElement;
                continue;
            }
            else
            if(currentDest){
                // Типы узлов виртуального и реального дерева не совпадают,
                // удаляем начиная с отличающегося узла
                const nodeName = currentSrc.nodeName.toLowerCase();
                if (currentDest && currentDest.nodeName != currentSrc.nodeName) {
                    while (currentDest) {

                        let elem = currentDest;
                        currentDest = elem.nextSibling as HTMLElement;
                        elem.remove();
                    }

                    currentDest = null;
                }
            }

            this.parseRDOMTreeItem(currentSrc, destElement, currentDest as HTMLElement);

            currentSrc = (currentSrc as ChildNode).nextSibling as HTMLElement;

            if (currentDest)
                currentDest = currentDest.nextSibling as HTMLElement;
        }

        // В узле реального дерева болше элементов чем в виртуальном дереве, удаляем лигнее
        if(currentDest && !srcElement.hasAttribute("indigo-cache-id")){

            let destNodes = new Array<HTMLElement>()

            while (currentDest){
                destNodes.push(currentDest)
                currentDest=currentDest.nextSibling as HTMLElement;
            }

            for(let item of destNodes)
                item.remove();
        }

        return(currentDest as HTMLElement);
    }

    //Вызывается при имзенении состояния компонента
    renderComponent(component:Component)
    {
        this.pushComponent(component);

        let tempDestNode;

        for(let item of component.children)
            item.onDestroy();
        component.children=Array();

        //Рендерим то, что содержится внутри тела компонента
        //(<component_name>_здесь_</component_name>
        tempDestNode = document.createElement("DIV");
        this.parseVDOMTree(component.baseElement, tempDestNode);

        //Готовим стек для component-children.
        //Данные будут доступны в шаблоне, в теге
        //<component-children></component-children>
        this.componentOutletStack.push(this.currentComponentOutlet as ChildNode);
        this.currentComponentOutlet=tempDestNode;

        //Готовим компонент к рендеру
        let src=document.createElement(component.baseElement.nodeName);
        let dest=document.createElement(component.baseElement.nodeName); //component.currentElement;
        src.innerHTML=component.dataObject.template;

        //Рендерим компонент
        this.parseVDOMTree(src, dest);
        this.popComponent();

        //Вставляем компонент в дерево
        (component.vDOMElement.parentNode as ParentNode).insertBefore(dest, component.vDOMElement);
        this.copyVDOMAttributes(component.baseElement, dest);

        component.vDOMElement.remove();
        component.vDOMElement=dest;
        component.vDOMElement.setAttribute("indigo-cache-id", component.id.toString());

        this.updateRDOMTree();
    }



    scheduleRender()
    {
        this.scheduleIntervalId=-1;

        for(let component of this.renderer) {
            this.renderComponent(component);
        }
        this.renderer=Array();
    }



    /**
     *  Вызывается из компонента при каждом изменении объекта data и вложенных объектов
     */

    scheduleComponentRender(component: Component)
    {
        //Проверка, находится ли компонент или его родитель в очереди на рендер
        for(let i=0; i<this.renderer.length; i++){
            let comp=this.renderer[i];
            if(component.hasParent(comp))return;
            if(comp==component)return;
        }

        this.renderer.push(component);

        if(this.scheduleIntervalId!=-1) {
            window.clearInterval(this.scheduleIntervalId);
        }

        //Асинхронный вызов scheduleRender. Повторный вызов
        //добавляет компонент в очередь, отменяет предыдущий setInterval
        //и ставит на асинхронное исполнение новую задачу по рендеру компонента

        this.scheduleIntervalId=window.setTimeout(this.scheduleRender.bind(this), Indigo.scheduleComponentInterval);
    }


    //Преобразует имя события из my-event в myEvent
    camelCase(text:string)
    {
        let re=/-([a-zA-Z])/;
        let result=text;
        let match=null;


        while(match=result.match(re)){

            if(match.length==0)return(result);

            result=result.replace(re, match[1].toUpperCase());
        }
        return(result)
    }


    //Обрабатывает все что связано с атрибутами в виртуальном дереве
    copyVDOMAttributes(srcElement: HTMLElement, destElement: HTMLElement)
    {
        //Копируем атрибуты в получателя
        for(let i=0; i<srcElement.attributes.length; i++){

            let srcAttr=srcElement.attributes[i];

            //Обрабатываем события
            //Имя события, например mouseover
            //Имя события on-custom-event будет преобразовано в onCustomEvent
            if(srcAttr.name.charAt(0)=="@"){
                //Событие для компонента. eventName - имя метода в секции methods текущего компонента
                //srcAttr - функция в родительском компоненте, например methods.onCustomEvent
                if(srcElement==this.currentComponent.baseElement){

                    let eventName=this.camelCase((srcAttr.name.slice(1)));

                    const func=this.evalExpression(srcAttr.value, this.currentComponent.parent.dataObject);

                    if(!this.currentComponent.dataObject.methods)
                        this.currentComponent.dataObject.methods={};

                    this.currentComponent.dataObject.methods[eventName]=func;

                }
            }
            else
            if(srcAttr.name.charAt(0)==":"){
                //Привязка атрибутов
                if(this.currentComponent.baseElement==srcElement){

                    let name=this.camelCase(srcAttr.name.slice(1));
                    let value=null;

                    this.currentComponent.modifyMode=true;

                    value=this.evalExpression(srcAttr.value, this.currentComponent.parent.dataObject);
                    let data=this.currentComponent.dataObject["data"];
                    if(data[name]!==value) data[name]=value;

                    this.currentComponent.modifyMode=false;
                }
            }
            else
            if(srcAttr.name.charAt(0)=="#"){
                let name=this.camelCase(srcAttr.name.slice(1));
                this.currentComponent.parent.dataObject[name]=this.currentComponent.dataObject;
            }

            //Обрабатываем обычный атрибут
            let src = (srcElement.getAttributeNode(srcAttr.name) as Attr).cloneNode() as Attr;
            src.value = srcAttr.value;

            let dest = src.cloneNode();

            dest.textContent = this.parseInterpolation(dest.textContent as string);
            destElement.setAttributeNode(dest as Attr);
        }




    }


    //Обрабатывает все что связано с событимя
    copyRDOMAttributes(srcElement: HTMLElement, destElement: HTMLElement)
    {
        //Копируем атрибуты в получателя
        for(let i=0; i<srcElement.attributes.length; i++){

            let srcAttr=srcElement.attributes[i];
            let char=srcAttr.name.charAt(0);

            //Обрабатываем события
            if(char=="@"){
                let eventName=this.camelCase((srcAttr.name.slice(1))); //Имя события, mouse-over преобразуется в mouseOver
                let eventFunc=this.currentComponent.dataObject.methods[srcAttr.value];

                destElement.addEventListener(eventName, eventFunc);

                let listener = new EventListener();
                listener.element=destElement;
                listener.type=eventName;
                listener.func=eventFunc;
                this.eventListeners.push(listener);

            }
            else
            if(char==":"){
                let name=this.camelCase(srcAttr.name.slice(1));
                let value=null;

                //Обычная привязка к атрибуту элемента
                value=this.evalExpression(srcAttr.value, this.currentComponent.dataObject);
                if(destElement.getAttribute(name)!==value)
                    destElement.setAttribute(name, value);
            }
            else
            if(srcAttr.name.charAt(0)=="#"){

                //Создаем ссылку на HTML элемент и помащаем ее в пространство имен
                let name=srcAttr.name.slice(1)
                this.namespace.set(name, destElement);
                this.currentComponent.dataObject[name]=destElement;
            }
            else{

                //Обрабатываем обычный атрибут
                let src=(srcElement.getAttributeNode(srcAttr.name) as Node).cloneNode() as Attr;
                src.value=srcAttr.value;

                let dest=src.cloneNode();

                dest.textContent=this.parseInterpolation(dest.textContent as string);
                destElement.setAttributeNode(dest as Attr);
            }

            // Удаляем лишние атрибуты (атрибуты которых нет в VDOM)
            for(let i=0; i<destElement.attributes.length; i++){

                let attr = destElement.attributes[i];
                let char=attr.name.charAt(0);

                //удаляем в том числе служебные атрибуты
                if(char=="@" || char==":" || char=="#" || !srcElement.hasAttribute(attr.name))
                    destElement.removeAttribute(attr.name);
            }

            // Устанавливаем атрибуты
            for(let i=0; i<srcElement.attributes.length; i++){
                let attr=srcElement.attributes[i];
                let char=attr.name.charAt(0);

                // пропускаем служебные атрибуты
                if(char=="@" || char==":" || char=="#" || attr.name=="indigo-cache-id")continue;

                if(!destElement.hasAttribute(attr.name) || destElement.getAttribute(attr.name)!=attr.value) {
                    destElement.setAttribute(attr.name, attr.value);
                }
            }
        }
    }

    evalExpression(expr:string, startObject: any):any {
        this.pushNamespace()
        let result = evalExpression(expr, startObject, this.namespaceStack, this.currentComponent.name);
        this.popNamespace();
        return(result);
    }

    checkComponent(name:string): boolean{
        return(this.installedComponents.has(name.toLowerCase()));
    }

    getComponent(name:string): Function{
        if(!this.checkComponent(name.toLowerCase()))
            throw(Error(`Component ${name} not found`));

        return( this.installedComponents.get(name.toLowerCase()) as Function );
    }

    //Создает обертку вокруг dataObject
    createComponent(name : string, baseNode:ChildNode, vDOMNode:ChildNode){
        const func = this.getComponent(name);

        let dataObj=func();

        // srcElement используется исключительно в renderComponent
        let result=new Component(this.cacheId, name, baseNode as HTMLElement, vDOMNode as HTMLElement, dataObj, this.currentComponent, this);
        this.componentCache.set(result.id, result);
        this.cacheId++;

        return(result);
    }

    //Регистрирует компонент в Indigo.
    //В качестве компонента передается фабричная функция.
    component(name:string, component:Function){
        this.installedComponents.set(name, component);
    }

    getFilter(name:string): Function{
        if(!this.checkFilter(name.toLowerCase()))
            throw(Error(`Filter ${name} not found`));

        const f:Function = this.filters.get(name.toLowerCase()) as Function;

        return(f);
    }

    checkFilter(name:string){
        return(this.filters.has(name))
    }
    filter(name:string, func: Function){
        this.filters.set(name, func);
    }

}
