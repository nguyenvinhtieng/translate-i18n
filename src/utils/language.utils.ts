import * as vscode from "vscode";
import { SUPPORT_LANGUAGES } from "../constants/common.constant";
export const selectLanguages = async (
  {
    isIgnoreSourceLanguage,
  }: {
    isIgnoreSourceLanguage?: boolean;
  } = {
    isIgnoreSourceLanguage: false,
  }
) => {
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
