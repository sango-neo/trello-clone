import { Injectable } from "@angular/core";
import { CurrentUserInterface } from "src/app/auth/types/currentUser.interface";
import { io, Socket } from "socket.io-client";
import { environment } from "src/environments/environment";
import { Observable } from "rxjs";

@Injectable()

export class SocketService {

    socket: Socket | undefined;


    setupSocketConnection(currentUser: CurrentUserInterface): void {
        this.socket = io(environment.socketUrl, {
            auth: {
                token: currentUser.token,
            },
        });
    }

    disconnect(): void {
        if(!this.socket) {
            throw new Error('Socket connection is not established');
        }
        this.socket.disconnect();
    }

    emit(eventName: string, message: any): void { //wrapper for emit method from socket io - isolate library
        if (!this.socket) {
            throw new Error('Socket connection is not established');
        }
        this.socket.emit(eventName, message);
    }

    listen<T>(eventName: string): Observable<T> { //syntax funcName<T>(): returnedData<T> is essential for generic types. The actual type will be said later. 
        const socket = this.socket; 
        if(!socket) {
            throw new Error('Socket connection is not established');
        }

        return new Observable((subscriber) => {  
            socket.on(eventName, (data) => {
                subscriber.next(data);
            });
        });
        //create an observable using the observable constructor. it accepts the subscribe func as an arg. the func takes in the subscriber/observer as its arg 
    } //some cases are not comfortable to work with socket io, so we convert to doing things with angular. this function is about taking the data returned from socket io and receiving it in the app as an observable then working with that in the standard way 
}