import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { map, Observable } from "rxjs";
import { AuthService } from "./auth.service";

@Injectable()

export class AuthGuardService implements CanActivate {

    constructor(private authService : AuthService, private router: Router) {}

    canActivate(): Observable<boolean> {
        return this.authService.isLoggedIn$.pipe(
            map((isLoggedIn) => {
                if (isLoggedIn) {
                    return true;
                }

                this.router.navigateByUrl('/'); 
                return false;
            })
        ); 
    }
}