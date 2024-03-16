import { AdditionalSettting } from './../additional-settting.enum';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';

import { MatDrawer } from '@angular/material/sidenav';
import { MatDialog } from '@angular/material/dialog';
import {
  SavedDataModel,
  ScanRequest,
  ScanResponse,
  TranslationProxyRequest,
  TranslationProxyResponse,
} from '../interface';
import { AdComponent } from '../ad/ad.component';
import { SettingService } from '../setting.service';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app.main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})
export class MainComponent implements OnInit {
  @ViewChild('drawer') drawer!: MatDrawer;
  public originalResponse: undefined | ScanResponse = undefined;
  public pageChunks: string[][] = [[]];
  public translatedPageChunks: string[][] = [[]];
  public currentpageIndex = 0;
  url: string = '';
  isloading = false;
  version: 'origin' | 'translated' = 'translated';

  CHUNK_SIZE = 80;
  UNKNOWN = 'Tùy ý';
  PRE_LOAD = 2000;
  title = 'Dọc Truyện Convert';

  constructor(
    private http: HttpClient,
    private ref: ChangeDetectorRef,
    private settingService: SettingService,
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((queryParams) => {
      var urlFromRoute = queryParams['url'];
      if (urlFromRoute) {
        this.url = urlFromRoute;
        this.scanContent(this.url);
      }
    });
  }

  submit() {
    if (!this.url) {
      this.snackbar.open('Bạn vui lòng nhập nguồn nhé', undefined, {
        duration: 3000,
      });
      return;
    }

    if (!this.url.includes('metruyencv') && !this.url.includes('69shu')) {
      this.snackbar.open(
        'Bạn vui lòng nhập nguồn từ ***metruyencv, 69shu*** nhé',
        undefined,
        { duration: 3000 }
      );
      return;
    }

    this.router.navigate([''], { queryParams: { url: this.url } });
  }

  next() {
    var nextChapter = this.getNewChapterUrl(this.url, 1);
    this.router.navigate([''], { queryParams: { url: nextChapter } });
  }

  previous() {
    var nextChapter = this.getNewChapterUrl(this.url, -1);
    this.router.navigate([''], { queryParams: { url: nextChapter } });
  }

  reset() {
    this.originalResponse = undefined;
    this.pageChunks = [[]];
    this.translatedPageChunks = [[]];
  }

  runads() {
    this.dialog.open(AdComponent, { hasBackdrop: true, disableClose: true });
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
    this.translatedPageChunks[index] = [];
    var textToTranslate = page.join('\n');
    var currentSetting = this.settingService.settingValue;
    var request: TranslationProxyRequest = {
      name: currentSetting.name ?? this.UNKNOWN,
      role: currentSetting.role ?? this.UNKNOWN,
      time: currentSetting.time ?? this.UNKNOWN,
      type: currentSetting.type ?? this.UNKNOWN,
      voice: currentSetting.voice ?? this.UNKNOWN,
      lastUrl: this.url,
      promt: currentSetting.promt,
      exampleInput: ' nhà tôi đang đi về. ',
      exampleOutput: 'tôi đang đi về nhà.',
      textToTranslate: textToTranslate,
      additional: currentSetting.additional,
      additionalRequirements: this.mapToAdditionalRequirements(
        currentSetting.additional
      ),
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
          this.saveCurrentChapterToData();
          this.ref.markForCheck();
        },
        (error) => {
          console.error(error);
          this.isloading = false;
          this.ref.markForCheck();
        }
      );
  }

  mapToAdditionalRequirements(settings: AdditionalSettting[]) {
    return settings.map((key) => {
      switch (key.toString()) {
        case 'GiuNguyenCadao':
          return AdditionalSettting.GiuNguyenCadao.toString();
          break;
        case 'GiuNguyenThuTuTen':
          return AdditionalSettting.GiuNguyenThuTuTen.toString();
          break;
        default:
          return '';
          break;
      }
    });
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

  saveCurrentChapterToData() {
    var value = {
      url: this.url,
      setting: this.settingService.settingValue,
      pageChunks: this.pageChunks,
      translatedPageChunks: this.translatedPageChunks,
      originalResponse: this.originalResponse,
    };
    this.settingService.addData(value);
  }

  async copy() {
    await navigator.clipboard.writeText(this.translatedPageChunks.join('\r\n'));
    var sumOflines = this.translatedPageChunks.map(t=>t.length).reduce((a, b) => a + b, 0)
    this.snackbar.open(
      `Đã sao chép: ${sumOflines} dòng`,
      undefined,
      { duration: 3000 }
    );
  }
}
