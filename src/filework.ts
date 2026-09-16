import * as vscode from 'vscode'

function getCode():string[]{
    const editor = vscode.window.activeTextEditor;

    if (!editor){
        return ["Error, editor is not opened!", '1'];
    }

    const filePath = editor.document.uri.fsPath;

    if (!filePath.endsWith('.cpp')) {
        return ["Error, wrong file extension!", '1'];
    }

    let code:string|undefined = editor.document.getText();

    if (!code) {
        return ["Code is empty", '1'];
    }

    return [code, '0'];
}

export function parseCode(code:string[] = getCode()):[string[], string] {
    if (code[1] == '1') {
        return [[code[0]], code[1]];
    }

    let readReadyCode:string[] = code[0].trim().split('\n');
    readReadyCode = readReadyCode.filter(word => word != '');

    return [readReadyCode, '0'];
}