import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardContent, IonButton, IonProgressBar, IonButtons } from '@ionic/angular/standalone';
import { FoodService, UserGoals } from '../../services/food.service';
import { CommonModule } from '@angular/common';
import { Chart, ArcElement, DoughnutController, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, DoughnutController, Tooltip, Legend);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardContent, IonButton, IonProgressBar, IonButtons],
})
export class DashboardPage {
  @ViewChild('macroChart') macroChartRef!: ElementRef<HTMLCanvasElement>;

  totalCalories = 0;
  dailyGoal = 2000;
  goals: UserGoals = { calories: 2000, protein: 150, fat: 65, carbs: 250, weight: 75 };
  macros = { protein: 0, fat: 0, carbs: 0 };
  private chart: Chart | null = null;

  constructor(private foodService: FoodService) {}

  async ionViewWillEnter() {
    this.goals = await this.foodService.getUserGoals();
    this.dailyGoal = this.goals.calories;
    this.totalCalories = await this.foodService.getTotalCalories();
    this.macros = await this.foodService.getMacroTotals();
    this.renderChart();
  }

  renderChart() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    setTimeout(() => {
      const canvas = this.macroChartRef?.nativeElement;
      if (!canvas) return;
      this.chart = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: ['Protein', 'Fat', 'Carbs'],
          datasets: [{
            data: [this.macros.protein, this.macros.fat, this.macros.carbs],
            backgroundColor: ['#00c853', '#f44336', '#2196f3'],
            borderWidth: 0,
          }]
        },
        options: {
          cutout: '70%',
          plugins: {
            legend: { display: false },
            tooltip: { enabled: true }
          }
        }
      });
    }, 100);
  }

  get progress() {
    return Math.min(this.totalCalories / this.dailyGoal, 1);
  }

  get remaining() {
    return Math.max(this.dailyGoal - this.totalCalories, 0);
  }

  get totalMacroG() {
    return this.macros.protein + this.macros.fat + this.macros.carbs || 1;
  }

  macroPercent(val: number) {
    return Math.round((val / this.totalMacroG) * 100);
  }
}