import * as vscode from "vscode";
import { getTextAndKeysTranslate } from "../utils/translate.utils";
import { translateAndWriteFileService } from "../services/translate.service";
import { SUPPORT_LANGUAGES } from "../constants/common.constant";

export default function registerTranslateToEnglishCommand(
  context: vscode.ExtensionContext
) {
  const disposable = vscode.commands.registerCommand(
    "translate-i18n.translateToEnglish",
    async () => {
      const { valueNeedToTranslate, keys } = getTextAndKeysTranslate();
      if (!valueNeedToTranslate) {
        vscode.window.showErrorMessage("No text need to be translated!");
        return;
      }

      translateAndWriteFileService({
        targetLanguage: SUPPORT_LANGUAGES.ENGLISH,
        valueNeedToTranslate,
        keys,
      });
    }
  );
  context.subscriptions.push(disposable);
}
