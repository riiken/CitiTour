import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddBlogComponent } from './add-blog/add-blog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-blogs',
  templateUrl: './blogs.component.html',
  styleUrls: ['./blogs.component.css']
})
export class BlogsComponent {
  // Data Variables
  blogs = [
    {
      id: 1,
      title: 'The Future of Technology',
      author: 'John Doe',
      authorId: 101,
      date: '2024-11-20',
      summary: 'Explore how AI and machine learning are shaping the future.',
      tags: ['Technology', 'AI', 'Future'],
      likes: 120,
    },
    {
      id: 2,
      title: 'Health and Wellness Tips',
      author: 'Jane Smith',
      authorId: 102,
      date: '2024-11-18',
      summary: 'Simple strategies to maintain a healthy lifestyle.',
      tags: ['Health', 'Wellness', 'Lifestyle'],
      likes: 95,
    },
  ];

  categories = ['Technology', 'Health', 'Finance', 'Lifestyle'];

  constructor(private dialog:MatDialog,private router:Router) {}

  ngOnInit(): void {}

  openBlog(blogId: number): void {
    console.log(`Opening blog with ID: ${blogId}`);
    this.router.navigate(['/blog/',blogId])
    // Navigate to the blog details page
  }

  filterByCategory(category: string): void {
    console.log(`Filtering blogs by category: ${category}`);
    // Add filtering logic based on the category
  }

  viewAuthorProfile(authorId: number): void {
    console.log(`Viewing profile for author with ID: ${authorId}`);
    // Navigate to the author profile page
  }

  openCreateBlogModal(): void {
    const dialogRef = this.dialog.open(AddBlogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.blogs.push(result); // Add the new blog to the list
      }
    });
  }
}
