import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonButton, IonButtons, IonBackButton, IonItemSliding, IonItemOptions, IonItemOption, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { FoodService, FoodItem } from '../../services/food.service';

type MealType = 'Uncategorised' | 'Breakfast' | 'Lunch' | 'Dinner';

interface MealSection {
  name: MealType;
  items: { item: FoodItem; index: number }[];
}

@Component({
  selector: 'app-log',
  templateUrl: './log.page.html',
  styleUrls: ['./log.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonButton, IonButtons, IonBackButton, IonItemSliding, IonItemOptions, IonItemOption, IonSelect, IonSelectOption],
})
export class LogPage {
  log: FoodItem[] = [];
  totalCalories = 0;
  meals: MealSection[] = [];
  mealOrder: MealType[] = ['Uncategorised', 'Breakfast', 'Lunch', 'Dinner'];

  constructor(private foodService: FoodService) {}

  async ionViewWillEnter() {
    await this.loadLog();
  }

  async loadLog() {
    this.log = await this.foodService.getLog();
    this.totalCalories = this.log.reduce((s, i) => s + i.calories, 0);
    this.buildSections();
  }

  buildSections() {
    this.meals = this.mealOrder.map(name => ({
      name,
      items: this.log
        .map((item, index) => ({ item, index }))
        .filter(e => (e.item.meal || 'Uncategorised') === name)
    }));
  }

  mealCalories(section: MealSection) {
    return section.items.reduce((s, e) => s + e.item.calories, 0);
  }
  mealProtein(section: MealSection) {
    return section.items.reduce((s, e) => s + e.item.protein, 0);
  }
  mealCarbs(section: MealSection) {
    return section.items.reduce((s, e) => s + e.item.carbs, 0);
  }
  mealFat(section: MealSection) {
    return section.items.reduce((s, e) => s + e.item.fat, 0);
  }

  async changeMeal(globalIndex: number, meal: MealType) {
    await this.foodService.updateMeal(globalIndex, meal);
    await this.loadLog();
  }

  async remove(globalIndex: number) {
    await this.foodService.removeFromLog(globalIndex);
    await this.loadLog();
  }

  async clearAll() {
    await this.foodService.clearLog();
    await this.loadLog();
  }
}