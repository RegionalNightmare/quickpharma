// src/app/component/header/header.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SearchService } from '../search.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  isLoggedIn = false;
  institutionName = 'Kingston Hospital';
  userInitials = 'KH';
  notificationCount = 3;

  searchQuery = '';
  showDropdown = false;  // ADD THIS
  searchResults: any[] = []; // ADD THIS - replace 'any' with your product type

  constructor(private router: Router, private searchService: SearchService) {}

  onSearchChange() {
    this.searchService.setQuery(this.searchQuery);
    // Add logic here to filter searchResults based on searchQuery
    // For example:
    // this.searchResults = this.allProducts.filter(p => 
    //   p.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    // );
  }

  performSearch() {
    const q = this.searchQuery.trim();
    if (!q) return;
    this.searchService.setQuery(q);
    this.showDropdown = false; // Hide dropdown when searching
    this.router.navigate(['/products'], { queryParams: { search: q }});
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    this.showDropdown = false;
    this.searchService.clearQuery();
  }

  selectProduct(item: any) {
    // Handle product selection
    this.showDropdown = false;
    // Navigate to product detail or do something else
  }
}
