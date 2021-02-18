import * as cdk from '@aws-cdk/core';
import {AuthorizationType, CfnAuthorizer, LambdaIntegration, RestApi} from "@aws-cdk/aws-apigateway";
import {AssetCode, Function, Runtime} from "@aws-cdk/aws-lambda";

export interface SpaFrontendProps extends cdk.StackProps{
    userPoolArn: string;
}

export class ApiGatewayStack extends cdk.Stack {

    constructor(scope: cdk.App, id: string, props: SpaFrontendProps) {

        super(scope, id, props);

        let helloWorldFunction = new Function(this, 'helloWorldFunction', {
            code: new AssetCode('src'),
            handler: 'hello-world.handler',
            runtime: Runtime.NODEJS_10_X,
            environment: {
                Greeting: "Hello, CDK!"
            }
        });

        const restApi: RestApi = new RestApi(this, this.stackName + "RestApi", {
            deployOptions: {
                stageName: "dev",
                metricsEnabled: true,
                dataTraceEnabled: true,
            },
        });

        const authorizer = new CfnAuthorizer(this, 'cfnAuth', {
            restApiId: restApi.restApiId,
            name: 'ApiAuthorizer',
            type: 'COGNITO_USER_POOLS',
            identitySource: 'method.request.header.Authorization',
            providerArns: [props.userPoolArn],
        })

        restApi.root.addMethod("GET", new LambdaIntegration(helloWorldFunction, {}), {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: {
                authorizerId: authorizer.ref
            }
        });

    }
}
