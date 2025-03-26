import * as vscode from "vscode";
import {
  convertJsonToKeyValueArray,
  convertKeyValueArrayToJson,
  isJsonString,
} from "./utils/string.utils";
import { SUPPORT_LANGUAGES } from "./constants/common.constant";
import { translateService } from "./services/translate.service";

const getTextTranslate = () => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("Please open a file need to translate!");
    return;
  }

  let valueNeedToTranslate;
  let keys: string[] = [];

  const selection = editor.selection;
  const text = editor.document.getText(selection);
  if (text) {
    // Translate selected text
    const isJson = isJsonString(text);
    if (isJson) {
      const val = convertJsonToKeyValueArray(text);
      if (val) {
        keys = val.keys;
        valueNeedToTranslate = val.values.join("\n");
      }
    } else {
      valueNeedToTranslate = text;
    }
  } else {
    // Translate entire file
    const isJsonFile = editor.document.fileName.endsWith(".json");
    if (!isJsonFile) {
      vscode.window.showErrorMessage("Please select a valid JSON file!");
      return null;
    }

    const text = editor.document.getText();
    const isJson = isJsonString(text);

    if (isJson) {
      const val = convertJsonToKeyValueArray(text);
      if (val) {
        keys = val.keys;
        valueNeedToTranslate = val.values.join("\n");
      }
    } else {
      vscode.window.showErrorMessage(
        "Not valid JSON format, please check again!"
      );
    }
  }

  return { valueNeedToTranslate, keys };
};

const selectLanguages = async (isIgnoreSourceLanguage: boolean = false) => {
  let sourceLanguage: string | undefined;
  if (!isIgnoreSourceLanguage) {
    sourceLanguage = await vscode.window.showQuickPick(
      Object.values(SUPPORT_LANGUAGES).sort(),
      {
        title: "Language Selection",
        placeHolder: "Select the source language",
        ignoreFocusOut: true,
        matchOnDescription: true,
      }
    );

    if (!sourceLanguage) {
      return;
    }
  }

  const targetLanguage = await vscode.window.showQuickPick(
    Object.values(SUPPORT_LANGUAGES)
      .filter((lang) => lang !== (sourceLanguage || ""))
      .sort(),
    {
      title: "Target Language Selection",
      placeHolder: sourceLanguage
        ? `Select the target language (source: ${sourceLanguage})`
        : "Select the target language",
      ignoreFocusOut: true,
      matchOnDescription: true,
    }
  );

  if (!targetLanguage) {
    return;
  }

  return { sourceLanguage, targetLanguage };
};

interface TranslateParams {
  sourceLanguage?: string;
  targetLanguage: string;
  valueNeedToTranslate: string;
  keys: string[];
}
const translate = (params: TranslateParams) => {
  const { sourceLanguage, targetLanguage, valueNeedToTranslate, keys } = params;
  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Translating...",
      cancellable: false,
    },
    async () => {
      const body = {
        sourceLanguage,
        targetLanguage,
        valueNeedToTranslate,
      };
      const response = await translateService(body);
      const { data, status } = response || {};

      if (!response || status !== 200 || !data) {
        vscode.window.showErrorMessage(
          "Error when translating, please try again later!"
        );
        return;
      }

      vscode.window.showInformationMessage("Translation success!");

      // Translate text
      if (keys.length === 0) {
        const newDocument = await vscode.workspace.openTextDocument({
          language: "txt",
          content: data,
        });
        await vscode.window.showTextDocument(newDocument);
        return;
      }

      // Translate JSON
      const texts = data.split("\n");
      const json = convertKeyValueArrayToJson(keys, texts);

      if (!json) {
        vscode.window.showErrorMessage("Error when reverting JSON!");
        vscode.env.clipboard.writeText(data);
        return;
      }

      const newDocument = await vscode.workspace.openTextDocument({
        language: "json",
        content: JSON.stringify(json, null, 2),
      });

      await vscode.window.showTextDocument(newDocument);
      await vscode.languages.setTextDocumentLanguage(newDocument, "json");
    }
  );
};

const runTranslate = async () => {
  const textTranslate = getTextTranslate();
  if (!textTranslate) {
    return;
  }
  const { valueNeedToTranslate, keys } = textTranslate;
  if (!valueNeedToTranslate) {
    vscode.window.showErrorMessage("No text need to be translated!");
    return;
  }

  const languages = await selectLanguages();
  if (!languages) {
    vscode.window.showErrorMessage("No language selected!");
    return;
  }
  const { sourceLanguage, targetLanguage } = languages;

  translate({ sourceLanguage, targetLanguage, valueNeedToTranslate, keys });
};

const runTranslateDetect = async () => {
  const textTranslate = getTextTranslate();
  if (!textTranslate) {
    return;
  }
  const { valueNeedToTranslate, keys } = textTranslate;
  if (!valueNeedToTranslate) {
    vscode.window.showErrorMessage("No text need to be translated!");
    return;
  }

  const languages = await selectLanguages(true);
  if (!languages) {
    vscode.window.showErrorMessage("No language selected!");
    return;
  }
  const { targetLanguage } = languages;

  translate({ targetLanguage, valueNeedToTranslate, keys });
};

const translateToEnglish = async () => {
  const textTranslate = getTextTranslate();
  if (!textTranslate) {
    return;
  }
  const { valueNeedToTranslate, keys } = textTranslate;
  if (!valueNeedToTranslate) {
    vscode.window.showErrorMessage("No text need to be translated!");
    return;
  }

  translate({
    targetLanguage: SUPPORT_LANGUAGES.ENGLISH,
    valueNeedToTranslate,
    keys,
  });
};

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "translate-i18n.translateI18n",
    () => {
      runTranslate();
    }
  );

  const disposableDetect = vscode.commands.registerCommand(
    "translate-i18n.translateI18nDetect",
    () => {
      runTranslateDetect();
    }
  );

  const disposableToEnglish = vscode.commands.registerCommand(
    "translate-i18n.translateToEnglish",
    () => {
      translateToEnglish();
    }
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(disposableDetect);
  context.subscriptions.push(disposableToEnglish);
}

export function deactivate() {}
