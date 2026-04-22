import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonButton, IonButtons, IonBackButton, IonItemSliding, IonItemOptions, IonItemOption } from '@ionic/angular/standalone';
import { FoodService, FoodItem } from '../../services/food.service';

@Component({
  selector: 'app-log',
  templateUrl: './log.page.html',
  styleUrls: ['./log.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonButton, IonButtons, IonBackButton, IonItemSliding, IonItemOptions, IonItemOption],
})
export class LogPage {
  log: FoodItem[] = [];
  totalCalories = 0;

  constructor(private foodService: FoodService) {}

  async ionViewWillEnter() {
    this.log = await this.foodService.getLog();
    this.totalCalories = await this.foodService.getTotalCalories();
  }

  async remove(index: number) {
    await this.foodService.removeFromLog(index);
    this.log = await this.foodService.getLog();
    this.totalCalories = await this.foodService.getTotalCalories();
  }

  async clearAll() {
    await this.foodService.clearLog();
    this.log = [];
    this.totalCalories = 0;
  }
}