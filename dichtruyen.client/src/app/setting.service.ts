import { SavedDataModel, SettingModel } from './interface';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SettingService {
  private settingKey = 'setting';
  private initSettingValue: SettingModel = {
    name: '',
    role: '',
    time: '',
    type: '',
    voice: '',
    exampleInput: '',
    exampleOutput: '',
    promt: '',
  };
  value = this.initSettingValue;

  private dataKey = 'data';
  private initDataValue: SavedDataModel = {
    url:'',
    setting:this.initSettingValue,
    pageChunks: [[]],
    translatedPageChunks: [[]]
  };
  dataValue = this.initDataValue;

  constructor() {
    this.loadSetting();
    this.loadData();
  }

  saveSetting() {
    localStorage.setItem(this.settingKey, JSON.stringify(this.value));
  }

  loadSetting() {
    this.value = JSON.parse(localStorage.getItem(this.settingKey) ?? '{}');
  }

  saveData() {
    localStorage.setItem(this.dataKey, JSON.stringify(this.dataValue));
  }

  loadData() {
    this.dataValue = JSON.parse(localStorage.getItem(this.dataKey) ?? '{}');
  }

  reset() {
    this.value = this.initSettingValue;
    this.saveSetting();
    this.dataValue = this.initDataValue;
    this.saveData();
  }
}
