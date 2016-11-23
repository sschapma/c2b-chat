import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService }       from '../services/chat.service';
import { AlertComponent } from '../shared/alert/alert.component';
import {AuthService} from '../services/auth.service';

@Component({
  selector: 'app-agent',
  templateUrl: './agent.component.html',
  styleUrls: ['./agent.component.css'],
  providers: [ChatService, AuthService]
})
export class AgentComponent implements OnInit, OnDestroy {
  public messages:any = [];
  public userName:string = '';
  public activeChats:any = [];
  public showChatBtn:boolean = false;
  public currentChat:any;
  public connection:any;
  public message:any;
  public agentMsg:any;
  public id:any;
  public chatId:any;
  public currentDbId:any;

  constructor(private chatService:ChatService,
              private alert: AlertComponent,
              private auth: AuthService) {}

  //displays auth0 login modal
  login() {
    this.auth.login();
  }
  //logs out and changes agent status to offline
  logout() {
    this.chatService.agentOffline().subscribe(agent => {});
    this.auth.logout();
  }
  //checks if logged in
  isLoggedIn(){
    return this.auth.loggedIn();
  }
  //adds message via socket.io and backup via db
  agentMessage(){
    this.chatService.agentMessage(this.agentMsg, this.currentChat.user,this.currentChat.dbId, this.currentChat.id, 'agent');
    this.updateDb(this.currentChat.dbId);
    this.clrAndScrl(); //scrolls to bottom of window
  }
  //if the last message was from a client, displays a green dot next to their name (unread message)
  newMessage(chat){
    let tmpArray = [];
    for (let msg of this.messages){
      if (msg.dbId === chat.dbId){
        tmpArray.push(msg.sender);
      }
    }
    let sender = tmpArray[tmpArray.length-1];
    if (sender == 'client'){return true}
    return false;
  }
  //if db entry exists, push new message to it
  updateDb(id){
    //set model for db
    let msgToPush = {
      message:this.agentMsg,
      sender:'agent',
      socketId:this.currentChat.id,
      time: new Date()
    };
    //send to db
    this.chatService.editChat(id, msgToPush).subscribe(
      res => {},
      error => console.log('error')
    );
    //scroll
    this.clrAndScrl();
  }
  //delete chat from database
  deleteChat() {
    let chat = this.currentChat;
    this.chatService.deleteChat(chat.dbId).subscribe(
      res => {
        //remove name from list of active chats
        var pos = this.activeChats.map(chat => { return chat.dbId }).indexOf(chat.dbId);
        this.activeChats.splice(pos, 1);
        //clears current chat screen
        this.currentChat = '';
        //verifies successful delete on screen
        this.alert.setMessage("item deleted successfully.", "success");
      },
      error => console.log(error)
    );
  }
  //scrolls to bottom of screen
  clrAndScrl(){
    setTimeout(() => {
      this.agentMsg = '';
      let el = document.getElementById('agentChatBody');
      if (el){
        el.scrollIntoView(false);
      };
    }, 50);
  }
  //functions to run on page load
  ngOnInit() {
    //checks if logged in, if not, display auth0 modal
    if(!this.isLoggedIn()){
      this.login();
    }
    //gets all chats from database
    this.chatService.getChats().subscribe(message => {
       //changes model to fit front end
       for (let z of message){
         //make list of active chats
         let y = {user:z["userName"],dbId:z["_id"]};
         this.activeList(y);
         for (let x of z.messages){
           //loop through messages, change models, push to array
           let snd = x.sender=='agent'?'agent':'client';
           let msg = {content:x.message,dbId:z._id,id:x.socketId,
            sender:snd,type:"new-message",user:z.userName};
           this.messages.push(msg);
         }
       }
       //scroll
       this.clrAndScrl();
    });
    //connect to socket.io
    this.connection = this.chatService.getMessages().subscribe(message => {
      // if message from client, push to array
      if (message && message["sender"] !== 'agent'){
        this.messages.push(message);
      }else if (message){
        //change model for agent messages
        let tempMsg = {
          content:message["content"],dbId:this.currentChat.dbId,
          id:this.currentChat.id ||'', sender:"agent",type:"new-message",
          user:this.currentChat.user
        };
        //push message to array
        this.messages.push(tempMsg);
      }
      //pushes message info to activeList function
      let x = {id:message["id"],user:message["user"],dbId:message["dbId"]};
      if (x.id && x.user && x.dbId){
        //checks if it is a new user or existing
        this.activeList(x);
      }
      //scroll
      this.clrAndScrl();
    });
    //sets agent status to online
    this.chatService.agentOnline().subscribe(agent => {});
  }
  //gets information about user to display chat
  getInfo(chat){
    this.currentDbId = chat.dbId;
    this.currentChat = chat;
    this.clrAndScrl();
  }
  //disconnect from socket.io and set agent status to offline
  ngOnDestroy() {
    this.connection.unsubscribe();
    this.chatService.agentOffline().subscribe(agent => {});
  }
  //checks if message is from a new user, if it is, push user to active array
  activeList(x){
    let idExists = false;
    for (let i=0;i<this.activeChats.length;i++){
      if(this.activeChats[i].dbId == x.dbId){
        idExists=true;
      };
    };
    if (!idExists){
      this.activeChats.push(x);
    };
  }

}
