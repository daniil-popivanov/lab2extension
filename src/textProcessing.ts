import { ErrorData } from "./filework.js";

export class Stack<T> {
    private massive:T[] = [];

    push(value:T):void {
        this.massive.push(value);
    }

    pop():void {
        this.massive.pop();
    }

    top():T {
        return this.massive[this.massive.length - 1];
    }

    isEmpty():boolean {
        return this.massive.length == 0;
    }

    clear():void {
        this.massive.length = 0;
    }

    size():number {
        return this.massive.length;
    }
}

export type MarkedData = [
    Map<string, boolean>,
    Map<string, string>
]

export function processText(data:ErrorData):MarkedData|ErrorData {
    if (data[1] == '1'){
        return data;
    }

    const patterns: Map<RegExp, string> = new Map();
    patterns.set(/\bstruct\b .+\s*\{/, 'structure');
    patterns.set(/\bclass\b .+\s*\{/ , 'class');
    patterns.set(/.+::.+\(.*\)\s*\{/, 'class_method_out');
    patterns.set(/if\s*\(.+\)\s*\{/, 'if');
    patterns.set(/\}\s*else\s*\{/, 'else_closed');
    patterns.set(/else\s*\{/, 'else');
    patterns.set(/while\s*\(.+\)\s*\{/, 'while');
    patterns.set(/for\s*\(.+\)\s*\{/, 'for');
    patterns.set(/switch\s*\(.+\)\s*\{/, 'switch');
    patterns.set(/return\s*.+\(.*\);/, 'return_func');
    patterns.set(/.+ .+\(.*\)\s*\{/, 'function/class_method_in');
    patterns.set(/\s*}\s*/, 'closed');
    patterns.set(/\s*\{\s*/, 'open');
    
    const patterns_without_bracket: Map<RegExp, string> = new Map();
    patterns_without_bracket.set(/\bstruct\b .+\s*/, 'structure');
    patterns_without_bracket.set(/\bclass\b .+\s*/ , 'class');
    patterns_without_bracket.set(/.+::.+\(.*\)\s*/, 'class_method_out');
    patterns_without_bracket.set(/if\s*\(.+\)\s*/, 'if');
    patterns_without_bracket.set(/\}\s*else\s*\{/, 'else_closed');
    patterns_without_bracket.set(/else\s*/, 'else');
    patterns_without_bracket.set(/while\s*\(.+\)\s*/, 'while');
    patterns_without_bracket.set(/for\s*\(.+\)\s*/, 'for');
    patterns_without_bracket.set(/switch\s*\(.+\)\s*/, 'switch');
    patterns_without_bracket.set(/.+ .+\(.*\)\s*/, 'function/class_method_in');
    
    let brackets:Stack<string> = new Stack<string>;
    let current_struct:Stack<string> = new Stack<string>;
    let names_of_struct:Stack<string> = new Stack<string>;
    let relatives:Map<string, string> = new Map<string, string>;
    let processed:Map<string, boolean> = new Map<string, boolean>;

    for (let i = 0; i < data[0].length; i++) {
        let typeOfStr:string = '';
        let isOpen:boolean = false;
        
        for (const [key, value] of patterns) {
            if (key.test(data[0][i])) {
                typeOfStr = value;
                break;
            }
        }
        
        if (typeOfStr == ''){
            continue;
        }

        if (typeOfStr == 'open') {
            isOpen = true;

            for (const [key, value] of patterns_without_bracket) {
                if (key.test(data[0][i - 1])) {
                    typeOfStr = value;
                    break;
                }
            }

            i--;
        }

        if (typeOfStr == 'function/class_method_in'){
            const name:string = data[0][i].split(' ').filter(word => /.+\(.*/.test(word))[0].split('(')[0];
            relatives.set(name + '()', '');
            processed.set(name + '()', true);

            if (!current_struct.isEmpty()){
                relatives.set(name + '()', names_of_struct.top());
            }

            names_of_struct.push(name + '()');
        }
        else if (typeOfStr == 'return_func') {
            const name:string = data[0][i].split(' ').filter(word => /.+\(.*/.test(word))[0].split('(')[0];
            relatives.set(name + '()', names_of_struct.top());
            processed.set(name + '()', true);
        }
        else if (typeOfStr == 'class' || typeOfStr == 'structure'){
            let name:string;
            
            if (/\s*\{\s*/.test(data[0][i])){
                name = data[0][i].split(' ')[1];
            }
            else{
                name = data[0][i].split(' ')[1].split('{')[0];
            }
            
            name = typeOfStr + ' ' + name;
            processed.set(name, true);
            relatives.set(name, '');
            let numtop:number = 1;
    
            if (!names_of_struct.isEmpty()){
                relatives.set(name, names_of_struct.top());
            }

            names_of_struct.push(name);
        }
        else if (typeOfStr == 'class_method_out') {
            const name:string = data[0][i].split(' ').filter(word => /.+::.+\(.*/.test(word))[0].split('(')[0];
            const class_name:string = name.split('::')[0];
            processed.set(class_name + '::' + name, true);
            relatives.set(class_name + '::' + name, class_name);
        }

        switch (typeOfStr) {
            case 'else_closed':
                if (!(brackets.top() == '{i')) {
                    current_struct.pop();
                    names_of_struct.pop();
                }
                
                if (brackets.isEmpty()){
                    brackets.push('}');
                    brackets.push('}');
                }
                
                brackets.pop();
                brackets.push('{i');
                break;
            case 'function/class_method_in':
            case 'class_method_out':
            case 'structure':
            case 'class':
                current_struct.push(typeOfStr);
                brackets.push('{');
                break;
            case 'if':
            case 'else':
            case 'switch':
            case 'while':
            case 'for':
                brackets.push('{i');
                break;
            case 'closed':
                if (!(brackets.top() == '{i')) {
                    current_struct.pop();
                    names_of_struct.pop();
                }

                if (brackets.isEmpty()){
                    brackets.push('}');
                    brackets.push('}');
                }

                brackets.pop();
                break;
        }

        if (isOpen) {
            i++;
        }
    }

    if (!brackets.isEmpty() || !current_struct.isEmpty() || !names_of_struct.isEmpty()) {
        return [["Error, something gone wrong! Brackets is not dual!"], "1"];
    }

    return [processed, relatives];
}