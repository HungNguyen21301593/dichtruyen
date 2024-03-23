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
  name: TranslateResult[];
  role: string;
  type: string;
  voice: string;
  time: string;
  promt: string;
  exampleInput: string;
  exampleOutput: string;
  additional: AdditionalSettting[];
  additionalRequirements: string[];
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
  originalResponse: ScanResponse | undefined;
}

export interface AnalyzeResponse {
  name: TranslateResult[];
}

export interface TranslateResult
{
  origin:string;
  translated:string;
}


export interface AnalyzeProxyRequest {
  text: string;
  setting: SettingModel;
}
