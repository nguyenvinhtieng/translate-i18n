import * as vscode from "vscode";
import path from "path";
import { getTextAndKeysTranslate } from "../utils/translate.utils";
import { selectLanguages } from "../utils/language.utils";
import { translateApiService } from "../services/translate.service";
import {
  getFileContent,
  getFilesFromPaths,
  getFilesOnlyFromPaths,
} from "../utils/vs-code.utils";
import { convertKeyValueArrayToJson } from "../utils/string.utils";

export default function registerTranslateI18nFilesCommand(
  context: vscode.ExtensionContext
) {
  const disposable = vscode.commands.registerCommand(
    "translate-i18n.translateI18nFiles",
    async (uri: vscode.Uri, uris?: vscode.Uri[]) => {
      try {
        const files = getFilesOnlyFromPaths(uris ?? [uri]);

        if (files.length === 0) {
          return vscode.window.showErrorMessage(
            "No files selected for translation."
          );
        }

        const MAX_FILES = 20;
        if (files.length > MAX_FILES) {
          return vscode.window.showErrorMessage(
            `You can only translate up to ${MAX_FILES} files at a time.`
          );
        }

        const { targetLanguage } =
          (await selectLanguages({ isIgnoreSourceLanguage: true })) || {};
        if (!targetLanguage) {
          return vscode.window.showErrorMessage("No target language selected.");
        }

        const destFolder = await vscode.window.showOpenDialog({
          canSelectFiles: false,
          canSelectFolders: true,
          canSelectMany: false,
          openLabel: "Select Destination Folder",
        });

        if (!destFolder?.[0]) {
          return vscode.window.showErrorMessage(
            "No destination folder selected."
          );
        }

        await vscode.workspace.fs.createDirectory(
          vscode.Uri.file(destFolder[0].fsPath)
        );

        const existingFiles = new Set(
          getFilesFromPaths([destFolder[0]]).map((f) => f.fsPath)
        );

        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "Translating Files...",
            cancellable: false,
          },
          async (progress) => {
            for (const [index, file] of files.entries()) {
              const fileName = path.basename(file.fsPath);
              progress.report({
                message: `Translating ${fileName} (${index + 1}/${
                  files.length
                })`,
              });

              const destFilePath = path.join(destFolder[0].fsPath, fileName);
              if (existingFiles.has(destFilePath)) {
                const confirm = await vscode.window.showInformationMessage(
                  `File ${fileName} already exists. Overwrite?`,
                  { modal: true },
                  "Yes",
                  "No"
                );
                if (confirm !== "Yes") continue;
              }

              const fileContent = getFileContent(file.fsPath);
              if (!fileContent) continue;

              const { valueNeedToTranslate, keys } =
                getTextAndKeysTranslate(fileContent);
              const response = await translateApiService({
                targetLanguage,
                valueNeedToTranslate,
              });

              if (!response?.data) continue;

              const translatedContent = keys.length
                ? JSON.stringify(
                    convertKeyValueArrayToJson(keys, response.data.split("\n")),
                    null,
                    2
                  )
                : response.data;

              await vscode.workspace.fs.writeFile(
                vscode.Uri.file(destFilePath),
                new TextEncoder().encode(translatedContent)
              );

              existingFiles.add(destFilePath);
            }
          }
        );
      } catch (error) {
        console.error("Error in translate-i18n command:", error);
        vscode.window.showErrorMessage(
          "An error occurred while translating files. Check the console for details."
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}
