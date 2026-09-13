import * as vscode from 'vscode'

function getCode():string{
    const editor = vscode.window.activeTextEditor;

    if (!editor){
        return "Error, editor is not opened!";
    }

    const filePath = editor.document.uri.fsPath;

    if (!filePath.endsWith('.cpp')) {
        return "Error, wrong file extension!";
    }

    let code:string|undefined = editor.document.getText();

    if (!code) {
        return "Code is empty";
    }

    return code;
}

export function parseCode(code:string = getCode()):string[] {
    let readReadyCode:string[] = code.trim().split('\n');
    readReadyCode = readReadyCode.filter(word => word != '');

    return readReadyCode;
}