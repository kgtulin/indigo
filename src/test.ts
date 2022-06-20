export class Base <PropsT, StateT>{

    constructor() {
    }

    private ExtendState(child: any, base: any){

        for(let item in base){

            const baseItem=base[item];
            const childItem=child[item];

            if(typeof baseItem == "object"){

                // Поле не существует, создаем его
                if (childItem==null || childItem==undefined) {
                    throw Error("Incompatible STATE object in \""+item);
                    child[item]={}
                }

                this.ExtendState(child[item], base[item]);
                continue
            }
            else{
                child[item] = baseItem;
            }
        }
    }

    setState(state:StateT){
        this.ExtendState((this as any).state, state);
    }

    update(){

    }

    testState(){
    }
}

type State={title?:string, sum?: number, ware?: {image:string, data: string}};
type Props = {item: string,  basket: number, total: number}

export class Child extends Base<Props, State> {

    state: State = {
        title: "" as string,
        sum: 12.40 as number,
        ware: {
            image: "/pic/base.gif",
            data: "Рездел Ноутбуки"
        }
    }

    props: Props = {
        item: "props", basket: 0, total: 364
    }

    constructor() {
        super();
        this.setState({title: "Hello World", sum: 298, ware: {image:"/pic/no-foto.gif", data: "login: kgtulin"} });
    }
}
