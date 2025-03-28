import * as vscode from "vscode";

import https from "node:https";

import {
  TranslateServiceRequestBody,
  TranslateServiceResponse,
} from "../types/common.types";
import { convertKeyValueArrayToJson } from "../utils/string.utils";
import { cleanTranslateResponseData } from "../utils/translate.utils";

//**
// Translate API Service
// */

// Create an `https.Agent` instance to ignore SSL certificate
const agent = new https.Agent({ rejectUnauthorized: false });
export const translateApiService = async (
  body: TranslateServiceRequestBody
): Promise<TranslateServiceResponse | null> => {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch("https://www.i18ncode.com/api/translate", {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      agent,
    });

    return cleanTranslateResponseData(
      (await response.json()) as TranslateServiceResponse
    );
  } catch (error) {
    return null;
  }
};

//****************************************************************//

interface TranslateParams {
  sourceLanguage?: string;
  targetLanguage: string;
  valueNeedToTranslate: string;
  keys: string[];
}
export const translateAndWriteFileService = async (params: TranslateParams) => {
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
      const response = await translateApiService(body);
      const { data, status } = response || {};

      if (!response || status !== 200 || !data) {
        vscode.window.showErrorMessage(
          "Error when translating, please try again later!"
        );
        return;
      }

      // Translate text
      if (keys.length === 0) {
        const newDocument = await vscode.workspace.openTextDocument({
          language: "txt",
          content: data,
        });
        await vscode.window.showTextDocument(
          newDocument,
          vscode.ViewColumn.Beside
        );
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

      await vscode.window.showTextDocument(
        newDocument,
        vscode.ViewColumn.Beside
      );
      await vscode.languages.setTextDocumentLanguage(newDocument, "json");
    }
  );
};
