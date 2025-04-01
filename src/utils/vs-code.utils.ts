import * as vscode from "vscode";
import fs from "fs";
import path from "path";

export function getTextSelected(): string | null {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return null;
  }

  const selection = editor.selection;
  return editor.document.getText(selection) || null;
}

export function getFileContent(filePath?: string): string | null {
  // get file content of active file
  if (!filePath) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return null;
    }
    const text = editor.document.getText();
    return text;
  }

  // get file content from file path
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  return fileContent;
}

export const getFilesFromPaths = (paths: vscode.Uri[]): vscode.Uri[] => {
  return paths.reduce((acc, uri) => {
    const stat = fs.statSync(uri.fsPath);
    if (stat.isFile()) {
      acc.push(uri);
    } else if (stat.isDirectory()) {
      const files = fs.readdirSync(uri.fsPath).map((file) => {
        return vscode.Uri.file(path.join(uri.fsPath, file));
      });
      acc.push(...getFilesFromPaths(files));
    }
    return acc;
  }, [] as vscode.Uri[]);
};

export const getFilesOnlyFromPaths = (paths: vscode.Uri[]): vscode.Uri[] => {
  return paths.reduce((acc, uri) => {
    const stat = fs.statSync(uri.fsPath);
    if (stat.isFile()) {
      acc.push(uri);
    }
    return acc;
  }, [] as vscode.Uri[]);
};
