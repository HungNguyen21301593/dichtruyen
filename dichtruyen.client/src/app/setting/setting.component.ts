import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SettingService } from '../setting.service';
import { SettingModel } from '../interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css'],
})
export class SettingComponent implements OnInit {
  translatedText: string = '';
  UNKNOWN = 'Tùy ý';
  formGroup: FormGroup = this.fb.group({
    name: [[], undefined],
    role: [this.UNKNOWN, undefined],
    type: [this.UNKNOWN, undefined],
    voice: [this.UNKNOWN, undefined],
    time: [this.UNKNOWN, undefined],
    text: [this.UNKNOWN, undefined],
    promt: ['Hãy sửa lại đoạn truyện sau cho Thuần Việt và chỉ trả về kết quả đã chỉnh sửa:', undefined],
    additional: [[], undefined],
  });
  constructor(
    private fb: FormBuilder,
    private settingService: SettingService,
    private snackBar: MatSnackBar
  ) {}
  ngOnInit(): void {
    this.formGroup.patchValue(this.settingService.settingValue);
  }

  submit() {
    if (!this.formGroup.valid) {
      return;
    }
    const data = this.formGroup.value;
    var newSetting: SettingModel = data;
    this.settingService.saveSetting(newSetting);
    this.snackBar.open('Cập nhật hoàn tất', undefined, { duration: 1000 });
  }

  splitName()
  {
    return this.formGroup.get('name')?.value as string[];
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      var current = this.formGroup.get('name')?.value as string[];
      current.push(value);
      this.formGroup.get('name')?.patchValue(current);
    }

    // Clear the input value
    event.chipInput!.clear();
  }
}
