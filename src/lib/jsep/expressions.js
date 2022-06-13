import jsep from "./jsep"

function parseExpression(expression, startObject, namespace, debugString, context){
    switch(expression.type){
        case "CallExpression":

            let caller=parseExpression(expression.callee, startObject, namespace, debugString, context)

            if(!caller)
                throw Error("Error in call expression ("+debugString+")");

            let params=Array();
            for(let i=0; i<expression.arguments.length; i++)
                params.push( parseExpression(expression.arguments[i], startObject, namespace, debugString, context));

            return(caller(params));

        case "MemberExpression":
            let object=parseExpression(expression.object, startObject, namespace, debugString, context);
            let prop=null;

            if(object==null)
                throw Error("Error in member expression ("+debugString+")");

            if(expression.property.type=="Literal")
                prop=expression.property.value;
            else
            if(expression.property.type=="Identifier")
                prop=expression.property.name;
            
            if(object[prop]===undefined)
                prop=parseExpression(expression.property, startObject, namespace, debugString, context);

            if(object==null || object==undefined || prop==null || prop==undefined)
                throw Error("Error in member expression ("+debugString+")");

            return object[prop];

        case "Identifier":
            if(context.firstPass) {

                if(startObject && startObject[expression.name]){
                    return startObject[expression.name];
                }
                else
                for (let i = namespace.length - 1; i >= 0; i--) {
                    let space = namespace[i];
                    if (space.has(expression.name)) {
                        return (space.get(expression.name));
                    }
                }

                if(window[expression.name])
                    return(window[expression.name]);
                else
                if(document[expression.name])
                    return(document[expression.name]);
            }

            throw Error("Unknown identifier: '"+expression.name+"' ("+debugString+")");

        case "ThisExpression":{
            return(startObject);
        }

            
        case "ConditionalExpression":

            let  test=parseExpression(expression.test, startObject, namespace, debugString, context);

            context.firstPass=true;
            if(Boolean(test))
                return parseExpression(expression.consequent, startObject, namespace, debugString, context);
            else
                return parseExpression(expression.alternate, startObject, namespace, debugString, context);
            context.firstPass=false;
            break

        case "Literal":

            const val=expression.value


            if(val=="true")return true;
            if(val==false)return false

            let num=Number(val);
            if(num!=num)
                return(val);
            return(num);
            

        case "BinaryExpression":{
            context.firstPass=true;
            let left = parseExpression(expression.left, startObject, namespace, debugString, context);

            context.firstPass=true;
            let right = parseExpression(expression.right, startObject, namespace, debugString, context);
            context.firstPass=false;

            let result=null;

            switch(expression.operator){

                case "+": result=left + right; break;
                case "*": result=left * right; break;
                case "/": result=left / right; break;
                case "%": result=left % right; break;
                case "-": result=left - right; break;


                case "==": result=left == right; break;
                case "!=": result=left != right; break;
                case "<": result=left < right; break;
                case ">": result=left > right; break;
                case "<=": result=left <= right; break;
                case ">=": result=left >= right; break;

                case "===": result=left === right; break;
                case "!==": result=left !== right; break;                
                
                default:
                    throw Error("Unknown binary expression:'"+expression.operator+"'");
            }
            return(result);
        }
        
        case "UnaryExpression":{
            let argument=parseExpression(expression.argument, startObject, namespace, debugString, context);
            let result=null;
            
            switch(expression.operator){
                case "!": result=!argument; break;
                default:
                    throw Error("Unknown unary expression:'"+expression.operator+"'");
            }

            return(result);
        }


        case "LogicalExpression":{

            context.firstPass=true;
            let left=parseExpression(expression.left, startObject, namespace , debugString, context);
            context.firstPass=false;

            context.firstPass=true;
            let right = parseExpression(expression.right, startObject, namespace, debugString, context);
            context.firstPass=false;

            let result=null;

            switch(expression.operator){
                case "&&": result=left && right; break;
                case "||": result=left || right; break;
                default:
                    throw Error("Error logical expression ("+debugString+")");
            }

            return(result);
        }
        case "Compound":
            return(null);
        
        default:
            throw Error("Unknown expression: '"+expression.type+"' ("+debugString+")");
    }
}

//namespace - масив map, где map - карта имен переменных
//Поиск переменных начинается с конца массива
export default function evalExpression(expression, startObject, namespace, source)
{
    let tree = jsep(expression);
    let context={
        firstPass: true,
    }
    let result=parseExpression(tree, startObject, namespace, expression+ " in "+source, context);
    return(result);
}
