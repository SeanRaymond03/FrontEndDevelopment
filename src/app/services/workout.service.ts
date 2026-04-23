import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
import { Geolocation } from '@capacitor/geolocation';

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
  location?: string;
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

async getLocation(): Promise<string> {
  try {
    const pos = await Geolocation.getCurrentPosition({ timeout: 10000 });
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    console.log('LAT:', lat, 'LNG:', lng);

    const res = await fetch(
      `https://api.foursquare.com/v3/places/search?query=gym&ll=${lat},${lng}&radius=20000&limit=5`,
      {
        headers: {
          'Authorization': '45PGL00XQ4QVUT30NOMEELBRQG2B4WD3XB2GHAHXJCEGCWNQ',
          'Accept': 'application/json'
        }
      }
    );

    console.log('STATUS:', res.status);
    const data = await res.json();
    console.log('DATA:', JSON.stringify(data));

    if (data.results && data.results.length > 0) {
      return data.results.map((g: any) => g.name).slice(0, 3).join(', ');
    }
    return 'No gyms found nearby';
  } catch (e) {
    console.error('LOCATION ERROR:', e);
    return 'Location unavailable';
  }
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

  async getStreaks(): Promise<{ current: number; best: number }> {
    const workouts = await this.getWorkouts();
    const dates = [...new Set(workouts.map(w => w.date))].map(d => new Date(d)).sort((a, b) => a.getTime() - b.getTime());

    let current = 0;
    let best = 0;
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < dates.length; i++) {
      const d = new Date(dates[i]);
      d.setHours(0, 0, 0, 0);
      if (i === 0) {
        streak = 1;
      } else {
        const prev = new Date(dates[i - 1]);
        prev.setHours(0, 0, 0, 0);
        const diff = (d.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
        streak = diff === 1 ? streak + 1 : 1;
      }
      best = Math.max(best, streak);
      const lastDate = new Date(dates[dates.length - 1]);
      lastDate.setHours(0, 0, 0, 0);
      const diffToday = (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
      current = diffToday <= 1 ? streak : 0;
    }

    return { current, best };
  }
}