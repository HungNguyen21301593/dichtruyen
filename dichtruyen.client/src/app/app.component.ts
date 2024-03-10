import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import {
  ScanRequest,
  ScanResponse,
  TranslationProxyRequest,
  TranslationProxyResponse,
} from './interface';
import { SettingService } from './setting.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDrawer, MatSidenav } from '@angular/material/sidenav';
import { MatDialog } from '@angular/material/dialog';
import { AdComponent } from './ad/ad.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  @ViewChild('drawer') drawer!: MatDrawer;
  public originalResponse: undefined | ScanResponse = undefined;
  public pageChunks: string[][] = [[]];
  public translatedPageChunks: string[][] = [[]];
  public currentpageIndex = 0;
  url: string = '';
  isloading = false;
  version: 'origin' | 'translated' = 'translated';

  CHUNK_SIZE = 30;
  UNKNOWN = 'Tùy ý';
  PRE_LOAD = 1000;
  title = 'Dọc Truyện Convert';

  constructor(
    private http: HttpClient,
    private ref: ChangeDetectorRef,
    private settingService: SettingService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    var savedData = this.settingService.dataValue;
    if (savedData.url) {
      this.url = savedData.url;
      this.pageChunks = savedData.pageChunks;
      this.translatedPageChunks = savedData.translatedPageChunks;
      this.originalResponse = savedData.originalResponse;
    }
  }

  next() {
    window.scrollTo(0, 0);
    var newchapter = this.getNewChapterUrl(this.url, 1);
    this.url = newchapter;
    this.scanContent(newchapter);
  }

  previous() {
    window.scrollTo(0, 0);
    var newchapter = this.getNewChapterUrl(this.url, -1);
    this.url = newchapter;
    this.scanContent(newchapter);
  }

  getNewChapterUrl(url: string, add: number): string {
    // Use regular expression to search for the number within the URL path
    const match = new RegExp(/(?<=chuong-)\d+/).exec(url);
    if (!match) {
      return url;
    }
    var currentMasterPage = Number(match[0]);
    var nextMasterPage = currentMasterPage + add;
    url = url.replace(currentMasterPage.toString(), nextMasterPage.toString());
    return url;
  }

  retranslate(index: number) {
    this.translateSinglePageChunk(this.pageChunks[index], index);
  }

  openSetting(newurl: string) {
    if (newurl !== this.url) {
      this.drawer.open();
    }
    this.url = newurl;
  }

  scanContent(url: string) {
    if (!url) {
      return;
    }
    this.isloading = true;
    this.originalResponse = undefined;
    this.currentpageIndex = 0;
    this.translatedPageChunks = [[]];
    var request: ScanRequest = {
      url: url,
    };
    const headers: HttpHeaders = new HttpHeaders();
    headers.set('Content-Type', 'application/x-www-form-urlencoded');
    this.http
      .post<ScanResponse>('/api/Scanner', request, { headers: headers })
      .subscribe(
        (result) => {
          this.originalResponse = result;

          this.pageChunks = this.getPageChunk(this.originalResponse);
          this.translatePage(0);
        },
        (error) => {
          console.error(error);
          this.isloading = false;
        }
      );
  }

  getPageChunk(originalMasterPage: ScanResponse) {
    var pages: string[][] = [[]];
    for (let i = 0; i < originalMasterPage.lines.length; i += this.CHUNK_SIZE) {
      const chunk = originalMasterPage.lines.slice(i, i + this.CHUNK_SIZE);
      pages.push(chunk);
    }
    pages.shift();
    return pages;
  }

  async translatePage(targetIndex: number) {
    this.translateSinglePageChunk(this.pageChunks[targetIndex], targetIndex);
  }

  translateSinglePageChunk(page: string[], index: number) {
    this.isloading = true;
    var textToTranslate = page.join('\n');
    var currentSetting = this.settingService.value;
    var request: TranslationProxyRequest = {
      name: currentSetting.name ?? this.UNKNOWN,
      role: currentSetting.role ?? this.UNKNOWN,
      time: currentSetting.time ?? this.UNKNOWN,
      type: currentSetting.type ?? this.UNKNOWN,
      voice: currentSetting.voice ?? this.UNKNOWN,
      promt:
        'hãy sửa lại đoạn truyện sau cho đúng ngữ pháp tiếng việt và chỉ trả về kết quả đã chỉnh sửa',
      exampleInput: ' nhà tôi đang đi về. ',
      exampleOutput: 'tôi đang đi về nhà.',
      textToTranslate: textToTranslate,
    };
    const headers: HttpHeaders = new HttpHeaders();
    headers.set('Content-Type', 'application/x-www-form-urlencoded');
    this.http
      .post<TranslationProxyResponse>('/api/Translate', request, {
        headers: headers,
      })
      .subscribe(
        (result) => {
          console.log(result);
          this.translatedPageChunks[index] = result.translatedLines;
          this.isloading = false;
          this.saveData();
          this.ref.markForCheck();
        },
        (error) => {
          console.error(error);
          this.isloading = false;
          this.ref.markForCheck();
        }
      );
  }

  onScroll(event: any) {

    if (this.isloading) {
      return;
    }
    if (
      event.target.offsetHeight + event.target.scrollTop + this.PRE_LOAD <
      event.target.scrollHeight
    ) {
      return;
    }
    console.log('end');
    if (!this.pageChunks[this.currentpageIndex + 1]) {
      return;
    }
    this.translateSinglePageChunk(
      this.pageChunks[this.currentpageIndex + 1],
      this.currentpageIndex + 1
    );
    this.currentpageIndex = this.currentpageIndex + 1;

  }

  saveData()
  {
    this.settingService.dataValue = {
      url: this.url,
      setting: this.settingService.value,
      pageChunks: this.pageChunks,
      translatedPageChunks: this.translatedPageChunks,
      originalResponse: this.originalResponse,
    };
    this.settingService.saveData();
  }


}
