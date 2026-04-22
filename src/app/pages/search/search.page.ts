import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonSearchbar, IonList, IonItem, IonLabel, IonButton, IonSpinner, IonBackButton, IonButtons, IonListHeader } from '@ionic/angular/standalone';
import { FoodService, FoodItem } from '../../services/food.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

interface CommonFood {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  serving: number;
}

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar, IonSearchbar, IonList, IonItem, IonLabel, IonButton, IonSpinner, IonBackButton, IonButtons, IonListHeader],
})
export class SearchPage {
  searchQuery = '';
  results: any[] = [];
  loading = false;
  added: number[] = [];
  quantities: number[] = [];
  photoUrl: string | null = null;
  commonAdded: number[] = [];

  commonFoods: CommonFood[] = [
    { name: 'Chicken Breast', calories: 165, protein: 31, fat: 4, carbs: 0, serving: 100 },
    { name: 'White Rice (cooked)', calories: 130, protein: 3, fat: 0, carbs: 28, serving: 100 },
    { name: 'Whole Egg', calories: 155, protein: 13, fat: 11, carbs: 1, serving: 100 },
    { name: 'Banana', calories: 89, protein: 1, fat: 0, carbs: 23, serving: 100 },
    { name: 'Oats', calories: 389, protein: 17, fat: 7, carbs: 66, serving: 100 },
    { name: 'Salmon', calories: 208, protein: 20, fat: 13, carbs: 0, serving: 100 },
    { name: 'Greek Yogurt', calories: 59, protein: 10, fat: 0, carbs: 4, serving: 100 },
    { name: 'Cheddar Cheese', calories: 402, protein: 25, fat: 33, carbs: 1, serving: 100 },
    { name: 'Broccoli', calories: 34, protein: 3, fat: 0, carbs: 7, serving: 100 },
    { name: 'Olive Oil', calories: 884, protein: 0, fat: 100, carbs: 0, serving: 100 },
    { name: 'Almonds', calories: 579, protein: 21, fat: 50, carbs: 22, serving: 100 },
    { name: 'Whole Milk', calories: 61, protein: 3, fat: 3, carbs: 5, serving: 100 },
  ];

  constructor(private foodService: FoodService) {}

  search() {
    if (!this.searchQuery.trim()) return;
    this.loading = true;
    this.results = [];
    this.added = [];
    this.foodService.searchFood(this.searchQuery).subscribe({
      next: (products) => {
        this.results = products;
        this.quantities = products.map(() => 100);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  async takePhoto() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera
    });
    this.photoUrl = image.dataUrl ?? null;
  }

async addFood(product: any, index: number) {
  const quantity = this.quantities[index] || 100;
  const n = product.nutriments;
  const factor = quantity / 100;
  const item: FoodItem = {
    name: product.product_name,
    calories: Math.round((n['energy-kcal_100g'] || 0) * factor),
    protein: Math.round((n['proteins_100g'] || 0) * factor),
    fat: Math.round((n['fat_100g'] || 0) * factor),
    carbs: Math.round((n['carbohydrates_100g'] || 0) * factor),
    quantity,
    meal: 'Uncategorised'
  };
  await this.foodService.addToLog(item);
  this.added.push(index);
}

async addCommonFood(food: CommonFood, index: number) {
  const item: FoodItem = {
    name: food.name,
    calories: food.calories,
    protein: food.protein,
    fat: food.fat,
    carbs: food.carbs,
    quantity: food.serving,
    meal: 'Uncategorised'
  };
  await this.foodService.addToLog(item);
  this.commonAdded.push(index);
}
}