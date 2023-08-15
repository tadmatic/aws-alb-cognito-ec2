import { Stack, StackProps } from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elb from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { InstanceTarget } from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import { Construct } from 'constructs';
import * as fs from 'fs';

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create a VPC
    const vpc = new ec2.Vpc(this, 'MyVPC');

    // UserData script to install a simple nginx server with hello world page
    const startupScript = fs.readFileSync('stack/ec2/startup.sh', 'utf8');
    const userData = ec2.UserData.custom(startupScript);

    // Create an EC2 instance with startup script
    const instance = new ec2.Instance(this, 'MyInstance', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux2(),
      ssmSessionPermissions: true,
      userData,
    });

    // Create a Cognito User Pool
    const userPool = new cognito.UserPool(this, 'MyUserPool', {
      selfSignUpEnabled: true,
      // ... (any additional configurations)
      // set up domain for hosted ui
    });

    // Create a Cognito User Pool Client
    const userPoolClient = new cognito.UserPoolClient(this, 'MyUserPoolClient', {
      userPool,
    });

    // Create an Application Load Balancer
    const alb = new elb.ApplicationLoadBalancer(this, 'MyALB', {
      vpc,
      internetFacing: true,
    });

    // Add a listener to ALB
    const listener = alb.addListener('MyListener', {
      port: 80,
      defaultAction: elb.ListenerAction.fixedResponse(200, {
        messageBody: 'Please use HTTPS',
      }),
    });

    // Add a target group for the ALB listener pointing to the EC2 instance
    listener.addTargets('MyTargetGroup', {
      port: 80,
      priority: 10,
      conditions: [elb.ListenerCondition.pathPatterns(['/'])],
      targets: [new InstanceTarget(instance)],
    });

    // Add a Security Group rule to allow traffic from ALB to EC2 on port 80
    instance.connections.allowFrom(alb, ec2.Port.tcp(80));

    /*
    // Add Cognito-based authentication to the ALB listener
    listener.addAction('Auth', {
      priority: 5,
      conditions: [elb.ListenerCondition.pathPatterns(['/'])],
      action: elb.ListenerAction.authenticateOidc({}),
    });
    */

    // TODO: check if auth is enabled when using a HTTPS listener (port 443)
    // TODO: Add custom domain + ACM certificate to ALB to enable hTTPS
  }
}
