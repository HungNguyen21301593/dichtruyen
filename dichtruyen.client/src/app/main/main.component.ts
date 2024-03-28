import { AnalyzeResponse, NovelsSetting, TranslateResult } from './../interface';
import { AdditionalSettting } from './../additional-settting.enum';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';

import { MatDrawer } from '@angular/material/sidenav';
import { MatDialog } from '@angular/material/dialog';
import {
  AnalyzeProxyRequest,
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
  allnovels: Map<string, NovelsSetting> | undefined;
  url: string = '';
  isloading = false;
  version: 'origin' | 'translated' = 'translated';

  CHUNK_SIZE = 80;
  UNKNOWN = 'Tùy ý';
  PRE_LOAD = 2000;
  title = 'Dọc Truyện Convert';
  analyzeIndex=0;
  translateIndex=0;

  constructor(

    private ref: ChangeDetectorRef,
    private settingService: SettingService,
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  async ngOnInit() {
    this.allnovels = await this.settingService.getAll();
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
    if (!this.url.includes('metruyencv') && !this.url.includes('69shu') &&  !this.url.includes('songyunshu')) {
      this.snackbar.open(
        'Bạn vui lòng nhập nguồn từ ***metruyencv, 69shu***, songyunshu*** nhé',
        undefined,
        { duration: 3000 }
      );
      return;
    }
    this.scanContent(this.url);
    // this.router.navigate([''], { queryParams: { url: this.url } });
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

  novelSettingChanged(novelSetting: NovelsSetting)
  {
    this.settingService.currentSettingValue.next(novelSetting);
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

  urlChanged(newurl: string) {
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
          this.isloading = false;
          this.ref.markForCheck();
        },
        (error) => {
          console.error(error);
          this.snackbar.open('Lỗi', 'Ok', { duration: 100000 });
          this.isloading = false;
        }
      );
  }

  async translateToTheEnd() {
    this.analyzeIndex = 0;
    this.translateIndex = 0;

    for (let index = 0; index < this.pageChunks.length; index++) {
      await this.analyzeSingleChunk(this.pageChunks[index]);
      this.analyzeIndex = (index+1) *100/this.pageChunks.length;
    }

    for (let index = 0; index < this.pageChunks.length; index++) {
      await this.translateSinglePageChunk(this.pageChunks[index], index);
      this.translateIndex = (index+1) *100/this.pageChunks.length;
    }
  }

  async analyzeSingleChunk( pageChunk: string[]) {
    this.isloading = true;
    try {
      var textArrray = [pageChunk.join('\r\n') ?? ''];
    await this.settingService.analyzeText(textArrray);
    } catch (error) {
      this.snackbar.open(`Lỗi ${error}`, 'Ok', { duration: 100000 });
    }
    finally
    {
      this.isloading = false;
    }
  }

  async analyzeToTheEnd() {
    this.isloading = true;
    try {
      var textArrray = this.pageChunks.map(pageChunk=>pageChunk.join('\r\n') ?? '');
    await this.settingService.analyzeText(textArrray);
    } catch (error) {
      this.snackbar.open(`Lỗi ${error}`, 'Ok', { duration: 100000 });
    }
    finally
    {
      this.isloading = false;
    }
  }

  getPageChunk(originalMasterPage: ScanResponse) {
    var pages: string[][] = [[]];
    var formartedlines = originalMasterPage.lines
      .filter((l) => l)
      .map((l) =>
        l
          .replaceAll('\t', '')
          .replaceAll(
            /[\u00A0\u1680​\u180e\u2000-\u2009\u200a​\u200b​\u202f\u205f​\u3000]/g,
            ''
          )
      );
    for (let i = 0; i < formartedlines.length; i += this.CHUNK_SIZE) {
      const chunk = formartedlines.slice(i, i + this.CHUNK_SIZE);
      pages.push(chunk);
    }
    pages.shift();
    return pages;
  }

  async translatePage(targetIndex: number) {
    await this.translateSinglePageChunk(
      this.pageChunks[targetIndex],
      targetIndex
    );
  }

  async translateSinglePageChunk(page: string[], index: number) {
    this.isloading = true;
    var currentSetting = this.settingService.currentSettingValue.value.setting;
    this.translatedPageChunks[index] = [];
    var textToTranslate = page.join('\n');
    currentSetting.name.reverse().forEach((name) => {
      textToTranslate = textToTranslate.replaceAll(
        name.origin,
        name.translated
      );
    });

    var request: TranslationProxyRequest = {
      novelName: currentSetting.novelName,
      name: currentSetting.name ?? [],
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
    try {
      var result = await this.http
        .post<TranslationProxyResponse>('/api/Translate', request, {
          headers: headers,
        })
        .toPromise();
      if (!result) {
        console.error(result);
        this.snackbar.open('Lỗi', 'Ok', { duration: 100000 });
        this.isloading = false;
        return;
      }
      console.log(result);
      this.translatedPageChunks[index] = result.translatedLines.map((line) =>
        this.removeChineseCharacters(line)
      );
      this.isloading = false;
      this.ref.markForCheck();
    } catch (error) {
      console.error(error);
      this.snackbar.open('Lỗi', 'Ok', { duration: 100000 });
      this.isloading = false;
      this.ref.markForCheck();
    }
  }

  removeChineseCharacters(text: string) {
    console.log(text);
    return text.replace(/[\u4E00-\u9FFF]/g, '');
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
        case 'SoDemHanViet':
          return AdditionalSettting.SoDemHanViet.toString();
          break;
        default:
          return '';
          break;
      }
    });
  }

  async copy() {
    await navigator.clipboard.writeText(this.translatedPageChunks.join('\r\n'));
    var sumOflines = this.translatedPageChunks
      .map((t) => t.length)
      .reduce((a, b) => a + b, 0);
    this.snackbar.open(`Đã sao chép: ${sumOflines} dòng`, undefined, {
      duration: 3000,
    });
  }
}
