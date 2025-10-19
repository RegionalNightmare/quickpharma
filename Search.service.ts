// src/app/services/search.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchQuery = new BehaviorSubject<string>('');
  query$ = this.searchQuery.asObservable();

  setQuery(query: string) {
    this.searchQuery.next(query);
  }

  clearQuery() {
    this.searchQuery.next('');
  }
}
