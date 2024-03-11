import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-ad-container',
  templateUrl: './ad.container.component.html',
  styleUrl: './ad.container.component.css',
})
export class AdContainerComponent {
  @ViewChild('adDiv0') adDiv0!: ElementRef<HTMLDivElement> | undefined;
  @ViewChild('adDiv1') adDiv1!: ElementRef<HTMLDivElement> | undefined;
  @ViewChild('adDiv2') adDiv2!: ElementRef<HTMLDivElement> | undefined;
  @ViewChild('adDiv3') adDiv3!: ElementRef<HTMLDivElement> | undefined;
  constructor(public dialog: MatDialog) {}

  ngAfterViewInit() {
    if (this.adDiv0) {
      this.loadad(this.adDiv0, '77155276b520bade5bb993c885f93142');
    }

    if (this.adDiv1) {
      this.loadad(this.adDiv1, 'e8313c9801987ece78d56d4394868f65');
    }

    if (this.adDiv2) {
      this.loadad(this.adDiv2, '86887433aece9e1fd7aed810f14cb971');
    }
  }

  loadad(element: ElementRef<HTMLDivElement>, key:string) {
    var options = this.generateOptions(key);
    const conf = document.createElement('script');
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = `//www.profitablecreativeformat.com/${options.key}/invoke.js`;
    conf.innerHTML = `atOptions = ${JSON.stringify(options)}`;
    element?.nativeElement.append(conf);
    element?.nativeElement.append(s);
  }

  generateOptions(key:string)
  {
    return {
      key: key ,
      format: 'iframe',
      height: 90,
      width: 728,
      params: {},
    };
  }
}
