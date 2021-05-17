import * as cdk from '@aws-cdk/core';
import {LambdaIntegration, RestApi} from "@aws-cdk/aws-apigateway";
import {AssetCode, Function, Runtime} from "@aws-cdk/aws-lambda";

export interface ApiGatewayProps extends cdk.StackProps {
}

export class ApiGatewayStack extends cdk.Stack {

    public readonly restApi: RestApi

    constructor(scope: cdk.App, id: string, props: ApiGatewayProps) {

        super(scope, id, props);

        let helloWorldFunction = new Function(this, 'helloWorldFunction', {
            code: new AssetCode('src'),
            handler: 'hello-world.handler',
            runtime: Runtime.NODEJS_10_X,
            environment: {
                Greeting: "Hello, CDK!"
            }
        });

        this.restApi = new RestApi(this, this.stackName + "RestApi", {
            deployOptions: {
                stageName: "dev",
                metricsEnabled: true,
                dataTraceEnabled: true,
            },
        });

        this.restApi.root.addMethod("GET", new LambdaIntegration(helloWorldFunction, {}), {});

        let helloResource = this.restApi.root.addResource('hello');
        helloResource.addMethod('GET', new LambdaIntegration(helloWorldFunction, {}));
    }
}
