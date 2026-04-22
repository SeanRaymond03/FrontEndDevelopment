import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Storage } from '@ionic/storage-angular';

export interface FoodItem {
  name: string;
  calories: number;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class FoodService {
  private apiUrl = 'https://world.openfoodfacts.org/cgi/search.pl';

  constructor(private http: HttpClient, private storage: Storage) {
    this.storage.create();
  }

  searchFood(query: string): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}?search_terms=${query}&json=true&page_size=20`).pipe(
      map(res => res.products.filter((p: any) => p.product_name && p.nutriments?.['energy-kcal_100g']))
    );
  }

  async getLog(): Promise<FoodItem[]> {
    return (await this.storage.get('food_log')) || [];
  }

  async addToLog(item: FoodItem): Promise<void> {
    const log = await this.getLog();
    log.push(item);
    await this.storage.set('food_log', log);
  }

  async removeFromLog(index: number): Promise<void> {
    const log = await this.getLog();
    log.splice(index, 1);
    await this.storage.set('food_log', log);
  }

  async clearLog(): Promise<void> {
    await this.storage.set('food_log', []);
  }

  async getTotalCalories(): Promise<number> {
    const log = await this.getLog();
    return log.reduce((sum, item) => sum + item.calories, 0);
  }
}