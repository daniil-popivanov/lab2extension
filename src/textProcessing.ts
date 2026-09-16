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

// let test_data:[string[], string] = [['#include <iostream>', '','int sum(int a, int b) {', '', '', 'return a + b;', '}', 'int main() {', '', '', 'return 0;', '}'], '0'];
// processText(test_data);

export function processText(data:[string[], string]) {
    if (data[1] == '1'){
        return;
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
    patterns.set(/return\s*.+;/, 'return');
    patterns.set(/\s*}\s*/, 'closed');
    let markers: Map<string, string[]> = new Map<string, string[]>;
    let brackets:Stack<string> = new Stack<string>;
    let current_struct:Stack<string> = new Stack<string>;

    for (let i = 0; i < data[0].length; i++) {
        let typeOfStr:string = '';

        for (const [key, value] of patterns) {
            if (key.test(data[0][i])) {
                typeOfStr = value;
                break;
            }
        }

        if (typeOfStr != ''){
            if (typeOfStr == 'function/class_method_in') {
                const name = data[0][i].match(/.+ .+\(.*\)\s*\{/)![0].split(' ')[1].split('(')[0];

                if (markers.size != 0) {
                    markers.get(current_struct.top())!.push(name);
                }
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
    }

    let out:string = '';

    for (const [key, value] of markers) {
        out += `${key} ${value}\n`;
    }

    return out;
}