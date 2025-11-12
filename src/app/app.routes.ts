import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { StockDetailComponent } from './pages/stock-detail/stock-detail.component';

export const routes: Routes = [
  { path: 'stocks/:symbol', component: StockDetailComponent },
  { path: '', component: HomeComponent },
  { path: '**', redirectTo: '' }
];
