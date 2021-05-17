#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import {ApiGatewayStack} from '../lib/api-gateway-stack';
import {SpaStack} from "../lib/spa-stack";

const app = new cdk.App();

let apiGatewayStack = new ApiGatewayStack(app, 'ApiGatewayStack', {} );
new SpaStack(app, "SpaStack", {restApi: apiGatewayStack.restApi} )
app.synth();
