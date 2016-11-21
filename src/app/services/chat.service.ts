import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class ChatService {
  private url = 'http://localhost:3000';
  private socket;
  public sessionId;
  public activeChats:any=[];

  private headers = new Headers({ 'Content-Type': 'application/json', 'charset': 'UTF-8' });
  private options = new RequestOptions({ headers: this.headers });

  constructor(private http: Http) { }

  sendMessage(message, userName, dbId){
    this.socket.emit('add-message', message, userName, dbId);
  }

  agentMessage(message, userName, dbId, id, agent) {
    this.socket.emit('add-message', message, userName, dbId, id, agent);
  }


  getMessages() {
    let observable = new Observable(observer => {
      this.socket = io(this.url);
      this.socket.on('abc', (data) => {
        this.sessionId = data;
      });
      this.socket.on('message', (data) => {
        observer.next(data);
      });
      /*this.socket.on('agent-message', (data) => {
        observer.next(data);
      });*/
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  // chat api calls
    getChats() {
      return this.http.get('/chats').map(res => res.json());
    }

    findChat(id) {
      return this.http.get(`/chat/${id}`).map(res => res.json());
    }

    addChat(chat) {
      //console.log(JSON.parse(chat));
      return this.http.post("/chat", JSON.stringify(chat), this.options);
    }

    sendComment(comment) {
      return this.http.post("/sendEmail", JSON.stringify(comment), this.options);
    }

    editChat(id, chat) {
      return this.http.put(`/chat/${id}`, JSON.stringify(chat), this.options);
    }

    deleteChat(id) {
      return this.http.delete(`/chat/${id}`, this.options);
    }
}
