import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ChatService } from './services/chat.service';
import { AuthService } from './services/auth.service';
import * as io from 'socket.io-client';

import { AgentComponent } from './agent/agent.component';
import { ChatComponent } from './chat/chat.component';
import { AlertComponent } from './shared/alert/alert.component';

const routing = RouterModule.forRoot([
    { path: '',      component: HomeComponent },
    { path: 'agent', component: AgentComponent }
]);

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AgentComponent,
    ChatComponent,
    AlertComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    routing
  ],
  providers: [
    ChatService,
    AuthService,
    AlertComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})

export class AppModule { }
