import * as cdk from '@aws-cdk/core';
import {UserPool} from "@aws-cdk/aws-cognito";
import {Bucket} from "@aws-cdk/aws-s3";
import {BucketDeployment, Source} from "@aws-cdk/aws-s3-deployment";

import {
    CfnCloudFrontOriginAccessIdentity, CloudFrontAllowedMethods, CloudFrontWebDistribution, GeoRestriction,
    HttpVersion, OriginAccessIdentity,
    OriginProtocolPolicy,
    PriceClass,
    ViewerProtocolPolicy
} from "@aws-cdk/aws-cloudfront";
import {RestApi} from "@aws-cdk/aws-apigateway";
import {PolicyStatement} from "@aws-cdk/aws-iam";
import {Duration} from "@aws-cdk/core";

export interface SpaProps extends cdk.StackProps {
    restApi: RestApi
}

export class SpaStack extends cdk.Stack {

    constructor(scope: cdk.App, id: string, props: SpaProps) {

        super(scope, id, props);

        const apiID = props.restApi.restApiId
        const apiDomainName = `${apiID}.execute-api.${this.region}.amazonaws.com`

        const bucket = new Bucket(this, "frontend-bucket", {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            websiteIndexDocument: "index.html",
        });

        const deployment = new BucketDeployment(this, "spa-frontend-bucket-deployment", {
            sources: [Source.asset("./site")],
            destinationBucket: bucket,

        });

        const cloudFrontOia = new OriginAccessIdentity(this, 'OIA', {
            comment: "Origin Access Identity for SPA s3 bucket"
        });

        const distribution = new CloudFrontWebDistribution(this, 'CDN', {
            httpVersion: HttpVersion.HTTP2,
            priceClass: PriceClass.PRICE_CLASS_100,
            viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            defaultRootObject: '/index.html',
            originConfigs: [
                {
                    customOriginSource: {
                        domainName: apiDomainName,
                        originProtocolPolicy: OriginProtocolPolicy.HTTPS_ONLY,
                    },
                    behaviors: [
                        {
                            pathPattern: '/dev/*',
                            allowedMethods: CloudFrontAllowedMethods.ALL,
                            defaultTtl: Duration.seconds(0),
                            compress: true,
                            forwardedValues: {
                                queryString: true,
                                cookies: {forward: 'all'},
                            },
                        },
                    ],
                },
                {
                    s3OriginSource: {
                        s3BucketSource: bucket,
                        originAccessIdentity: cloudFrontOia
                    },
                    behaviors: [
                        {
                            allowedMethods: CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
                            defaultTtl: Duration.minutes(1),
                            isDefaultBehavior: true,
                            compress: true,
                            forwardedValues: {
                                queryString: false,
                                cookies: {forward: 'none'},
                            },
                        },
                    ],
                },
            ],
        })

        const cloudfrontS3Access = new PolicyStatement();
        cloudfrontS3Access.addActions('s3:GetBucket*');
        cloudfrontS3Access.addActions('s3:GetObject*');
        cloudfrontS3Access.addActions('s3:List*');
        cloudfrontS3Access.addResources(bucket.bucketArn);
        cloudfrontS3Access.addResources(`${bucket.bucketArn}/*`);
        cloudfrontS3Access.addCanonicalUserPrincipal(cloudFrontOia.cloudFrontOriginAccessIdentityS3CanonicalUserId);

        bucket.addToResourcePolicy(cloudfrontS3Access);

        console.log(distribution.distributionDomainName)

    }
}
