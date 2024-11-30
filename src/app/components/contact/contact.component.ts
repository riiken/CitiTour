import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from 'src/app/environment';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s 0.1s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, animate('0.5s 0.1s ease-out', style({ opacity: 1, transform: 'translateY(0)' })))
        ], { optional: true })
      ])
    ])
  ]
})
export class ContactComponent {
  private apiURL:string;
  name:string = '';
  email:string = '';
  subject:string= '';
  message:string=''
  constructor(private http:HttpClient){
    this.apiURL = environment.apiURL;
  }
  sendMessage(){
    console.log(this.name);
    if (!this.name || !this.email || !this.message) {
      alert('Please fill in all required fields.');
      return;
    }

    const emailData = {
      name: this.name,
      email: this.email,
      subject: this.subject,
      message: this.message,
    };

    this.http.post(`${this.apiURL}sendEmail`, emailData).subscribe(
      (response: any) => {
        alert('Your message has been sent successfully!');
        this.clearForm();
      },
      (error) => {
        console.error('Failed to send email:', error);
        alert('Failed to send your message. Please try again later.');
      }
    );
  }

  clearForm(): void {
    (document.getElementById('name') as HTMLInputElement).value = '';
    (document.getElementById('email') as HTMLInputElement).value = '';
    (document.getElementById('subject') as HTMLInputElement).value = '';
    (document.getElementById('message') as HTMLTextAreaElement).value = '';
  }
}
