import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {from, lastValueFrom, Observable} from "rxjs";
import {OktaAuthService} from "@okta/okta-angular";

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {

  constructor(private oktaAuth: OktaAuthService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.handleAccess(req, next));
  }

  private async handleAccess(req: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>> {
    const securedEndPoints = ['http://localhost:8080/api/orders'];
    if (securedEndPoints.some(url => req.urlWithParams.includes(url))) {
      const accessToken = await this.oktaAuth.getAccessToken();


      req = req.clone({
        setHeaders: {
          Authorization: 'Bearer ' + accessToken
        }
      })

    }

    return await lastValueFrom(next.handle(req));
  }
}
