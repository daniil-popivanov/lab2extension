import * as vscode from 'vscode'
import { processText } from './textProcessing.js'
import { parseCode } from './filework.js'

export class WebPanel {
    private panel:vscode.WebviewPanel|undefined;

    connectWebview():void {
        this.panel = vscode.window.createWebviewPanel(
            'graphOfCode',
            'Graph',
            vscode.ViewColumn.One,
            {
                enableScripts: false,
            }
        );
    }

    makeGraph() {
        if (!this.panel){
            this.connectWebview();
        }

        let markedData:Map<string, string[]>|[string[], string] = processText(parseCode());

        if (Array.isArray(markedData)) {
            let isFixed:boolean = false;
            let attemp:number = 0;
            const delay = (seconds: number) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

            async function retryAttemp() {
                console.log("Retry after 5 seconds...");
                await delay(5);
                console.log("Retrying...");
            }

            console.log(markedData[0][0]);

            while (!isFixed && attemp < 10) {
                retryAttemp();

                attemp++;
                markedData = processText(parseCode());
                
                if (!Array.isArray(markedData)) {
                    isFixed = true;
                    console.log("Successfully!");
                }
                else {
                    console.log(markedData[0][0]);
                }
            }

            if (!isFixed) {
                console.log("Please, fix error!");
                return;
            }
        }

        let htmlCode:string = `<!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <title>Your code graph</title>
        </head>
        <body>
        <h1>Your code graph</h1>
        <p>Your code is empty/your graph ins't builded yet</p>
        </body>
        </html>`;

        for (const [key, value] of markedData) {
            continue;
        }

        this.panel!.webview.html = htmlCode;
    }
}