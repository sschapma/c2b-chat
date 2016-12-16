import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class ChatService {
  private url = 'http://localhost:3000/'; //only used in development
  private socket;
  public sessionId;

  private headers = new Headers({ 'Content-Type': 'application/json', 'charset': 'UTF-8' });
  private options = new RequestOptions({ headers: this.headers });

  constructor(private http: Http) { }

  //sends a message via client
  sendMessage(message, userName, dbId){
    this.socket.emit('add-message', message, userName, dbId);
  }
  //sends a message via agent
  agentMessage(message, userName, dbId, id, agent) {
    this.socket.emit('add-message', message, userName, dbId, id, agent);
  }
  //connects with socket.io
  getMessages() {
    let observable = new Observable(observer => {
      this.socket = io(); //add this.url for localhost development
      this.socket.on('abc', (data) => {
        this.sessionId = data;
      });
      this.socket.on('message', (data) => {
        console.log('socket works!');
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  // chat api calls
    //get all chats from database
    getChats() {
      return this.http.get('/chats').map(res => res.json());
    }
    //find chat by id
    findChat(id) {
      return this.http.get(`/chat/${id}`).map(res => res.json());
    }
    //add chat to database
    addChat(chat) {
      return this.http.post("/chat", JSON.stringify(chat), this.options);
    }
    //pushes a new message to an existing chat db entry
    editChat(id, chat) {
      return this.http.put(`/chat/${id}`, JSON.stringify(chat), this.options);
    }
    //deletes chat
    deleteChat(id) {
      return this.http.delete(`/chat/${id}`, this.options);
    }
    //sends an email when agent is offline
    sendComment(comment) {
      return this.http.post("/sendEmail", JSON.stringify(comment), this.options);
    }
    // get agents online status
    getAgent() {
      return this.http.get('/agentStatus').map(res => res.json());
    }
    //sets agent status to online
    agentOnline() {
      let agent = {isOnline:true};
      return this.http.post("/agentStatus", JSON.stringify(agent), this.options);
    }
    //sets agent status to offline
    agentOffline() {
      let agent = {isOnline:false};
      return this.http.post("/agentStatus", JSON.stringify(agent), this.options);
    }
}
