import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-business',
  templateUrl: './view-business.component.html',
  styleUrls: ['./view-business.component.css']
})
export class ViewBusinessComponent {
  @Input() business: any = {
    name: 'Pizza Place',
    category: 'Restaurant',
    location: 'Downtown',
    description: 'Best pizza in town'
  };

  reviews = [
    { user: 'Alice', comment: 'Loved the pizza!' },
    { user: 'Bob', comment: 'Great ambiance.' }
  ];

  reviewForm: FormGroup;

  constructor(private fb: FormBuilder,private router:Router) {
    this.reviewForm = this.fb.group({
      comment: ''
    });
  }

  onReviewSubmit() {
    const newReview = this.reviewForm.value;
    this.reviews.push({ user: 'Guest', ...newReview });
    this.reviewForm.reset();
  }

  goBack(){
    this.router.navigate([''])
  }

}
