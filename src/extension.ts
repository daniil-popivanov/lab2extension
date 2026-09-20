import * as vscode from 'vscode';
import { WebPanel } from './graphBuilding.js'

export function activate(context: vscode.ExtensionContext) {	// Запускает исполнение плагина
	const disposable = vscode.commands.registerCommand('lab2extention.showGraph', () => {
		const panel:WebPanel = new WebPanel(context);
		panel.makeGraph();
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}	// Деактивирует плагин.
