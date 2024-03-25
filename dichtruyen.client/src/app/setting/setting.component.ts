import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SettingService } from '../setting.service';
import { NovelsSetting, SettingModel } from '../interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChipInputEvent } from '@angular/material/chips';
import { AdditionalSettting } from '../additional-settting.enum';
import { AngularFireDatabase } from '@angular/fire/compat/database';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css'],
})
export class SettingComponent implements OnInit {
  translatedText: string = '';
  UNKNOWN = 'Tùy ý';
  selectedNovelId: string | null | undefined = undefined;
  selectedNovel: NovelsSetting | null = null;
  allnovels: Map<string, NovelsSetting> | undefined;
  formGroup: FormGroup = this.fb.group({
    // novelId: ['', undefined],
    novelName: ['', undefined],
    name: [[], undefined],
    role: [this.UNKNOWN, undefined],
    type: [this.UNKNOWN, undefined],
    voice: [this.UNKNOWN, undefined],
    time: [this.UNKNOWN, undefined],
    text: [this.UNKNOWN, undefined],
    promt: [
      'Hãy sửa lại đoạn truyện sau cho Thuần Việt và chỉ trả về kết quả đã chỉnh sửa:',
      undefined,
    ],
    additional: [[], undefined],
  });
  constructor(
    private fb: FormBuilder,
    public settingService: SettingService,
    private snackBar: MatSnackBar,
    private ref: ChangeDetectorRef
  ) {}
  async ngOnInit(): Promise<void> {
    this.allnovels = await this.settingService.getAll();
    console.log(this.allnovels);
  }

  changed(value: string) {
    this.selectedNovelId = value;
    if (this.selectedNovelId === '') {
      this.selectedNovel = null;
      this.formGroup.reset();
      this.ref.markForCheck();
      return;
    }
    if (this.allnovels === undefined) {
      return;
    }
    this.selectedNovel = (this.allnovels as any)[this.selectedNovelId];

    if (!this.selectedNovel?.setting) {
      return;
    }
    this.formGroup.patchValue(this.selectedNovel?.setting);
    this.ref.markForCheck();
  }

  async submit() {
    if (!this.formGroup.valid) {
      return;
    }
    const data = this.formGroup.value;
    var newSetting: SettingModel = data;
    if (!this.selectedNovelId) {
      this.selectedNovel = await this.settingService.createNewNovel(
        newSetting
      );
      this.snackBar.open('Tạo mới hoàn tất', undefined, { duration: 1000 });
      this.allnovels = await this.settingService.getAll();
      return;
    } else {
      await this.settingService.saveNovelSetting(
        this.selectedNovelId,
        newSetting
      );
      this.snackBar.open('Cập nhật hoàn tất', undefined, { duration: 1000 });
      this.allnovels = await this.settingService.getAll();
      return;
    }
  }

  splitName() {
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
