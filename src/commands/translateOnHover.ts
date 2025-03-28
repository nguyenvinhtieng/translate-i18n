import * as vscode from "vscode";
import { APP_KEY, SUPPORT_LANGUAGES } from "../constants/common.constant";
import { getTextSelected } from "../utils/vs-code.utils";
import { translateApiService } from "../services/translate.service";
const AUTO_TRANSLATE_KEY = "autoTranslateLanguage";
export default function registerTranslateOnHoverCommand(
  context: vscode.ExtensionContext
) {
  //**
  // Handle translate on Hover
  //  */
  const hoverProvide = vscode.languages.registerHoverProvider(
    { scheme: "file" },
    {
      async provideHover() {
        const textSelected = getTextSelected();
        if (!textSelected) {
          return;
        }
        let autoTranslateLanguage = vscode.workspace
          .getConfiguration(APP_KEY)
          .get(AUTO_TRANSLATE_KEY);
        if (
          typeof autoTranslateLanguage !== "string" ||
          !autoTranslateLanguage
        ) {
          return;
        }

        const translateResult = await translateApiService({
          targetLanguage: autoTranslateLanguage,
          valueNeedToTranslate: textSelected,
        });
        const data = translateResult?.data || "";
        return new vscode.Hover(`👉 **Translate:** ${data}`);
      },
    }
  );

  //**
  // Register command for each languge
  //  */
  const prefix = "translate-i18n.autoTranslateTo";
  Object.entries(SUPPORT_LANGUAGES).forEach(([key, value]) => {
    const command = vscode.commands.registerCommand(prefix + key, async () => {
      await vscode.workspace
        .getConfiguration(APP_KEY)
        .update(AUTO_TRANSLATE_KEY, value, vscode.ConfigurationTarget.Global);

      vscode.window.showInformationMessage(
        `Auto translate to ${value} language is enabled!`
      );
    });
    context.subscriptions.push(command);
  });

  context.subscriptions.push(hoverProvide);

  // Off option
  const command = vscode.commands.registerCommand(
    "translate-i18n.offAutoTranslate",
    async () => {
      await vscode.workspace
        .getConfiguration(APP_KEY)
        .update(AUTO_TRANSLATE_KEY, "", vscode.ConfigurationTarget.Global);

      vscode.window.showInformationMessage("Turn off auto translate");
    }
  );
  context.subscriptions.push(command);
}
