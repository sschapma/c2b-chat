import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';

export class ChatService {
  private url = 'http://localhost:3000';
  private socket;
  public sessionId;
  public activeChats:any=[];

  sendMessage(message, userName){
    this.socket.emit('add-message', message, userName);
  }

  agentMessage(message, id, userName, agent) {
    this.socket.emit('add-message', message, id, userName, agent);
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
      this.socket.on('agent-message', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }
}
