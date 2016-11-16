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
    this.updateDb(this.currentChat.dbId);
  }
  updateDb(id){
    let msgToPush = {
      message:this.agentMsg,
      sender:'agent',
      socketId:this.currentChat.id,
      time: new Date()
    };
    //this.dbMessage.messages.push(msgToPush);
    this.chatService.editChat(id, msgToPush).subscribe(
      res => {},
      error => console.log('error')
    );
    this.clearAndScroll();
  }

  clearAndScroll(){
    setTimeout(() => {
      this.agentMsg = '';
      let elem = document.getElementById('chatModal');
      elem.scrollIntoView(false);
    }, 50);
  }

  getId(chat){
    this.currentChat=chat;
    this.chatService.getChats().subscribe(message => {
      for (let x of message){
        for(let y of x.messages){
          if (this.currentChat.id === y.socketId){
            return this.currentChat.dbId = x._id;
          }
        }
      }
    });
    console.log(this.currentChat);
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
    localStorage.clear(); //just for dev, remove for production!!!
  }

}
