import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-ad',
  templateUrl: './ad.component.html',
  styleUrl: './ad.component.css',
})
export class AdComponent implements OnInit {
  onScroll = (event: any) => {};
  constructor(public dialog: MatDialog) {}
  async ngOnInit(): Promise<void> {

    await this.delay(1000);
    this.onScroll = (event: any) => {
      if (
        event.target.offsetHeight + event.target.scrollTop + 500 <
        event.target.scrollHeight
      ) {
        return;
      }
      this.dialog.closeAll();
    };
  }

  async pageScroll() {
    window.scrollBy(0, 1);
    await this.delay(100);
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
