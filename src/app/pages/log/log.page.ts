import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem,
  IonLabel, IonButton, IonButtons, IonBackButton, IonItemSliding,
  IonItemOptions, IonItemOption, IonSpinner
} from '@ionic/angular/standalone';
import { FoodService, FoodItem } from '../../services/food.service';
import { WorkoutService, WorkoutEntry, WorkoutSet } from '../../services/workout.service';

type MealType = 'Uncategorised' | 'Breakfast' | 'Lunch' | 'Dinner';

interface MealSection {
  name: MealType;
  items: { item: FoodItem; index: number }[];
}

interface DayGroup {
  date: string;
  entries: WorkoutEntry[];
}

@Component({
  selector: 'app-log',
  templateUrl: './log.page.html',
  styleUrls: ['./log.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem,
    IonLabel, IonButton, IonButtons, IonBackButton, IonItemSliding,
    IonItemOptions, IonItemOption, IonSpinner
  ],
})
export class LogPage {
  log: FoodItem[] = [];
  totalCalories = 0;
  meals: MealSection[] = [];
  mealOrder: MealType[] = ['Uncategorised', 'Breakfast', 'Lunch', 'Dinner'];
  draggedIndex: number | null = null;

  bodyParts: string[] = [];
  exercises: any[] = [];
  selectedBodyPart = '';
  selectedExercise = '';
  loadingExercises = false;
  currentSet: WorkoutSet = { sets: 1, reps: 0, weight: 0 };
  workoutDays: DayGroup[] = [];

  constructor(
    private foodService: FoodService,
    private workoutService: WorkoutService
  ) {}

  async ionViewWillEnter() {
    await this.loadLog();
    await this.loadWorkouts();
    if (this.bodyParts.length === 0) this.loadBodyParts();
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

  async loadWorkouts() {
    const all = await this.workoutService.getAllWorkouts();
    const grouped: { [date: string]: WorkoutEntry[] } = {};
    all.forEach(w => {
      if (!grouped[w.date]) grouped[w.date] = [];
      grouped[w.date].push(w);
    });
    this.workoutDays = Object.keys(grouped)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map(date => ({ date, entries: grouped[date] }));
  }

  loadBodyParts() {
    this.workoutService.getBodyParts().subscribe({
      next: (parts: string[]) => this.bodyParts = parts,
      error: () => {}
    });
  }

  onBodyPartChange() {
    if (!this.selectedBodyPart) return;
    this.loadingExercises = true;
    this.exercises = [];
    this.selectedExercise = '';
    this.workoutService.getExercisesByBodyPart(this.selectedBodyPart).subscribe({
      next: (ex: any[]) => { this.exercises = ex; this.loadingExercises = false; },
      error: () => { this.loadingExercises = false; }
    });
  }

  async saveWorkout() {
    if (!this.selectedExercise) return;
    const ex = this.exercises.find(e => e.name === this.selectedExercise);
    const entry: WorkoutEntry = {
      id: Date.now().toString(),
      exerciseName: this.selectedExercise,
      bodyPart: ex?.bodyPart || this.selectedBodyPart,
      sets: [{ ...this.currentSet }],
      date: new Date().toDateString()
    };
    await this.workoutService.saveWorkout(entry);
    this.currentSet = { sets: 1, reps: 0, weight: 0 };
    this.selectedExercise = '';
    this.selectedBodyPart = '';
    this.exercises = [];
    await this.loadWorkouts();
  }

  async deleteWorkout(id: string) {
    await this.workoutService.deleteWorkout(id);
    await this.loadWorkouts();
  }

  mealCalories(s: MealSection) { return s.items.reduce((t, e) => t + e.item.calories, 0); }
  mealProtein(s: MealSection) { return s.items.reduce((t, e) => t + e.item.protein, 0); }
  mealCarbs(s: MealSection) { return s.items.reduce((t, e) => t + e.item.carbs, 0); }
  mealFat(s: MealSection) { return s.items.reduce((t, e) => t + e.item.fat, 0); }

  onDragStart(globalIndex: number) { this.draggedIndex = globalIndex; }
  onDragOver(event: DragEvent) { event.preventDefault(); }

  async onDrop(meal: MealType) {
    if (this.draggedIndex === null) return;
    await this.foodService.updateMeal(this.draggedIndex, meal);
    this.draggedIndex = null;
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