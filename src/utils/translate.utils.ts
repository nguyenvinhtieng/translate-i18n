import * as vscode from "vscode";
import { getFileContent, getTextSelected } from "./vs-code.utils";
import { convertJsonToKeyValueArray, isJsonString } from "./string.utils";
import { TranslateServiceResponse } from "../types/common.types";

export const getTextAndKeysTranslate = (fileContent?: string) => {
  const text = fileContent || getTextSelected() || getFileContent();
  if (!text) {
    return {
      valueNeedToTranslate: [],
      keys: [],
    };
  }

  const isJson = isJsonString(text);
  let keys: string[] = [];

  if (isJson) {
    const val = convertJsonToKeyValueArray(text);
    return {
      valueNeedToTranslate: val?.values || [],
      keys: val?.keys || [],
    };
  }

  return {
    valueNeedToTranslate: [text],
    keys,
  };
};

export const cleanTranslateResponseData = (
  response: TranslateServiceResponse
): TranslateServiceResponse => {
  try {
    let data = response?.data || "";

    if (data.startsWith("```")) {
      const lines = data.split("\n");
      // remove first and 2 last lines
      data = lines.slice(1, lines.length - 2).join("\n");
    }

    while(data.endsWith("\n")) {
      data = data.slice(0, -1);
    }
    while(data.startsWith("\n")) {
      data = data.slice(1);
    }

    return {
      ...response,
      data,
    };
  } catch {
    return response;
  }
};
