import * as vscode from 'vscode'
import { processText } from './textProcessing.js'
import { parseCode } from './filework.js'

interface GraphVertex {
    id:number;
    label:string|string[];
}

interface GraphEdge {
    from:number;
    to:number;
    arrows:string;
}

export class WebPanel {
    private panel:vscode.WebviewPanel|undefined;

    constructor(
        private readonly context: vscode.ExtensionContext
    ) {}

    connectWebview():void {
        this.panel = vscode.window.createWebviewPanel(
            'graphOfCode',
            'Graph',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(
                        this.context.extensionUri,
                        'src',
                        'media'
                    )
                ]
            }
        );

        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });
    }

    async makeGraph(): Promise<void> {
        if (!this.panel){
            this.connectWebview();
        }

        const visPath = vscode.Uri.joinPath(
            this.context.extensionUri,
            'src',
            'media',
            'vis-network.min.js'
        );

        const visUri = this.panel!.webview.asWebviewUri(visPath);
        let markedData:Map<string, string[]>|[string[], string] = processText(parseCode());

        if (Array.isArray(markedData)) {
            let isFixed:boolean = false;
            let attemp:number = 0;
            const delay = (seconds: number):Promise<void> => new Promise(resolve => setTimeout(resolve, seconds * 1000));

            async function retryAttemp() {
                console.log("Retry after 5 seconds...");
                await delay(5);
                console.log("Retrying...");
            }

            console.log(markedData[0][0]);
            const max_attemp:number = 5;

            while (!isFixed && attemp < max_attemp) {
                await retryAttemp();

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

        let htmlCode:string = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        
        <meta charset="UTF-8">
        <title>Your code graph</title>
        
        <meta
            http-equiv="Content-Security-Policy"
            content="
                default-src 'none';
                script-src ${this.panel!.webview.cspSource} 'unsafe-inline';
                style-src 'unsafe-inline';
            "
        >
            
            <style>
                #network-container {
                    width: 1000px;
                    height: 600px;
                    border: 1px solid lightgray;
                }
            </style>

            <script src="${visUri}"></script>
        </head>
        <body>
            <div id="network-container"></div>
        `;
        let vertices:GraphVertex[] = [];
        let edges:GraphEdge[] = [];
        let vertexCheck:Map<string|string[], number> = new Map<string, number>;

        for (const [key, value] of markedData) {
            if (!vertexCheck.has(key)) {
                vertexCheck.set(key, vertices.length + 1);
                const vrtx:GraphVertex = {id:vertices.length + 1, label:key};
                vertices.push(vrtx);
            }

            for (const cur_value of value){
                if (!vertexCheck.has(cur_value)) {
                    vertexCheck.set(cur_value, vertices.length + 1);
                    const vrtx:GraphVertex = {id:vertices.length + 1, label:cur_value};
                    vertices.push(vrtx);
                }
    
                const edge:GraphEdge = {from:vertexCheck.get(key)!, to:vertexCheck.get(cur_value)!, arrows:'to'};
                edges.push(edge);
            }
        }
        
        htmlCode += `
            <script>
                const vertices = ${JSON.stringify(vertices)};
                const edges = ${JSON.stringify(edges)};

                const container = document.getElementById('network-container');

                const nodes = new vis.DataSet(vertices);
                const networkEdges = new vis.DataSet(edges);
                new vis.Network(
                    container,
                    { nodes, edges: networkEdges },
                    {
                        edges: {
                            color: '#5780afc5',
                            width: 2
                        },
                        physics: {
                            stabilization: true
                        }
                    }
                );
                console.log(typeof vis);
            </script>
        </body>
        </html>
        `;

        this.panel!.webview.html = htmlCode;
    }
}