import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';
import { AdContainerComponent } from './ad.container/ad.container.component';

const routes: Routes = [
  { path: '', component: MainComponent, pathMatch: 'full' },
  { path: ':url', component: MainComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
