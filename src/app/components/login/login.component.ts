import {Component, OnInit} from '@angular/core';
import {OktaAuthService} from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';
// @ts-ignore
import * as OktaSignIn from "@okta/okta-signin-widget";
import appConfig from "../../config/app-config";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  oktaSignin: any;

  constructor(private oktaAuthService: OktaAuthService) {
    this.oktaSignin = new OktaSignIn({
      logo: 'assets/images/logo.png',
      baseUrl: appConfig.oidc.issuer.split('/oauth2')[0],
      clientId: appConfig.oidc.clientId,
      redirectUri: appConfig.oidc.redirectUri,
      authParams: {
        pkce: true,
        issuer: appConfig.oidc.issuer,
        scopes: appConfig.oidc.scopes
      }
    });
  }

  ngOnInit(): void {
    this.oktaSignin.remove();

    this.oktaSignin.renderEl({
        el: '#okta-sign-in-widget'
      },
      (response: { status: string; }) => {
        if (response.status === 'SUCCESS') {
          console.log("done")
          this.oktaAuthService.signInWithRedirect();
        }
      },
      (error: any) => {
        throw  error;
      }
    )
  }

}
