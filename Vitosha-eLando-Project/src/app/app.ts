import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Vitosha-eLando-Project');
  private http = inject(HttpClient);
  constructor(){
    // Removed health check to fix prerendering during build
  }
  

}
