import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-blog',
  templateUrl: './add-blog.component.html',
  styleUrls: ['./add-blog.component.css']
})
export class AddBlogComponent {

  createBlogForm: FormGroup;
  tags: string[] = [];

  constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<any>) {
    this.createBlogForm = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      summary: ['', Validators.required],
      content: ['', Validators.required],  // Add content field for detailed blog body
      tags: ['']
    });
  }

  // Add tag to the list when user presses enter
  addTag(event: any): void {
    if (event.key === 'Enter' && this.createBlogForm.value.tags) {
      this.tags.push(this.createBlogForm.value.tags);
      this.createBlogForm.patchValue({ tags: '' }); // Reset input after adding
    }
  }

  // Handle form submission
  submitNewBlog(): void {
    const newBlog = {
      title: this.createBlogForm.value.title,
      author: this.createBlogForm.value.author,
      summary: this.createBlogForm.value.summary,
      content: this.createBlogForm.value.content,
      tags: this.tags,
      date: new Date().toLocaleDateString(),
      likes: 0,
      id: Math.floor(Math.random() * 10000) // Random ID for demo purposes
    };

    this.dialogRef.close(newBlog); // Close the dialog and pass the new blog data back
  }

  // Close dialog without saving
  closeDialog(): void {
    this.dialogRef.close();
  }
}
