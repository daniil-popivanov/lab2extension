import * as vscode from 'vscode'

export type ErrorData = [ // Тип ошибок.
    string[],
    string
]

function getCode():string[]{
    /*
        Функция не принимает никаких аргументов и
        возвращает либо ошибку,
        либо код из открытого в VS Code .cpp файла.
    */

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

export function parseCode(code:string[] = getCode()):ErrorData {
    /*
        Функция принимает на вход ошибку или
        код функции из функции getCode() и возвращает код,
        разбитый на строки или ошибку в формате ErrorData.
    */

    if (code[1] == '1') {
        return [[code[0]], code[1]];
    }

    let readReadyCode:string[] = code[0].trim().split('\n');
    readReadyCode = readReadyCode.filter(word => word != '');

    return [readReadyCode, '0'];
}