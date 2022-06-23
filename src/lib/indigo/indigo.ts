import IndigoComponent from "./indigo-component";
import evalExpression from "../jsep/expressions";
import Router from "./router/router";
import {Child} from "../../test";

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
    element: HTMLElement = null as unknown as HTMLElement;
    func: Function = null as unknown as Function;
}

type RealComponent = IndigoComponent;

export default class Indigo {
    static scheduleComponentInterval = 50;

    public router : Router;

    private eventListeners: Array<EventListener> = Array();

    private componentStack: Array<RealComponent> = Array();
    private componentOutletStack: Array<ChildNode> = Array();
    private currentComponentOutlet: ChildNode = null as unknown as ChildNode;

    private sourceTree: HTMLElement;
    private vDOMTree: HTMLElement;

    private namespace = new Map<string, Object>();
    private namespaceStack = Array<Map<String, Object>>();

    private filters: Map<String, Function> = new Map<String, Function>();
    private installedComponents: Map<string, RealComponent> = new Map();

    private currentComponent: RealComponent;
    private rootComponent: RealComponent = null as unknown as RealComponent;

    private scheduleIntervalId = -1;

    private renderer = Array<RealComponent>();

    private rDOMTree: HTMLElement = null as unknown as HTMLElement;
    private currentRenderComponent: string = "";

    private switchStack = Array<SwithStatus>();

    private componentCache = new Map<number, RealComponent>();
    private cacheId = 0;

    public modifyMode = false;

    constructor() {
        this.sourceTree = null as unknown as HTMLElement;
        this.vDOMTree = null as unknown as HTMLElement;
        this.currentComponent = null as unknown as RealComponent;
        this.router = new Router(this);
    }


    resetAttributes(){

        this.resetEventListeners();

        this.componentStack = Array();

        this.namespace = new Map<string, Object>();
        this.namespaceStack = Array<Map<String, Object>>();

        this.currentComponent = null as unknown as RealComponent;

        this.scheduleIntervalId = -1;

        this.renderer = Array<RealComponent>();

        this.switchStack = Array<SwithStatus>();

        this.componentCache = new Map<number, RealComponent>();
        this.cacheId = 0;
    }


    render(target: HTMLElement, componentName: string) {

        this.modifyMode=true;

        if(this.scheduleIntervalId!=-1) {
            window.clearInterval(this.scheduleIntervalId);
        }

        this.scheduleIntervalId=-1;

        if(this.rootComponent)
            this.rootComponent.destroy();

        this.resetAttributes();

        this.rDOMTree = target;
        this.currentRenderComponent = componentName;

        this.sourceTree = document.createElement("DIV");
        this.vDOMTree = document.createElement("DIV");

        this.currentComponent = this.createComponent(componentName, this.sourceTree, this.vDOMTree);
        this.rootComponent=this.currentComponent;
        this.vDOMTree.setAttribute("indigo-cache-id", this.currentComponent.id.toString());

        this.rootComponent.create();

        this.sourceTree.innerHTML = this.currentComponent.getTemplate();
        this.rootComponent.onBeforeMount();
        this.parseVDOMTree(this.sourceTree, this.vDOMTree);

        this.componentStack = new Array<RealComponent>();

        this.parseRDOMTree(this.vDOMTree, target, false, null as unknown as HTMLElement);
        this.rootComponent.onMount();

        this.modifyMode=false;
    }


    forceUpdate() {

        this.modifyMode=true;

        if(this.scheduleIntervalId!=-1) window.clearInterval(this.scheduleIntervalId);
        this.scheduleIntervalId=-1;

        if(this.rootComponent)
            for(let item of this.rootComponent.children)
                item.destroy();

        this.resetAttributes();

        this.sourceTree = document.createElement("DIV");
        this.vDOMTree = document.createElement("DIV");

        if(this.rootComponent==null)
            throw Error("Error call forceUpdate before call render");
        this.currentComponent=this.rootComponent as RealComponent;

        this.vDOMTree.setAttribute("indigo-cache-id", this.currentComponent.id.toString());

        this.rootComponent.onBeforeMount();
        this.sourceTree.innerHTML = this.currentComponent.getTemplate();
        this.parseVDOMTree(this.sourceTree, this.vDOMTree);

        this.componentStack = new Array<RealComponent>();
        this.parseRDOMTree(this.vDOMTree, this.rDOMTree as HTMLElement, false, null as unknown as HTMLElement);
        this.rootComponent.onMount();

        this.modifyMode=false;
    }


