import { Injectable } from "@angular/core";
import { BehaviorSubject, filter, map, Observable } from "rxjs";
import { CurrentUserInterface } from "../types/currentUser.interface";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { RegisterRequestInterface } from "../types/registerRequest.interface";
import { LoginRequestInterface } from "../types/loginRequest.interface";
import { SocketService } from "src/app/shared/services/socket.service";

@Injectable()

export class AuthService {

    currentUser$ = new BehaviorSubject<CurrentUserInterface | null | undefined>(undefined); //example of a union type
    //define current user stream ($). can be CUInterface, null, or undefined (default)
    //behaviour subject is simply a representation of a stream
    //undefined - we haven't fetched current user yet; null - we fetched current user and not logged in (unauthorized); currentUserInterface - fetched and logged in

    isLoggedIn$ = this.currentUser$.pipe(
        //list of transformations, comma separated
        filter((currentUser) => currentUser !== undefined),
        map((currentUser) => Boolean(currentUser))
    )

    constructor(private http: HttpClient, private socketService: SocketService) {};

    //define a method to get the current user:
    getCurrentUser(): Observable<CurrentUserInterface> {
        const url = environment.apiUrl + '/user';
        return this.http.get<CurrentUserInterface>(url); 
    }

    //call to register api endpoint:
    register(registerRequest: RegisterRequestInterface): Observable<CurrentUserInterface> {
        const url = environment.apiUrl + '/users';
        return this.http.post<CurrentUserInterface>(url, registerRequest);
    }

    setToken(currentUser: CurrentUserInterface) {
        localStorage.setItem('token', currentUser.token); 
    }

    //call to login api endpoint:
    login(loginRequest: LoginRequestInterface): Observable<CurrentUserInterface> {
        const url = environment.apiUrl + '/users/login';
        return this.http.post<CurrentUserInterface>(url, loginRequest);
    }

    //currentUser is null if not logged in
    setCurrentUser(currentUser: CurrentUserInterface | null ) {
        this.currentUser$.next(currentUser); //change the stream to currentUser
    }

    logout(): void {
        localStorage.removeItem('token');
        this.currentUser$.next(null); //change the stream to null, i.e. the value of currentuser in memory is deleted
        this.socketService.disconnect();
    }
}