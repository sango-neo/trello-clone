import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Observable } from "rxjs";

export class AuthInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = localStorage.getItem('token');
        req = req.clone({ //req is immutable hence clone it
            setHeaders: {
                Authorization: token ?? '', //?? is the nullish coalescing operator*
            }
        });
        return next.handle(req); //passes req obj to next interceptor in the interceptor chain. if none left, req hits the backend server
    }
}

// *Nullish Coalescing operator: will return RHS operand if LHS is null or undefined. Will return LHS otherwise
// Angular http request object provides a clone() method that can be used to set the authorization header to an auth token if available