import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonSearchbar, IonList, IonItem, IonLabel, IonButton, IonSpinner, IonBackButton, IonButtons, IonInput, IonThumbnail, IonImg } from '@ionic/angular/standalone';
import { FoodService, FoodItem } from '../../services/food.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar, IonSearchbar, IonList, IonItem, IonLabel, IonButton, IonSpinner, IonBackButton, IonButtons, IonInput, IonThumbnail, IonImg],
})
export class SearchPage {
  searchQuery = '';
  results: any[] = [];
  loading = false;
  added: number[] = [];
  quantities: number[] = [];
  photoUrl: string | null = null;

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
    const caloriesPer100 = product.nutriments['energy-kcal_100g'];
    const item: FoodItem = {
      name: product.product_name,
      calories: Math.round((caloriesPer100 * quantity) / 100),
      quantity
    };
    await this.foodService.addToLog(item);
    this.added.push(index);
  }
}