import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService }       from '../services/chat.service';

@Component({
  selector: 'app-agent',
  templateUrl: './agent.component.html',
  styleUrls: ['./agent.component.css'],
  providers: [ChatService]
})
export class AgentComponent implements OnInit, OnDestroy {
  public messages:any = [];
  public userName:string = '';
  public activeChats:any = [];
  currentChat;
  connection;
  message;
  agentMsg;
  id;
  chatId;

  constructor(private chatService:ChatService) {}

  sendMessage(){
    this.chatService.sendMessage(this.message, this.userName);
    this.message = '';
    setTimeout(() => {
      let elem = document.getElementById('chatModal');
      elem.scrollIntoView(false);
    }, 15);
  }
  agentMessage(){
    this.chatService.agentMessage(this.agentMsg, this.currentChat.user, this.currentChat.id, 'agent');
    this.agentMsg = '';
    setTimeout(() => {
      let elem = document.getElementById('chatModal');
      elem.scrollIntoView(false);
    }, 15);
  }

  ngOnInit() {
    this.connection = this.chatService.getMessages().subscribe(message => {
      this.messages.push(message);
      let x = {id:message.id,user:message.user};
      let idExists = false;
      for (let i=0;i<this.activeChats.length;i++){
        if(this.activeChats[i].id == x.id){
          idExists=true;
        };
      };
      if (!idExists){
        this.activeChats.push(x);
      };
    });
  }

  viewWindow(chatWindow){
    this.chatId=chatWindow;
    console.log(this.id);
  }

  checkSession(message){
    console.log(message);
    if (message.id === this.chatId){
      return true;
    }return false;
  }

  ngOnDestroy() {
    this.connection.unsubscribe();
  }

}
