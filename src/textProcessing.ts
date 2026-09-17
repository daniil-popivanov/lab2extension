import * as vscode from 'vscode'

class Stack<T> {
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

export function processText(data:[string[], string]):Map<string, string[]>|[string[], string] {
    if (data[1] == '1'){
        return data;
    }

    const patterns: Map<RegExp, string> = new Map();
    patterns.set(/\bstruct\b .+\s*{/, 'structure');
    patterns.set(/\bclass\b .+\s*\{/ , 'class');
    patterns.set(/.+::.+\(.*\)\s*\{/, 'class_method_out');
    patterns.set(/if\s*\(.+\)\s*\{/, 'if');
    patterns.set(/while\s*\(.+\)\s*\{/, 'while');
    patterns.set(/for\s*\(.+\)\s*\{/, 'for');
    patterns.set(/switch\s*\(.+\)\s*\{/, 'switch');
    patterns.set(/.+ .+\(.*\)\s*\{/, 'function/class_method_in');
    patterns.set(/return\s*.+\(\s*\);/, 'return_func');
    patterns.set(/\s*}\s*/, 'closed');
    let markers: Map<string, string[]> = new Map<string, string[]>;
    let brackets:Stack<string> = new Stack<string>;
    let current_struct:Stack<string> = new Stack<string>;
    let names_of_struct:Stack<string> = new Stack<string>;

    for (let i = 0; i < data[0].length; i++) {
        let typeOfStr:string = '';

        for (const [key, value] of patterns) {
            if (key.test(data[0][i])) {
                typeOfStr = value;
                break;
            }
        }

        if (typeOfStr == ''){
            continue;
        }

        if (typeOfStr == 'function/class_method_in'){
            const name = data[0][i].match(/.+ .+\(.*\)\s*\{/)![0].split(' ')[1].split('(')[0];

            if (current_struct.top() == 'class') {
                markers.get(names_of_struct.top())!.push(`${names_of_struct.top()}::` + name);
            }
            else if (current_struct.top() == 'function/class_method_in'){
                markers.set(names_of_struct.top(), []);
                markers.get(names_of_struct.top())!.push(name);
            }

            names_of_struct.push(name);
        }
        else if (typeOfStr == 'return_func') {
            //придумать, как закидывать функции, которые содержат в себе другие функции и при этом сами сидят в других функциях/классах
        }
        else if (typeOfStr == 'class'){
            const name = data[0][i].match(/.+ .+\(.*\)\s*\{/)![0].split(' ')[1].split('{')[0];
            
            if (markers.size != 0) {
                markers.get(current_struct.top())!.push(name)
            }

            names_of_struct.push(name);
        }    

        switch (typeOfStr) {
            case 'function/class_method_in':
            case 'class_method_out':
            case 'structure':
            case 'class':
                current_struct.push(typeOfStr);
                brackets.push('{');
                break;
            default:
                current_struct.pop();
                brackets.pop();
                break;
        }
    }

    return markers;
}