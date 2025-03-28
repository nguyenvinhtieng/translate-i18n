import * as vscode from "vscode";
export function getTextSelected(): string | null {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return null;
  }

  const selection = editor.selection;
  return editor.document.getText(selection) || null;
}

export function getFileContent(): string | null {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return null;
  }
  const text = editor.document.getText();
  return text;
}
