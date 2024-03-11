import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import {
  SavedDataModel,
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

  constructor(
  ) {}
  ngOnInit(): void {
  }
}
