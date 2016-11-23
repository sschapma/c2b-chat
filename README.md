# Angular 2 Full Stack Client to Business Chat Program

This project is a full stack client to business chat application. It is meant to be a starter project for any small business that wants to interact with their clients in real time.

##Features

###Client Side
If an agent is available, clicking on the chat icon in the bottom right corner will open up a prompt for the user's name, followed by a small chat window. At this point, a customer can chat with an agent.
If no agent is available, a short form will pop up so the customer can send the company an email.
In case there is an issue with the connection, the project sets a localStorage token to continue the chat on a page refresh. (Chats are backed up by the database.)

###Agent Side
Upon loading the agent page, the Auth0 lock modal will pop up for authorization. After authorizing, the agent page will connect with the server to set their status as online, get all open chats from the database, and connect to socket.io. A list of all open chats appears on the left side (with a green dot indicating a chat awaiting reponse). Clicking the user name will display the chat window. When the chat is complete, it can be deleted by clicking the 'X' in the top right corner.

The front-end of this project was generated with [Angular CLI](https://github.com/angular/angular-cli).

This project is based on the MEAN stack, Socket.io and Auth0:
* [**M**ongoose.js](http://www.mongoosejs.com) ([MongoDB](http://www.mongodb.com)): database
* [**E**xpress.js](http://expressjs.com): backend framework
* [**A**ngular 2](https://angular.io): frontend framework
* [**N**ode.js](https://nodejs.org): runtime environment
* [Angular CLI](https://cli.angular.io): project scaffolding
* [Socket.io](http://socket.io): chat client
* [Auth0](http://auth0.com): authorization
* [Bootstrap](http://www.getbootstrap.com): layout and styles
* [Font Awesome](http://fontawesome.io): icons

## Prerequisites
1. Install [Node.js](https://nodejs.org) and [MongoDB](http://www.mongodb.com)
2. Install Angular CLI: `npm i angular-cli -g`
3. From project root folder install all the dependencies: `npm i`

## Run
1. Command window 1: `mongod`: run MongoDB
2. Command window 2: `ng build -w`: build the project and keep watching the files for changes
3. Command window 3: `npm start`: run Express server
4. Go to [localhost:3000](http://localhost:3000)

## Production
Run `ng build -prod` to create a production ready bundle.

## Please open an issue if
* you have any suggestions or advice to improve this project.
* you noticed any problem or error.

## To Do
tests are still to be implemented

## Credit
The basic structure of this project came from the starter project at [Angular 2 Full Stack](https://github.com/DavideViolante/Angular2-Full-Stack).
