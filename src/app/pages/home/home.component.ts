import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HomeHeaderComponent } from './components/header/home-header.component';
import { HomePrimaryPanelContainerComponent } from './components/primary-panel/home-primary-panel.container';
import { SearchPanelContainerComponent } from '../../components/search-panel/search-panel.container';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HomeHeaderComponent, HomePrimaryPanelContainerComponent, SearchPanelContainerComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {}
