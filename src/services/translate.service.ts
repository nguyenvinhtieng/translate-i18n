import https from "node:https";

import {
  TranslateServiceRequestBody,
  TranslateServiceResponse,
} from "../types/common.types";

const agent = new https.Agent({ rejectUnauthorized: false });

export const translateService = async (
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

    return (await response.json()) as TranslateServiceResponse;
  } catch (error) {
    return null;
  }
};
