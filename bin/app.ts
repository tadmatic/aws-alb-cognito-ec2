#!/usr/bin/env node

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';

import * as packageJson from '../package.json';
import { AppStack } from '../stack';

// get stack name from package.json
const stackName = packageJson.name;

const app = new cdk.App();

new AppStack(app, stackName, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
