import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-ad',
  templateUrl: './ad.component.html',
  styleUrl: './ad.component.css',
})
export class AdComponent {
  /**
   *
  //  */
  constructor(public dialog: MatDialog) {}
  onScroll(event: any) {
    if (
      event.target.offsetHeight + event.target.scrollTop + 400 <
      event.target.scrollHeight
    ) {
      return;
    }
    this.dialog.closeAll();
  }
}
