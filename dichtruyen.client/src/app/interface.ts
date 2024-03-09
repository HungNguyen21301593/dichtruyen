export interface ScanResponse {
  url: string;
  title: string;
  lines: string[];
}

export interface ScanRequest {
  url: string;
}

export interface SettingModel {
  name: string;
  role: string;
  type: string;
  voice: string;
  time: string;
  promt: string;
  exampleInput: string;
  exampleOutput: string;
}

export interface TranslationProxyRequest extends SettingModel {
  textToTranslate: string;
}

export interface TranslationProxyResponse {
  translatedLines: string[];
}

export interface SavedDataModel {
  url: string;
  setting: SettingModel;
  pageChunks: string[][];
  translatedPageChunks: string[][];
}
