#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import {SpaFrontendStack} from '../lib/spa-frontend-stack';
import {UserPoolStack} from '../lib/userpool-stack';

const app = new cdk.App();
// new AwsIotSpaFrontendStack(app, 'AwsIotSpaFrontendStack');

let userPoolStack = new UserPoolStack(app, 'UserPoolStack');
new SpaFrontendStack(app, 'SpaFrontendStack', {userPoolArn: userPoolStack.userPool.userPoolArn});

app.synth();
