import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SettingService } from '../setting.service';
import { SettingModel } from '../interface';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css'],
})
export class SettingComponent implements OnInit {

  translatedText: string = '';
  UNKNOWN = 'Tùy ý';
  formGroup: FormGroup = this.fb.group({
    name: [this.UNKNOWN, undefined],
    role: [this.UNKNOWN, undefined],
    type: [this.UNKNOWN, undefined],
    voice: [this.UNKNOWN, undefined],
    time: [this.UNKNOWN, undefined],
    text: [this.UNKNOWN, undefined],
  });
  constructor(
    private fb: FormBuilder,
    private settingService: SettingService,
    private snackBar: MatSnackBar
  ) {}
  ngOnInit(): void {
    this.formGroup.patchValue(this.settingService.value);
  }

  submit() {
    if (!this.formGroup.valid) {
      return;
    }
    const data = this.formGroup.value;
    var newSetting: SettingModel = data;
    this.settingService.value = newSetting;
    this.settingService.saveSetting();
    this.snackBar.open("Cập nhật hoàn tất", undefined,{duration:1000})
  }
}
