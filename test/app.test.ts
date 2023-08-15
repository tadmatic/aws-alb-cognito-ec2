import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';

import { AppStack } from '../stack';

test('EC2 instance type is t3.micro', () => {
  const app = new cdk.App();
  const stack = new AppStack(app, 'MyTestStack');

  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::EC2::Instance', {
    InstanceType: 't3.micro',
  });
});
