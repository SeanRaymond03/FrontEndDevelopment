import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardContent, IonButton, IonProgressBar, IonLabel } from '@ionic/angular/standalone';
import { FoodService } from '../../services/food.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardContent, IonButton, IonProgressBar, IonLabel],
})
export class DashboardPage implements OnInit {
  totalCalories = 0;
  dailyGoal = 2000;

  constructor(private foodService: FoodService) {}

  async ngOnInit() {
    this.totalCalories = await this.foodService.getTotalCalories();
  }

  async ionViewWillEnter() {
    this.totalCalories = await this.foodService.getTotalCalories();
  }

  get progress() {
    return Math.min(this.totalCalories / this.dailyGoal, 1);
  }

  get remaining() {
    return Math.max(this.dailyGoal - this.totalCalories, 0);
  }
}