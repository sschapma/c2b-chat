import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService }       from '../services/chat.service';
import { FormGroup, FormControl, Validators, FormBuilder }  from '@angular/forms';
import { AlertComponent } from '../shared/alert/alert.component';

@Component({
  selector: 'chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  providers: [ChatService]
})
export class ChatComponent implements OnInit, OnDestroy {

  public messages:any = [];
  public dbMessage:any = {};
  public userName:string = '';
  public connection:any;
  public message:any;
  public id:any;
  public agentAvailable:boolean = false;
  public noUserName:boolean = false;
  public showChatBtn:boolean = true;
  public showChatModal:boolean = false;
  public leaveMessage:boolean = false;

  private addCommentForm: FormGroup;
  private name = new FormControl("", Validators.required);
  private email = new FormControl("", Validators.required);
  private comment = new FormControl("", Validators.required);

  constructor(private chatService:ChatService,
              private formBuilder: FormBuilder,
              private alert: AlertComponent) {}

  // sends a chat message to socket.io then saves to db
  sendMessage(){
    let x = localStorage.getItem("chatId"); //checks if a db id exists
    if (x){
      this.updateDb(x);
      this.chatService.sendMessage(this.message, this.userName, x);
    }else{
      this.saveToDb();
    }
  }
  // if no agent available, sends an email
  sendComment(){
    this.chatService.sendComment(this.addCommentForm.value).subscribe(
      res => {
        this.alert.setMessage("message sent successfully.", "success");
        this.showChatBtn = true;
        this.leaveMessage = false;
        this.addCommentForm.reset();
      },
      error => console.log('error')
    );
  }
  //minimizes widget and displays button
  minComment(){
    this.showChatBtn = true;
    this.leaveMessage = false;
    this.showChatModal = false;
  }
  //if chat exists, pushes message to it
  updateDb(id){
    let msgToPush = {
      message:this.message,
      sender:this.userName,
      socketId:this.id,
      time: new Date()
    };
    this.chatService.editChat(id, msgToPush).subscribe(
      res => {},
      error => console.log('error')
    );
    this.clearAndScroll(true);
  }
  //if new chat, creates db entry
  saveToDb(){
    //chat model
    let chat = {
      userName: this.userName,
      messages: [{
        message:this.message,
        sender:this.userName,
        socketId: this.id,
        time: new Date()
      }]
    };
    //add chat to db
    this.chatService.addChat(chat).subscribe(
      res => {
        let result = res.json();
        this.dbMessage = result;
        localStorage.setItem("chatId",result._id);
        localStorage.setItem("userName",this.userName);
      },
      error => console.log(error)
    );
    //gets db id and sends to socket.io
    setTimeout(() => {
      let g = localStorage.getItem("chatId");
      this.chatService.sendMessage(this.message, this.userName, g);
      this.clearAndScroll(true);
    }, 500);
  }
  //clears input and scrolls to bottom of screen
  clearAndScroll(clear){
    setTimeout(() => {
      if (clear){this.message = '';}
      let elem = document.getElementById('chatModal');
      elem.scrollIntoView(false);
    }, 100);
  }
  //this searches db for id and if it exists, pushes all previous messages to messages array
  prevMsg(id){
    let scope = this;
    this.chatService.findChat(id).subscribe(message => {
      if (message){
      for (let x of message.messages){
        let sentBy = x.sender=='agent' ? 'agent' : 'client';
        let localUser = localStorage.getItem('userName');
        let chgFormat = {
          type: "new-message", sender: sentBy,
          id: this.id, content: x.message, user: localUser, dbId:message._id
        };
        scope.messages.push(chgFormat);
      }
     }
    });
  }
  //functions to run on page load
  ngOnInit() {

    let prev = localStorage.getItem("chatId") || ''; //checks for chat history
    if (prev){this.prevMsg(prev);} //finds chat history by id

    //creates socket.io connection
    this.connection = this.chatService.getMessages().subscribe(message => {
      //pushes client message to message array
      if (message && message["sender"] !== 'agent'){
        this.messages.push(message);
      }else if (message){
        //sets model for agent messages
        let tempMsg = {
          content:message["content"],dbId:localStorage.getItem("chatId"),
          id:this.id ||'', sender:"agent",type:"new-message",
          user:message["user"]
        };
        //pushes agent message to array
        this.messages.push(tempMsg);
        //scrolls to bottom
        this.clearAndScroll(false);
      }
    });

    // timeout to receive sessionId
    setTimeout(() => {
      this.id = this.chatService.sessionId;
    }, 1500);

    //model for email form
    this.addCommentForm = this.formBuilder.group({
      name: this.name,
      email: this.email,
      comment: this.comment
    });
  }
  //verifies session for message filtering
  mySession(message){
    let x = localStorage.getItem("chatId");
    if (!this.id){
      this.id = this.chatService.sessionId;
    }
    if (message.user && message.user==this.userName && x && x == message.dbId){
      return true;
    }
    return false;
  }
  //unsubscribe from socket.io
  ngOnDestroy() {
    this.connection.unsubscribe();
  }
  //handles what to do on icon click
  namePrompt(){
    this.showChatBtn = false; //hides chat button
    //checks if agent is online
    this.chatService.getAgent().subscribe(agent => {
      this.agentAvailable = agent.isOnline;
    });
    //short timeout to wait for response
    setTimeout(() => {
      if (this.agentAvailable){
          //checks for chat history
          let getName = localStorage.getItem('userName');
          if(getName){
            this.userName = getName;
            this.showChatModal = true;
            setTimeout(() => {
              document.getElementById("chatMsg").focus();
              this.clearAndScroll(false);
            }, 50);
          }else{
            //starts new chat
            this.noUserName = true;
        }
      }else{
        // if no agent, displays email form
        this.leaveMessage = true;
      }
    }, 500);
  }
  //opens new chat window
  openChat(){
    if(this.userName){
      this.noUserName = false;
      this.showChatModal = true;
      setTimeout(() => {
        document.getElementById("chatMsg").focus();
        this.clearAndScroll(false);
      }, 50);
    };
  }
}
