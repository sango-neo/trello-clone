import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { LoginComponent } from "./components/login/login.component";
import { RegisterComponent } from "./components/register/register.component";
import { AuthService } from "./services/auth.service";
import { AuthGuardService } from "./services/authGuard.service";

const routes: Routes = [
    {path: 'register', component: RegisterComponent},  //this modules's components will be accessible on http://localhost:4200/register
    {path: 'login', component: LoginComponent,} //localhost:4200/login
];

@NgModule({
    imports: [RouterModule.forChild(routes), ReactiveFormsModule, CommonModule], //use forChild because these are routes for the child module - Auth, not root module, App
    providers: [AuthService, AuthGuardService],
    declarations: [RegisterComponent, LoginComponent]
})

export class AuthModule {}