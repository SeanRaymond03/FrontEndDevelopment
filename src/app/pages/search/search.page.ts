import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonSearchbar, IonList, IonItem, IonLabel, IonButton, IonSpinner, IonBackButton, IonButtons } from '@ionic/angular/standalone';
import { FoodService, FoodItem } from '../../services/food.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, IonSearchbar, IonList, IonItem, IonLabel, IonButton, IonSpinner, IonBackButton, IonButtons],
})
export class SearchPage {
  searchQuery = '';
  results: any[] = [];
  loading = false;
  added: number[] = [];

  constructor(private foodService: FoodService) {}

  search() {
    if (!this.searchQuery.trim()) return;
    this.loading = true;
    this.results = [];
    this.foodService.searchFood(this.searchQuery).subscribe({
      next: (products) => {
        this.results = products;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  async addFood(product: any, index: number) {
    const item: FoodItem = {
      name: product.product_name,
      calories: Math.round(product.nutriments['energy-kcal_100g']),
      quantity: 100
    };
    await this.foodService.addToLog(item);
    this.added.push(index);
  }
}