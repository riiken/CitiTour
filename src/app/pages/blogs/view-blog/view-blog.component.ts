import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-view-blog',
  templateUrl: './view-blog.component.html',
  styleUrls: ['./view-blog.component.css']
})
export class ViewBlogComponent {
  blog: any = {
    id: 1,
    title: "The Future of Web Development",
    author: "John Doe",
    date: "2024-11-24",
    summary: "Web development is constantly evolving with new technologies, frameworks, and tools that are changing the way websites are built.",
    content: `
      Web development is at the heart of the digital revolution. In recent years, there has been a growing demand for web developers due to the increased reliance on websites and web applications. 
      In this post, we will explore the future of web development, the latest trends, and the tools that developers will use to create the next generation of websites.
      The advent of technologies like AI, 5G, and blockchain is expected to significantly impact the way websites are built and operated.
    `,
    tags: ["Web Development", "Future Tech", "JavaScript", "AI"],
    likes: 120,
    authorId: 101,
  };

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const blogId = this.route.snapshot.paramMap.get('id');
    this.loadBlogDetail(blogId);
  }

  loadBlogDetail(id: any): void {
    // Fetch the blog by ID, this could be an API call
    this.blog = {
      id: 1,
      title: "The Future of Web Development",
      author: "John Doe",
      date: "2024-11-24",
      summary: "Web development is constantly evolving with new technologies, frameworks, and tools that are changing the way websites are built.",
      content: `
        Web development is at the heart of the digital revolution. In recent years, there has been a growing demand for web developers due to the increased reliance on websites and web applications. 
        In this post, we will explore the future of web development, the latest trends, and the tools that developers will use to create the next generation of websites.
        The advent of technologies like AI, 5G, and blockchain is expected to significantly impact the way websites are built and operated.
      `,
      tags: ["Web Development", "Future Tech", "JavaScript", "AI"],
      likes: 120,
      authorId: 101,
    }
  }

  likeBlog(): void {
    this.blog.likes += 1;
  }
}
