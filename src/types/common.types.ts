import { SUPPORT_LANGUAGES } from "../constants/common.constant";

export type SupportLanguages = keyof typeof SUPPORT_LANGUAGES;

export interface TranslateServiceRequestBody {
  sourceLanguage?: string;
  targetLanguage: string;
  valueNeedToTranslate: string;
}

export interface TranslateServiceResponse {
  data: string;
  status: number;
}
