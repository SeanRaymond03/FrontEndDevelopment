App Description
https://github.com/SeanRaymond03/FrontEndDevelopment/wiki

CalTrack User Guide

Overview CalTrack is a PWA built with Ionic 7 and Angular for tracking calories, macros and workouts.

Installation Clone the repository, run npm install, then ionic serve. Open http://localhost:8100.

Dashboard Shows daily calorie total, progress bar, macro pie chart, monthly activity calendar and gym streak tracker.

Search Food Search the Open Food Facts API for food. Adjust quantity in grams, calories update live. Common Foods list available when no search is active.

Today's Log Food grouped into Uncategorised, Breakfast, Lunch and Dinner. Drag and drop items between sections. Swipe left to delete. Log Workout section detects nearby gyms via GPS, select body part and exercise from ExerciseDB, enter sets, reps and weight. Workout history grouped by day.

Settings Set bodyweight to auto-calculate calorie and macro targets. Override targets manually. Toggle dark/light mode and font size. All saved locally.

APIs Open Food Facts, ExerciseDB via RapidAPI, Foursquare Places API.

Capacitor Plugin @capacitor/geolocation used for nearby gym detection. Returns Location unavailable on localhost due to CORS, works on deployed builds.

Data Persistence @ionic/storage-angular stores all logs and settings. Food log resets at midnight daily.

*Known Limitations Foursquare gym search requires a deployed environment. ExerciseDB may be slow on free tier rate limits.*

<img width="1917" height="1960" alt="image" src="https://github.com/user-attachments/assets/e31edc20-cff0-4293-aa55-c9457edc087c" />
<img width="1897" height="1959" alt="image" src="https://github.com/user-attachments/assets/5d85d4ab-ceb7-41f7-89cf-43a1836d1b25" />
<img width="1906" height="1945" alt="image" src="https://github.com/user-attachments/assets/8634c1ef-8076-4dbe-8309-7e2104a9e72f" />
