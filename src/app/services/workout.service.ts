import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage-angular';

export interface WorkoutSet {
  sets: number;
  reps: number;
  weight: number;
}

export interface WorkoutEntry {
  id: string;
  exerciseName: string;
  bodyPart: string;
  sets: WorkoutSet[];
  date: string;
}

@Injectable({ providedIn: 'root' })
export class WorkoutService {
  private apiUrl = 'https://exercisedb.p.rapidapi.com';
  private headers = new HttpHeaders({
    'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
    'x-rapidapi-key': '3d7a3d3510msh8f06d5467e657dep17e662jsn406853db406e'
  });

  constructor(private http: HttpClient, private storage: Storage) {
    this.storage.create();
  }

  getBodyParts(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/exercises/bodyPartList`, { headers: this.headers });
  }

  getExercisesByBodyPart(bodyPart: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/exercises/bodyPart/${bodyPart}?limit=30&offset=0`, { headers: this.headers });
  }

  async getWorkouts(): Promise<WorkoutEntry[]> {
    return (await this.storage.get('workouts')) || [];
  }

  async saveWorkout(entry: WorkoutEntry): Promise<void> {
    const workouts = await this.getWorkouts();
    workouts.push(entry);
    await this.storage.set('workouts', workouts);
  }

  async deleteWorkout(id: string): Promise<void> {
    const workouts = await this.getWorkouts();
    await this.storage.set('workouts', workouts.filter(w => w.id !== id));
  }

  async getTodayWorkouts(): Promise<WorkoutEntry[]> {
    const today = new Date().toDateString();
    const all = await this.getWorkouts();
    return all.filter(w => w.date === today);
  }

  async getAllWorkouts(): Promise<WorkoutEntry[]> {
    return (await this.storage.get('workouts')) || [];
  }
}