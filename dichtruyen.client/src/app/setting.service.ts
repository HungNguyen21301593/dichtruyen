import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AdditionalSettting } from './additional-settting.enum';
import {
  AnalyzeProxyRequest,
  AnalyzeResponse,
  NovelsSetting,
  SavedDataModel,
  SettingModel,
  TranslateResult,
} from './interface';
import { Injectable, Type } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SettingService {
  settingKey = 'settingKey';
  dataKey = 'dataKey';

  private initNovelSetting: NovelsSetting = {
    key: '',
    setting: {
      novelName: '',
      name: [],
      role: '',
      time: '',
      type: '',
      voice: '',
      exampleInput: '',
      exampleOutput: '',
      promt: '',
      lastUrl: '',
      additional: [],
      additionalRequirements: [],
    },
  };

  currentSettingValue: BehaviorSubject<NovelsSetting> = new BehaviorSubject(
    this.initNovelSetting
  );

  constructor(
    private db: AngularFireDatabase,
    private http: HttpClient,
    private snackbar: MatSnackBar
  ) {}

  mapToAdditionalRequirements(settings: AdditionalSettting[]) {
    if (!settings) {
      return [];
    }
    return settings.map((key) => {
      switch (key.toString()) {
        case 'GiuNguyenCadao':
          return AdditionalSettting.GiuNguyenCadao.toString();
          break;
        case 'GiuNguyenThuTuTen':
          return AdditionalSettting.GiuNguyenThuTuTen.toString();
          break;
        case 'SoDemHanViet':
          return AdditionalSettting.SoDemHanViet.toString();
          break;
        default:
          return '';
          break;
      }
    });
  }

  async getAll(): Promise<Map<string, NovelsSetting>> {
    var result = (await this.db.object(this.settingKey).query.get()).val();
    return result as Map<string, NovelsSetting>;
  }

  async createNewNovel(value: SettingModel): Promise<NovelsSetting | null> {
    value.additionalRequirements = this.mapToAdditionalRequirements(
      value.additional
    );
    value.name = value.name ?? [];
    var newNovel: NovelsSetting = {
      key: '',
      setting: value,
    };
    var result = this.db.list<NovelsSetting>(this.settingKey).push(newNovel);
    if (!result.key) {
      throw new Error('Failed to save');
    }
    var createdSetting = await this.getNovelSetting(result.key);
    createdSetting.key = result.key ?? '';
    this.currentSettingValue.next(createdSetting);
    await this.saveCurrentNovelSetting();
    return createdSetting;
  }

  async saveCurrentNovelSetting() {
    var currentSetting = this.currentSettingValue.value;
    await this.saveNovelSetting(currentSetting.key, currentSetting.setting);
  }

  async saveNovelSetting(id: string, value: SettingModel) {
    value.additionalRequirements = this.mapToAdditionalRequirements(
      value.additional
    );
    value.name = value.name ?? [];
    var savedSetting = await this.getNovelSetting(id);
    savedSetting.key = id;
    savedSetting.setting = value;
    this.currentSettingValue.next(savedSetting);
    this.db.list<NovelsSetting>(this.settingKey).set(id, savedSetting);
  }

  async getNovelSetting(id: string): Promise<NovelsSetting> {
    var result = await this.db
      .list<NovelsSetting>(`${this.settingKey}/${id}`)
      .query.get();
    var convertedVal = result.val() as NovelsSetting;
    return convertedVal;
  }

  async analyzeText(textToTranslateArray: string[]) {
    if (!this.currentSettingValue.value.key) {
      this.snackbar.open('Phân tích bị lỗi, chưa có cài đặt nào được chọn');
      return;
    }
    var currentNames = this.currentSettingValue.value.setting.name ?? [];
    for (const textToTranslate of textToTranslateArray) {
      var result = await this.analyzeNameFromTextAndPreviousSetting(
        textToTranslate
      );
      if (!result || !result.name) {
        this.snackbar.open('Phân tích bị lỗi');
        return;
      }

      var filteredResults: TranslateResult[] = [];
      result.name.forEach((result) => {
        var first = currentNames
          .reverse()
          .find((n) => n.origin == result.origin);
        if (!first) {
          filteredResults.push(result);
        }
      });
      this.currentSettingValue.value.setting.name = [
        ...new Set(filteredResults),
        ...new Set(currentNames),
      ];
      this.currentSettingValue.next(this.currentSettingValue.value);
      await this.saveCurrentNovelSetting();
    }
  }

  async analyzeNameFromTextAndPreviousSetting(
    textToAnalyze: string
  ): Promise<AnalyzeResponse | undefined> {
    var currrentSetting = this.currentSettingValue.value.setting;
    var request: AnalyzeProxyRequest = {
      text: textToAnalyze,
      setting: {
        name: currrentSetting.name ?? [],
        additionalRequirements: currrentSetting.additionalRequirements,
        promt: currrentSetting.promt,
        role: currrentSetting.role,
        time: currrentSetting.time,
        type: currrentSetting.type,
        additional: currrentSetting.additional,
        exampleInput: currrentSetting.exampleInput,
        exampleOutput: currrentSetting.exampleOutput,
        lastUrl: currrentSetting.lastUrl,
        novelName: currrentSetting.novelName,
        voice: currrentSetting.voice,
      },
    };
    const headers: HttpHeaders = new HttpHeaders();
    headers.set('Content-Type', 'application/x-www-form-urlencoded');
    try {
      var result: AnalyzeResponse | undefined = await this.http
        .post<AnalyzeResponse>('/api/Translate/analyze', request, {
          headers: headers,
        })
        .toPromise();
      if (!result) {
        console.error(result);
        return undefined;
      }
      return {
        name: result?.name,
      };
    } catch (error) {
      return undefined;
    }
  }
}
