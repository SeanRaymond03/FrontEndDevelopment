import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel,
  IonInput, IonButton, IonBackButton, IonButtons, IonCard, IonCardContent,
  IonCardHeader, IonCardTitle, IonToggle, IonSelect, IonSelectOption
} from '@ionic/angular/standalone';
import { FoodService, UserGoals } from '../../services/food.service';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel,
    IonInput, IonButton, IonBackButton, IonButtons, IonCard, IonCardContent,
    IonCardHeader, IonCardTitle, IonToggle, IonSelect, IonSelectOption
  ],
})
export class SettingsPage implements OnInit {
  goals: UserGoals = { calories: 2000, protein: 150, fat: 65, carbs: 250, weight: 75 };
  saved = false;
  darkMode = true;
  fontSize = 'medium';

  constructor(private foodService: FoodService, private storage: Storage) {}

  async ngOnInit() {
    this.goals = await this.foodService.getUserGoals();
    this.darkMode = (await this.storage.get('dark_mode')) ?? true;
    this.fontSize = (await this.storage.get('font_size')) ?? 'medium';
    this.applyTheme();
    this.applyFontSize();
  }

  onWeightChange() {
    const w = this.goals.weight;
    this.goals.calories = Math.round(w * 33);
    this.goals.protein = Math.round(w * 2);
    this.goals.carbs = Math.round(w * 3.5);
    this.goals.fat = Math.round(w * 1);
  }

  async toggleDarkMode() {
    await this.storage.set('dark_mode', this.darkMode);
    this.applyTheme();
  }

  async onFontSizeChange() {
    await this.storage.set('font_size', this.fontSize);
    this.applyFontSize();
  }

  applyTheme() {
    document.body.classList.toggle('light-mode', !this.darkMode);
  }

  applyFontSize() {
    const sizes: { [key: string]: string } = { small: '14px', medium: '16px', large: '18px' };
    document.documentElement.style.fontSize = sizes[this.fontSize] || '16px';
  }

  async save() {
    await this.foodService.saveUserGoals(this.goals);
    this.saved = true;
    setTimeout(() => this.saved = false, 2000);
  }
}