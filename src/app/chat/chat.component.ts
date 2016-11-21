import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService }       from '../services/chat.service';
import { FormGroup, FormControl, Validators, FormBuilder }  from '@angular/forms';
import { ToastComponent } from '../shared/toast/toast.component';

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
  connection;
  message;
  id;
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
              private toast: ToastComponent) {}

  sendMessage(){
    let x = localStorage.getItem("chatId");
    if (x){
      this.updateDb(x);
      this.chatService.sendMessage(this.message, this.userName, x);
    }else{
      this.saveToDb();
    }
  }
  sendComment(){
    //alert(JSON.stringify(this.addCommentForm.value));
    this.chatService.sendComment(this.addCommentForm.value).subscribe(
      res => {
        this.toast.setMessage("message sent successfully.", "success");
        this.showChatBtn = true;
        this.leaveMessage = false;
        this.addCommentForm.reset();
      },
      error => console.log('error')
    );
  }
  minComment(){
    this.showChatBtn = true;
    this.leaveMessage = false;
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
    this.clearAndScroll(true);
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
        localStorage.setItem("userName",this.userName);
      },
      error => console.log(error)
    );
    setTimeout(() => {
      let g = localStorage.getItem("chatId");
      console.log(g);
      this.chatService.sendMessage(this.message, this.userName, g);
      this.clearAndScroll(true);
    }, 500);
  }

  clearAndScroll(clear){
    setTimeout(() => {
      if (clear){this.message = '';}
      let elem = document.getElementById('chatModal');
      elem.scrollIntoView(false);
    }, 50);
  }

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

  ngOnInit() {
    let prev = localStorage.getItem("chatId") || '';
    this.connection = this.chatService.getMessages().subscribe(message => {

      if (message && message["sender"] !== 'agent'){
        this.messages.push(message);
      }else if (message){
        let tempMsg = {
          content:message["content"],dbId:localStorage.getItem("chatId"),
          id:this.id ||'', sender:"agent",type:"new-message",
          user:message["user"]
        };
        this.messages.push(tempMsg);
      }
      this.clearAndScroll(false);
    });
    setTimeout(() => {
      this.id = this.chatService.sessionId;
      if (prev){
        this.prevMsg(prev);
      };
    }, 3000);

    this.addCommentForm = this.formBuilder.group({
      name: this.name,
      email: this.email,
      comment: this.comment
    });
  }

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

  ngOnDestroy() {
    this.connection.unsubscribe();
  }

  namePrompt(){
    this.showChatBtn = false;
    if (this.agentAvailable){
        let getName = localStorage.getItem('userName');
        if(getName){
          this.userName = getName;
          this.showChatModal = true;
          setTimeout(() => {
            document.getElementById("chatMsg").focus();
            this.clearAndScroll(false);
          }, 50);
        }else{
          this.noUserName = true;
      }
    }else{
      this.leaveMessage = true;
    }
  }

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
