import { HttpErrorResponse } from "@angular/common/http";
import { Component } from "@angular/core";
import { Validators, UntypedFormBuilder } from "@angular/forms";
import { Router } from "@angular/router";
import { SocketService } from "src/app/shared/services/socket.service";
import { AuthService } from "../../services/auth.service";
import { CurrentUserInterface } from "../../types/currentUser.interface";

@Component({
    selector: 'auth-login',
    templateUrl: './login.component.html'
})

export class LoginComponent {
    errorMessage: string | null = null; //instantiation + initialization

    form = this.fb.group({
        email: ['', Validators.required],
        password: ['', Validators.required],
    })

    constructor(
        private fb: UntypedFormBuilder, 
        private authService: AuthService, 
        private router: Router,
        private socketService: SocketService,
        ) {}

    onSubmit(): void {
        this.authService.login(this.form.value).subscribe({
            next: (currentUser: CurrentUserInterface) => {
                //block processed if http request good
                console.log('currentUser', currentUser);
                this.authService.setToken(currentUser);
                this.socketService.setupSocketConnection(currentUser);
                this.authService.setCurrentUser(currentUser);
                this.errorMessage = null;
                this.router.navigateByUrl('/boards');
            },
            error: (err: HttpErrorResponse) => {
                console.log('err', err.error);
                this.errorMessage = err.error.emailOrPassword; //error we created (not an httperrorresponse) to handle invalid credentials (credentials not in our db)
            }
        });
    }
}