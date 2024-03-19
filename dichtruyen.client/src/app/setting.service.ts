import { SavedDataModel, SettingModel } from './interface';
import { Injectable, Type } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SettingService {
  settingKey = 'settingKey';
  dataKey = 'dataKey';
  private initSettingValue: SettingModel = {
    name: [],
    role: '',
    time: '',
    type: '',
    voice: '',
    exampleInput: '',
    exampleOutput: '',
    promt: '',
    lastUrl:'',
    additional:[],
  };

  private initDataValue: SavedDataModel[] = [];

  settingValue = this.initSettingValue;
  dataValue = this.initDataValue;

  constructor() {
    this.settingValue = this.load(this.settingKey);
    this.dataValue = this.load(this.dataKey);
  }

  saveSetting(value: SettingModel) {
    this.settingValue = value;
    this.save(this.settingKey, value);
  }

  loadSetting() {
    return this.load(this.settingKey);
  }

  addData(value: SavedDataModel) {
    var savedData = this.loadArray(this.dataKey) as SavedDataModel[];
    savedData.push(value);
    this.save(this.dataKey, savedData);
  }

  loadLatestData(): SavedDataModel | undefined {
    var savedData = this.loadArray(this.dataKey) as SavedDataModel[];
    if (savedData.length == 0) {
      return undefined;
    }
    return savedData[savedData.length - 1];
  }

  private save(key: string, value: Object) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  private load<T>(key: string): T {
    return JSON.parse(localStorage.getItem(key) ?? '{}') as T;
  }

  private loadArray<T>(key: string): T {
    return JSON.parse(localStorage.getItem(key) ?? '[]') as T;
  }

  reset() {}
}
