import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Storage } from '@ionic/storage-angular';

export interface FoodItem {
  name: string;
  calories: number;
  quantity: number;
  protein: number;
  fat: number;
  carbs: number;
  meal: 'Uncategorised' | 'Breakfast' | 'Lunch' | 'Dinner';
}

export interface UserGoals {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  weight: number;
}

@Injectable({ providedIn: 'root' })
export class FoodService {
  private apiUrl = 'https://world.openfoodfacts.org/cgi/search.pl';

  constructor(private http: HttpClient, private storage: Storage) {
    this.storage.create().then(() => this.checkDailyReset());
  }

  private async checkDailyReset() {
    const today = new Date().toDateString();
    const lastDate = await this.storage.get('last_log_date');
    if (lastDate !== today) {
      await this.storage.set('food_log', []);
      await this.storage.set('last_log_date', today);
    }
  }

  searchFood(query: string): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}?search_terms=${query}&json=true&page_size=20`).pipe(
      map(res => res.products.filter((p: any) =>
        p.product_name && p.nutriments?.['energy-kcal_100g']
      ))
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
async updateMeal(index: number, meal: FoodItem['meal']): Promise<void> {
  const log = await this.getLog();
  log[index].meal = meal;
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

  async getMacroTotals(): Promise<{ protein: number; fat: number; carbs: number }> {
    const log = await this.getLog();
    return {
      protein: log.reduce((sum, item) => sum + item.protein, 0),
      fat: log.reduce((sum, item) => sum + item.fat, 0),
      carbs: log.reduce((sum, item) => sum + item.carbs, 0),
    };
  }

  async getUserGoals(): Promise<UserGoals> {
    return (await this.storage.get('user_goals')) || {
      calories: 2000,
      protein: 150,
      fat: 65,
      carbs: 250,
      weight: 75
    };
  }

  async saveUserGoals(goals: UserGoals): Promise<void> {
    await this.storage.set('user_goals', goals);
  }
}