    updateRDOMTree(){

        console.log(this.vDOMTree);
        this.modifyMode=true;

        if(this.scheduleIntervalId!=-1) window.clearInterval(this.scheduleIntervalId);
            this.scheduleIntervalId=-1;

        this.resetEventListeners();
        this.currentComponent = this.rootComponent as RealComponent;
        this.componentStack = new Array<RealComponent>();

        this.parseRDOMTree(this.vDOMTree, this.rDOMTree as HTMLElement, false, null as unknown as HTMLElement);

        this.modifyMode=false;
    }


    resetEventListeners(){
        while(this.eventListeners.length){
            const listener = this.eventListeners[0] as EventListener;

            (listener.element as EventTarget).removeEventListener(listener.type, listener.func as EventListenerOrEventListenerObject);
            this.eventListeners.splice(0, 1);
        }

    }

    pushNamespace() {
        this.namespace.set("", this.currentComponent)
        this.namespaceStack.push(this.namespace);
        this.namespace = new Map<string, Object>();
    }

    popNamespace() {
        this.namespace = this.namespaceStack.pop() as Map<string, Object>;
    }

    pushComponent(component: RealComponent = null as unknown as RealComponent) {
        this.componentStack.push(this.currentComponent);
        if (component)
            this.currentComponent = component;
    }

    popComponent() {
        this.currentComponent = this.componentStack.pop() as RealComponent;
    }


