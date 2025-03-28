import * as vscode from "vscode";
import registerTranslateI18nCommand from "./commands/translateI18n";
import registerTranslateI18nDetectCommand from "./commands/translateI18nDetect";
import registerTranslateToEnglishCommand from "./commands/translateToEnglish";
import registerTranslateOnHoverCommand from "./commands/translateOnHover";

export function activate(context: vscode.ExtensionContext) {
  registerTranslateI18nCommand(context);
  registerTranslateI18nDetectCommand(context);
  registerTranslateToEnglishCommand(context);
  registerTranslateOnHoverCommand(context);
}

export function deactivate() {}
