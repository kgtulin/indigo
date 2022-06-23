import Indigo from "./indigo"
import Router from "./router/router"

export default class IndigoComponent {
    public name:string="";
    public baseElement: HTMLElement;
    public vDOMElement: HTMLElement;
    public indigo: Indigo;

    public parent: IndigoComponent = null as unknown as IndigoComponent;
    public children: Array<any> = Array();

    public router: Router;

    public id: number = 0;

    public modifiedStack = Array<number>();

    public state={};
    public props={};
    public providers={}

    constructor(id:number, name:string, baseElement: HTMLElement, vDOMElement: HTMLElement, parent: any, indigo: Indigo) {

        this.name = name;
        this.id = id;

        this.baseElement = baseElement;
        this.vDOMElement = vDOMElement;

        this.parent = parent;

        this.indigo = indigo;

        this.router = this.indigo.router;

        if (this.parent) {
            this.parent.appendChild(this);
        }
    }


    private ExtendState(child: any, base: any):boolean{

        let modif=false;

        for(let item in base){

            const baseItem=base[item];
            const childItem=child[item];

            if(typeof baseItem == "object"){

                // Поле не существует, создаем его
                if (childItem==null || childItem==undefined) {
                    throw Error("Incompatible STATE object in \""+item);
                }

                let m=this.ExtendState(childItem, baseItem);
                if(!modif) modif=m;

                continue
            }
            else{
                if(child[item]!=baseItem) {
                    child[item] = baseItem;
                    modif=true;
                }
            }
        }

        return modif;
    }


    setState=(state: any)=>{
        let modif=this.ExtendState((this as any).state, state);
        if(modif)
            this.forceUpdate();
    }

    provider = (name:string)=>{
        let current = this as any;

        while(current){
            if((current as any).providers && current.providers[name]){
                return(current.providers[name]);
            }
            current=current.parent;
        }

        throw Error(`Provider "${name}" not found`)
    }

    appendChild(component: IndigoComponent){
        this.children.push(component);
    }


    forceUpdate=()=>{
        if(this.modified())return;

        this.pushModified();
        this.indigo.scheduleComponentRender(this);
        this.popModified();
    }

    create(){

        //Расширям пропсы добавлением родительских данных
        let current=this.parent;
        while(current){
            for(let item in current.props){

                let parentProps=current.props as any;
                let thisProps=this.props as any;

                if(thisProps[item]==undefined)
                    thisProps[item]=parentProps[item];
            }

            current=current.parent;
        }

        this.onCreate();
    }

    destroy(){
        this.pushModified();
        for(const item of this.children)
            item.onDestroy();

        this.children=Array();
        this.popModified();

        this.onDestroy();
    }



    modified(){
        return(this.modifiedStack.length!=0);
    }

    pushModified(){
        this.modifiedStack.push(1);
    }

    popModified(){
        this.modifiedStack.pop();
    }

    onCreate(){

    }

    onDestroy(){
    }

    onBeforeMount(){
    }

    onMount(){
    }


    hasParent(parent: any): boolean
    {
        if(this.parent==parent)return(true)
        if(this.parent==null)return(false);

        return this.parent.hasParent(this.parent);
    }

    getTemplate(){
        return "";
    }
}
