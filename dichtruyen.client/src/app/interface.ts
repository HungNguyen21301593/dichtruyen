import { AdditionalSettting } from './additional-settting.enum';

export interface ScanResponse {
  url: string;
  title: string;
  lines: string[];
}

export interface ScanRequest {
  url: string;
}

export interface SettingModel {
  lastUrl: string;
  name: string;
  role: string;
  type: string;
  voice: string;
  time: string;
  promt: string;
  exampleInput: string;
  exampleOutput: string;
  additional: AdditionalSettting[];
}

export interface TranslationProxyRequest extends SettingModel {
  textToTranslate: string;
  additionalRequirements: string[];
}

export interface TranslationProxyResponse {
  translatedLines: string[];
}

export interface SavedDataModel {
  url: string;
  setting: SettingModel;
  pageChunks: string[][];
  translatedPageChunks: string[][];
  originalResponse: ScanResponse | undefined;
}

export interface AnalyzeResponse {
  name: string;
}


export interface AnalyzeProxyRequest {
  text: string;
  previousResult: AnalyzeResponse;
}
