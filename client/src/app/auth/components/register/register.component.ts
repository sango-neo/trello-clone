import { HttpErrorResponse } from "@angular/common/http";
import { Component } from "@angular/core";
import { UntypedFormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { SocketService } from "src/app/shared/services/socket.service";
import { AuthService } from "../../services/auth.service";
import { CurrentUserInterface } from "../../types/currentUser.interface";

@Component({
    selector: 'auth-register',
    templateUrl: './register.component.html'
})

export class RegisterComponent {

    errorMessage: string | null = null;

    form = this.fb.group({
        email: ['', Validators.required],
        username: ['', Validators.required],
        password: ['', Validators.required],
    })

    constructor(
        private fb: UntypedFormBuilder, 
        private authService: AuthService, 
        private router: Router,
        private socketService: SocketService,
        ) {}
    
    onSubmit(): void {
        this.authService.register(this.form.value).subscribe({
            next: (currentUser: CurrentUserInterface) => {
                console.log('currentUser', currentUser);
                this.authService.setToken(currentUser);
                this.socketService.setupSocketConnection(currentUser);
                this.authService.setCurrentUser(currentUser);
                this.errorMessage = null;
                this.router.navigateByUrl('/');
            },
            error: (err: HttpErrorResponse) => {
                console.log('err', err.error); //the error we get will be a string array
                this.errorMessage = err.error.join(', '); //check the backend controller 
            }
        });
    }
}