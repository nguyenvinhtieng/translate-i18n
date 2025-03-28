import * as vscode from "vscode";
import { getTextAndKeysTranslate } from "../utils/translate.utils";
import { selectLanguages } from "../utils/language.utils";
import { translateAndWriteFileService } from "../services/translate.service";

export default function registerTranslateI18nCommand(
  context: vscode.ExtensionContext
) {
  const disposable = vscode.commands.registerCommand(
    "translate-i18n.translateI18n",
    async () => {
      const { valueNeedToTranslate, keys } = getTextAndKeysTranslate();
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

      translateAndWriteFileService({
        sourceLanguage,
        targetLanguage,
        valueNeedToTranslate,
        keys,
      });
    }
  );
  context.subscriptions.push(disposable);
}
