import * as cdk from '@aws-cdk/core';
import {OAuthScope, UserPool, VerificationEmailStyle} from "@aws-cdk/aws-cognito";

export class UserPoolStack extends cdk.Stack {

    public readonly userPool: UserPool

    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.userPool = new UserPool(this, 'user-pool', {
            userPoolName: 'User Pool',
            selfSignUpEnabled: true,
            userVerification: {
                emailSubject: 'Abschluss der Anmeldung',
                emailBody: 'Hallo {username}, Vielen Dank für die Anmeldung! Dein Verifkationscode ist: {####}',
                emailStyle: VerificationEmailStyle.CODE,
            }
        })

        const cognitoDomain = process.env.COGNITO_DOMAIN || "dev-pool-cnsg-" + process.env.USER;
        let userPoolDomain = this.userPool.addDomain('CognitoDomain', {
            cognitoDomain: {
                domainPrefix: cognitoDomain,
            }
        });

        let client = this.userPool.addClient('spa-client', {
            authFlows: {
                userSrp: true,
                userPassword: true,
            },
            oAuth: {
                flows: {
                    implicitCodeGrant: true,
                },
                scopes: [OAuthScope.OPENID, OAuthScope.EMAIL],
                callbackUrls: ['http://localhost:8080/login/oauth2/code/cognito'],
                logoutUrls: ['http://localhost:8080/logout']
            }
        });

        console.log(userPoolDomain.signInUrl(client, {
            redirectUri: 'http://localhost:8080'
        }));

    }
}