    parseInterpolation(text: string) {

        let normalRegexp = /{{(.+?)}}/;
        let filterRegexp = /{{[\n\r\t\x20]*(.+?)[\n\r\t\0x20]*\|[\n\r\t\0x20]*(.+)[\n\r\t\0x20]*}}/;
        let result = text;

        let match: RegExpMatchArray  | null = null as unknown as RegExpMatchArray;

        while ((match = result.match(filterRegexp)) || (match = result.match(normalRegexp))) {

            if (match.length == 3) {

                let pars = match[1].trim();
                let filter = (match[2]).trim();

                let expressionText = this.evalExpression(pars, this.currentComponent);

                let func = this.getFilter(filter);

                expressionText = func(expressionText);
                result = result.replace(filterRegexp, expressionText);
            } else if (match.length == 2) {

                let pars = match[1].trim();
                let expressionText = this.evalExpression(pars, this.currentComponent);
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
            testValue = this.evalExpression(testExpr, this.currentComponent) as boolean;

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
            testValue = this.evalExpression(expr, this.currentComponent) as boolean;

        if (!testValue)
            this.parseVDOMTree(srcElement, destElement);
    }

    parseFor(srcElement: HTMLElement, destElement: HTMLElement) {
        let test: string = srcElement.getAttribute("test") as string;

        let forOfRegexp = /[\x20\t]*([a-zA-Z0-9$@_\-]+)[\t\x20]+of[\t\x20]+([a-zA-Z0-9_@$,"'|&<>!=%/*+\-.\[\]\\()]+)/;
        let forInRegexp = /[\x20\t]*([a-zA-Z0-9$@_\-]+)[\t\x20]+in[\t\x20]+([a-zA-Z0-9_@$,"'|&<>!=%/*+-.\[\]\\()]+)/;

        let result = test.match(forOfRegexp) as RegExpMatchArray;

        if (result) {

            let array = this.evalExpression(result[2], this.currentComponent);
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

            let array = this.evalExpression(result[2], this.currentComponent);
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
        let condition = this.evalExpression(test, this.currentComponent);

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

        let currentSwitchValue = this.evalExpression(expr, this.currentComponent);

        this.switchStack.push(new SwithStatus(currentSwitchValue, false));

        this.parseVDOMTree(srcElement, destElement);

        this.switchStack.pop();
    }

    parseCase(srcElement: HTMLElement, destElement: HTMLElement) {
        if (this.switchStack.length == 0)
            throw Error("Mismatch of SWITCH-CASE tags in " + this.currentComponent.name)

        let status = this.switchStack[this.switchStack.length - 1];

        if (status.casePassed) return;

        //let value = srcElement.getAttribute("value") as string;
        let expr=srcElement.getAttribute("value") as string;
        let value=this.evalExpression(expr, this.currentComponent);

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

        this.currentComponent.create();

        //Готовим шаблон
        this.currentComponent.onBeforeMount();
        let srcTempNode = document.createElement(currentSrcNode.nodeName);
        srcTempNode.innerHTML = this.currentComponent.getTemplate();

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


    parseRDOMTreeItem(srcElement: HTMLElement, parentDestElement: HTMLElement, destElement: HTMLElement) {

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

    parseRDOMTree(srcElement: HTMLElement, destElement: HTMLElement,
                  continueParse:boolean=false,
                  tempElement: HTMLElement = null as unknown as HTMLElement): HTMLElement {

        let currentSrc = srcElement.firstChild as HTMLElement;
        let currentDest;

        if(continueParse)
            currentDest=tempElement;
        else
            currentDest=destElement.firstChild as HTMLElement;

        while (currentSrc) {

            let hasComponent=false
            if(currentSrc.nodeName.toLowerCase()!="#text" && currentSrc.nodeName.toLowerCase()!="#comment" && currentSrc.hasAttribute("indigo-cache-id"))
                hasComponent=true;

            if(hasComponent){
                let componentId=Number.parseInt(currentSrc.getAttribute("indigo-cache-id") as string);
                let component=this.componentCache.get(componentId);

                this.pushComponent(component);
                this.currentComponent.onBeforeMount();

                //Просматриваем дерево вглубь компонента
                currentDest=this.parseRDOMTree(currentSrc, destElement, true, currentDest as HTMLElement);
                (component as RealComponent).onMount();
                this.popComponent();

                currentSrc = currentSrc.nextSibling as HTMLElement;
                continue;
            }
            else
            if(currentDest){
                // Типы узлов виртуального и реального дерева не совпадают,
                // удаляем начиная с отличающегося узла
                if (currentDest && currentDest.nodeName.toLowerCase() != currentSrc.nodeName.toLowerCase()) {
                    while (currentDest) {

                        let elem = currentDest;
                        currentDest = elem.nextSibling as HTMLElement;
                        elem.remove();
                    }

                    currentDest = null;
                }
            }

            //Создаем новый узел
            this.parseRDOMTreeItem(currentSrc, destElement, currentDest as HTMLElement);

            currentSrc = (currentSrc as ChildNode).nextSibling as HTMLElement;

            if (currentDest)
                currentDest = currentDest.nextSibling as HTMLElement;
        }

        // В узле реального дерева болше элементов чем в виртуальном дереве, удаляем лишнее
        if(currentDest /*&& !srcElement.hasAttribute("indigo-cache-id")*/){

            let destNodes = new Array<HTMLElement>()

            while (currentDest){
                destNodes.push(currentDest)
                currentDest=currentDest.nextSibling as HTMLElement;
            }

            for(let item of destNodes)
                item.remove();
        }

        return(currentDest as unknown as HTMLElement);
    }

    //Вызывается при имзенении состояния компонента
    renderComponent(component:RealComponent)
    {
        if(this.modifyMode) return;

        this.modifyMode=true;
        this.pushComponent(component);

        let tempDestNode;

        for(let item of component.children)
            item.destroy();
        component.children=Array();

        //Готовим компонент к рендеру
        let src=document.createElement(component.baseElement.nodeName);
        let dest=document.createElement(component.baseElement.nodeName); //component.currentElement;
        src.innerHTML=component.getTemplate();
        component.onBeforeMount();

        //Рендерим компонент
        this.parseVDOMTree(src, dest);
        this.popComponent();

        //Вставляем компонент в дерево
        if(component.vDOMElement.parentNode) {
            (component.vDOMElement.parentNode as ParentNode).insertBefore(dest, component.vDOMElement);
            this.copyVDOMAttributes(component.baseElement, dest);

            component.vDOMElement.remove();
            component.vDOMElement=dest;
            component.vDOMElement.setAttribute("indigo-cache-id", component.id.toString());
        }
        else {
            this.vDOMTree=dest;
            this.vDOMTree.setAttribute("indigo-cache-id", component.id.toString());
            component.vDOMElement=this.vDOMTree;
        }

        this.updateRDOMTree();

        this.modifyMode=false;
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

    scheduleComponentRender(component: RealComponent)
    {
        //Проверка, находится ли компонент или его родитель в очереди на рендер
        for(let i=0; i<this.renderer.length; i++){
            let comp=this.renderer[i];
            if(component.hasParent(comp))continue;
            if(comp==component)continue;
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
                //Событие для компонента. eventName - имя метода в текущем компоненте
                //srcAttr - функция в родительском компоненте, например methods.onCustomEvent
                if(srcElement==this.currentComponent.baseElement){

                    let eventName=this.camelCase((srcAttr.name.slice(1)));
                    const eventFunc=this.evalExpression(srcAttr.value, this.currentComponent.parent);

                    if(!eventFunc || typeof eventFunc != "function")
                        throw Error(`Function "${this.currentComponent.name}.${srcAttr.value}"not found`);

                    if(!this.currentComponent.props) this.currentComponent.props={};
                    (this as any).currentComponent.props[eventName]=eventFunc;
                }
            }
            else
            if(srcAttr.name.charAt(0)==":"){
                //Привязка атрибутов
                if(this.currentComponent.baseElement==srcElement){

                    let name=this.camelCase(srcAttr.name.slice(1));
                    let value=null;

                    this.currentComponent.pushModified();

                    value=this.evalExpression(srcAttr.value, this.currentComponent.parent);
                    if(!this.currentComponent.props)
                        this.currentComponent["props"] = {};

                    let props=(this as any).currentComponent.props;
                    if(props[name]!=value) props[name]=value;

                    this.currentComponent.popModified();
                }
            }
            else
            if(srcAttr.name.charAt(0)=="#"){
                let name=this.camelCase(srcAttr.name.slice(1));
                if(!this.currentComponent.props) this.currentComponent.props={};
                (this.currentComponent.parent as any).props[name]=this.currentComponent;
            }

            //Обрабатываем обычный атрибут
            let src = (srcElement.getAttributeNode(srcAttr.name) as Attr).cloneNode() as Attr;

            let dest = src.cloneNode();

            dest.textContent = this.parseInterpolation(dest.textContent as string);

            destElement.setAttributeNode(dest as Attr);
        }
    }


    //Обрабатывает все что связано с событимя
    copyRDOMAttributes(srcElement: HTMLElement, destElement: HTMLElement)
    {
        // Удаляем лишние атрибуты (атрибуты которых нет в VDOM)
        for(let i=0; i<destElement.attributes.length; i++){

            let attr = destElement.attributes[i];
            let char=attr.name.charAt(0);

            //удаляем в том числе служебные атрибуты
            if(char=="@" || char==":" || char=="#" || !srcElement.hasAttribute(attr.name) || attr.name==":classes" || attr.name==":styles")
                destElement.removeAttribute(attr.name);
        }

        //Копируем атрибуты в получателя
        for(let i=0; i<srcElement.attributes.length; i++){

            let srcAttr=srcElement.attributes[i];
            let char=srcAttr.name.charAt(0);

            //Обрабатываем классы
            if(srcAttr.name==":classes"){
                let classes = this.evalExpression(srcAttr.value, this.currentComponent);

                //Удаляем классы из элемента
                for(let item in classes)
                    destElement.classList.remove(item);

                //Устанавливаем значения классов на основе переданной карты {class1: boolean, class2: boolean...}
                for(let item in classes){
                    if(classes[item]){
                        destElement.classList.add(item);
                    }
                }
            }
            else
            if(srcAttr.name==":styles"){
                let style = this.evalExpression(srcAttr.value, this.currentComponent);

                for(let name in style){
                    destElement.style[name as any]=style[name];
                }
            }
            else
            //Обрабатываем события
            if(char=="@"){
                let eventName=this.camelCase((srcAttr.name.slice(1))); //Имя события, mouse-over преобразуется в mouseOver

                const func=this.evalExpression(srcAttr.value, this.currentComponent);

                let eventFunc=func;
                if(typeof eventFunc!="function")
                    throw Error(`Event handler ${this.currentComponent.name}.${srcAttr.value} is not a function`);

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
                value=this.evalExpression(srcAttr.value, this.currentComponent);
                if(destElement.getAttribute(name)!=value)
                    destElement.setAttribute(name, value);
            }
            else
            if(char=="#"){
                //Создаем ссылку на HTML элемент и помащаем ее в пространство имен
                let name=this.camelCase(srcAttr.name.slice(1));
                this.namespace.set(name, destElement);
                (this as any).currentComponent.props[name]=destElement;
            }
            else{
                //Обрабатываем обычный атрибут
                let src=(srcElement.getAttributeNode(srcAttr.name) as Node).cloneNode() as Attr;
                if(src.name=="indigo-cache-id")continue;

                if(destElement.getAttribute(src.name)==src.value) continue;
                let dest=src.cloneNode() as Attr;
                dest.value=src.value;

                destElement.setAttributeNode(dest as Attr);
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

    getComponent(name:string): RealComponent{
        if(!this.checkComponent(name.toLowerCase()))
            throw(Error(`Component ${name} not found`));

        return( this.installedComponents.get(name.toLowerCase()) as RealComponent);
    }

    //Создает компонент
    createComponent(name : string, baseNode:ChildNode, vDOMNode:ChildNode){
        const func = this.getComponent(name);

        if(!func || typeof(func)!="function")
            throw Error("Can not create component \""+name+"\"");

        let result=new (func as any)(this.cacheId, name, baseNode as HTMLElement, vDOMNode as HTMLElement, this.currentComponent, this);

        this.componentCache.set(result.id, result);
        this.cacheId++;

        return(result);
    }

    //Регистрирует компонент в Indigo.
    //В качестве компонента передается фабричная функция.
    component(name:string, component:RealComponent){
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
