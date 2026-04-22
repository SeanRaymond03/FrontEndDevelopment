import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonBackButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle } from '@ionic/angular/standalone';
import { FoodService, UserGoals } from '../../services/food.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonBackButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle],
})
export class SettingsPage implements OnInit {
  goals: UserGoals = { calories: 2000, protein: 150, fat: 65, carbs: 250, weight: 75 };
  saved = false;

  constructor(private foodService: FoodService) {}

  async ngOnInit() {
    this.goals = await this.foodService.getUserGoals();
  }

  onWeightChange() {
    const w = this.goals.weight;
    this.goals.calories = Math.round(w * 33);
    this.goals.protein = Math.round(w * 2);
    this.goals.carbs = Math.round(w * 3.5);
    this.goals.fat = Math.round(w * 1);
  }

  async save() {
    await this.foodService.saveUserGoals(this.goals);
    this.saved = true;
    setTimeout(() => this.saved = false, 2000);
  }
}