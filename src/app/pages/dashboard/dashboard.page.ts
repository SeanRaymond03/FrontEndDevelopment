import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonCard, IonCardContent, IonButton, IonProgressBar, IonButtons
} from '@ionic/angular/standalone';
import { FoodService, UserGoals } from '../../services/food.service';
import { WorkoutService } from '../../services/workout.service';
import { CommonModule } from '@angular/common';
import { Chart, ArcElement, DoughnutController, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, DoughnutController, Tooltip, Legend);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, IonContent, IonHeader, IonTitle, IonToolbar,
    IonCard, IonCardContent, IonButton, IonProgressBar, IonButtons],
})
export class DashboardPage {
  @ViewChild('macroChart') macroChartRef!: ElementRef<HTMLCanvasElement>;

  totalCalories = 0;
  dailyGoal = 2000;
  goals: UserGoals = { calories: 2000, protein: 150, fat: 65, carbs: 250, weight: 75 };
  macros = { protein: 0, fat: 0, carbs: 0 };
  private chart: Chart | null = null;

  calendarWeeks: { date: Date; type: 'gym' | 'rest' | 'future' }[][] = [];

  constructor(
    private foodService: FoodService,
    private workoutService: WorkoutService
  ) {}

  async ionViewWillEnter() {
    this.goals = await this.foodService.getUserGoals();
    this.dailyGoal = this.goals.calories;
    this.totalCalories = await this.foodService.getTotalCalories();
    this.macros = await this.foodService.getMacroTotals();
    this.renderChart();
    await this.buildCalendar();
  }

async buildCalendar() {
  const workouts = await this.workoutService.getAllWorkouts();
  const gymDates = new Set(workouts.map(w => w.date));

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: { date: Date; type: 'gym' | 'rest' | 'future' }[] = [];

  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    const isFuture = d > today;
    days.push({
      date: d,
      type: isFuture ? 'rest' : gymDates.has(d.toDateString()) ? 'gym' : 'rest'
    });
  }

  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const padded: { date: Date; type: 'gym' | 'rest' | 'future' }[] = [
    ...Array(offset).fill({ date: new Date(), type: 'future' }),
    ...days
  ];

  const weeks: { date: Date; type: 'gym' | 'rest' | 'future' }[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  this.calendarWeeks = weeks;
}

  renderChart() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    setTimeout(() => {
      const canvas = this.macroChartRef?.nativeElement;
      if (!canvas) return;
      const total = this.macros.protein + this.macros.fat + this.macros.carbs;
      const data = total === 0 ? [1, 1, 1] : [this.macros.protein, this.macros.fat, this.macros.carbs];
      const colors = total === 0 ? ['#2a2a2a', '#2a2a2a', '#2a2a2a'] : ['#00c853', '#f44336', '#2196f3'];
      this.chart = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: ['Protein', 'Fat', 'Carbs'],
          datasets: [{
            data,
            backgroundColor: colors,
            borderWidth: total === 0 ? 1 : 0,
            borderColor: total === 0 ? '#444' : undefined,
          }]
        },
        options: {
          cutout: '70%',
          plugins: {
            legend: { display: false },
            tooltip: { enabled: total > 0 }
          }
        }
      });
    }, 300);
  }

getStartOffset(): number[] {
  if (!this.calendarWeeks[0]?.length) return [];
  let day = this.calendarWeeks[0][0].date.getDay();
  day = day === 0 ? 6 : day - 1;
  return Array(day).fill(0);
}


  get progress() { return Math.min(this.totalCalories / this.dailyGoal, 1); }
  get remaining() { return Math.max(this.dailyGoal - this.totalCalories, 0); }
  get totalMacroG() { return this.macros.protein + this.macros.fat + this.macros.carbs || 1; }
  macroPercent(val: number) { return Math.round((val / this.totalMacroG) * 100); }
}