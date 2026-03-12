import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('qagent.generateTest', () => {

		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			vscode.window.showErrorMessage('No active editor found!');
			return;
		}

		const selection = editor.selection;
		const selectedText = editor.document.getText(selection);

		if (!selectedText || selectedText.trim() === '') {
			vscode.window.showWarningMessage('Please highlight a function first!');
			return;
		}

		console.log('Selected function:', selectedText);
		vscode.window.showInformationMessage('QAgent: Generate Test clicked!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
