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
  public showChatBtn:boolean = false;
  currentChat;
  connection;
  message;
  agentMsg;
  id;
  chatId;

  constructor(private chatService:ChatService) {}

  agentMessage(){
    this.chatService.agentMessage(this.agentMsg, this.currentChat.user,this.currentChat.dbId, this.currentChat.id, 'agent');
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
      //let element = document.getElementById('agentChatBody');
      //if (element != null){
        //element.scrollIntoView(false); //doesnt work, have no idea why
        //console.log(element);
      //};
    }, 50);
  }


  ngOnInit() {
    $('.chat').hide();
    this.chatService.getChats().subscribe(message => {
      //{content:"asdf",dbId:"582c3a7f88207c40b4312c4e",id:"JmszF8ZEIlqwSfTRAAAF",
       //sender:"client",type:"new-message",user:"Julian"}
       console.log(message);
       for (let z of message){
         let y = {user:z["userName"],dbId:z["_id"]};
         this.activeList(y);
         for (let x of z.messages){
           let snd = x.sender=='agent'?'agent':'client';
           let msg = {content:x.message,dbId:z._id,id:x.socketId,
            sender:snd,type:"new-message",user:z.userName};
           this.messages.push(msg);
         }
       }
    });
    this.connection = this.chatService.getMessages().subscribe(message => {
      if (message && message["sender"] !== 'agent'){
        this.messages.push(message);
      }else if (message){
        let tempMsg = {
          content:message["content"],dbId:this.currentChat.dbId,
          id:this.currentChat.id ||'', sender:"agent",type:"new-message",
          user:this.currentChat.user
        };
        console.log(tempMsg);
        this.messages.push(tempMsg);
      }
      let x = {id:message["id"],user:message["user"],dbId:message["dbId"]};
      if (x.id && x.user && x.dbId){
        this.activeList(x);
      }
    });
  }
  getInfo(chat){
    console.log(chat);
    this.currentChat = chat;
  }

  ngOnDestroy() {
    this.connection.unsubscribe();
  }
  activeList(x){
    let idExists = false;
    //console.log(x);
    for (let i=0;i<this.activeChats.length;i++){
      //console.log(this.activeChats[i]);
      if(this.activeChats[i].dbId == x.dbId){
        idExists=true;
      };
    };
    if (!idExists){
      this.activeChats.push(x);
      //console.log(this.activeChats);
    };
  }

}
