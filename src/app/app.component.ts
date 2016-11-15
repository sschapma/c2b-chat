import { Component, OnInit, OnDestroy } from '@angular/core';
//import { Control }           from '@angular/common';
import { ChatService }       from './services/chat.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ChatService]
})


export class AppComponent implements OnInit, OnDestroy {
  public messages:any = [];
  public dbMessage:any = {};
  public userName:string = '';
  connection;
  message;
  id;

  constructor(private chatService:ChatService) {}

  sendMessage(){
    this.chatService.sendMessage(this.message, this.userName, this.id);
    let x = localStorage.getItem("chatId");
    if (x){
      this.updateDb(x);
    }else{
      this.saveToDb();
    }
  }
  updateDb(id){
    let msgToPush = {
      message:this.message,
      sender:this.userName,
      socketId:this.id,
      time: new Date()
    };
    //this.dbMessage.messages.push(msgToPush);
    this.chatService.editChat(id, msgToPush).subscribe(
      res => {},
      error => console.log('error')
    );
    this.clearAndScroll();
  }

  saveToDb(){
    let chat = {
      userName: this.userName,
      messages: [{
        message:this.message,
        sender:this.userName,
        socketId: this.id,
        time: new Date()
      }]
    };
    this.chatService.addChat(chat).subscribe(
      res => {
        let result = res.json();
        this.dbMessage = result;
        console.log(this.dbMessage);
        localStorage.setItem("chatId",result._id);
      },
      error => console.log(error)
    );
    this.clearAndScroll();
  }

  clearAndScroll(){
    setTimeout(() => {
      this.message = '';
      let elem = document.getElementById('chatModal');
      elem.scrollIntoView(false);
    }, 50);
  }

  ngOnInit() {
    this.connection = this.chatService.getMessages().subscribe(message => {
      this.messages.push(message);
    });
    setTimeout(() => {
      this.id = this.chatService.sessionId;
      console.log(this.chatService.sessionId);
    }, 3000);
  }

  mySession(user, id){
    if (!this.id){
      this.id = this.chatService.sessionId;
    }
    if (user && user==this.userName && this.id && this.id == id){
      return true;
    }
    return false;
  }

  ngOnDestroy() {
    this.connection.unsubscribe();
  }

  namePrompt(){
    $('#chatBtn').hide();
    $('#name').show();
    $('#userName').focus();
  }

  openChat(){
    if(this.userName){
      $('#name').hide();
      $('#chatModal').show();
      $('#chatMsg').focus();
    };
  }
  sendChat(){
      let msg = $('#chatMsg').val();
      if (!msg){ return };
      $('#chatMsg').val('');
      let tempMsg = {
        sender:'client',
        content:msg
      };
      this.messages.push(tempMsg);
      setTimeout(() => {
        let elem = document.getElementById('chatModal');
        elem.scrollIntoView(false);
      }, 15);
  }
}
