export type TaskItemData = {id: number, done: boolean, important: boolean, title: string};

let Data =[
        {title: "Сделать зарядку", important: false, done: false, id:1},
        {title: "Приготовить завтрак", important: false, done: false, id:2},
        {title: "Собрать сына в школу", important: true, done: true, id:3},
        {title: "Навести порядок на кухне", important: false, done: false, id:4},
        {title: "Сходить в хозяйственный", important: true, done: false, id:5},
        {title: "Передать показания счетчика", important: false, done: false, id:6}
    ]


export default class DataSource {
    onChange: Function;
    data: Array<TaskItemData> = Array();
    currentId=7;

    constructor(onChange: Function) {
        this.onChange=onChange;
    }


    sendData(callback: Function){
        return(new Promise( (resolve)=>{
            setTimeout(() => {
                callback();
                resolve(this)
            }, 200);
        }))
    }


    load(){
        return (this.sendData( ()=> {

            for (let item of Data) {
                this.data.push(
                    {
                        title: item.title,
                        id: item.id,
                        important: item.important,
                        done: item.done
                    });
            }

        }))
    }

    addItem(title: string){
        let item={title:title, id:this.currentId, done:false, important:false}

        return(this.sendData(
            ()=>{
                this.data.push(item)
                this.onChange();
            }
        ))
    }

    deleteItem(id:number){
        return(this.sendData(
            ()=>{
                let index=this.data.findIndex((elem)=>{
                    return(elem.id==id);
                })
                this.data.splice(index, 1);
                this.onChange();
            }
        ))
    }

    getItems(isDone: boolean, isImportant: boolean, filter: string){
        let result = [...this.data];

        if(isDone)
            result=result.filter((elem)=>{return elem.done==isDone});

        if(isImportant)
            result=result.filter((elem)=>{return elem.important==isImportant});

        if(filter.length)
            result=result.filter((elem)=>{
                return ( elem.title.toLowerCase().indexOf(filter.toLowerCase())!==-1);
            })

        return(result);
    }

    getItemById(id:number): TaskItemData{
        let index=this.data.findIndex((elem)=>{
            return(elem.id==id);
        })

        return(this.data[index]);
    }

    updateItem(id:number, done:boolean, important:boolean){
        return(this.sendData(()=>{
            let updItem=this.getItemById(id);
            updItem.important=important;
            updItem.done=done;
            this.onChange();
        }))
    }

    getSummary(){
        let total=this.data.length;
        let doneCount=0;
        let imporntantCount=0;

        this.data.forEach((elem)=>{
            if(elem.done)doneCount++;
            if(elem.important)imporntantCount++;
        })

        return {total:total, done:doneCount, important:imporntantCount}
    }


}
