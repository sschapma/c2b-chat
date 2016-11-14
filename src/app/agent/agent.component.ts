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

  agentMessage(){
    this.chatService.agentMessage(this.agentMsg, this.currentChat.user, this.currentChat.id, 'agent');
    this.agentMsg = '';
    setTimeout(() => {
      let elem = document.getElementById('agentChatBody');
      elem.scrollIntoView(false);
    }, 15);
  }

  ngOnInit() {
    $('.chat').hide();
    this.connection = this.chatService.getMessages().subscribe(message => {
      this.messages.push(message);
      let x = {id:message["id"],user:message["user"]};
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

  ngOnDestroy() {
    this.connection.unsubscribe();
  }

}
