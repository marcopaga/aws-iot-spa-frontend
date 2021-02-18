#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import {ApiGatewayStack} from '../lib/api-gateway-stack';
import {UserPoolStack} from '../lib/userpool-stack';

const app = new cdk.App();
// new AwsIotSpaFrontendStack(app, 'AwsIotSpaFrontendStack');

let userPoolStack = new UserPoolStack(app, 'UserPoolStack');
new ApiGatewayStack(app, 'ApiGatewayStack', {userPoolArn: userPoolStack.userPool.userPoolArn});

app.synth();
