import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as appsync from "aws-cdk-lib/aws-appsync";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from 'path';

export class BookStoreGraphqlApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new appsync.GraphqlApi(this, "BookStoreApi", {
      name: "book-store-api",
      definition: appsync.Definition.fromFile(path.join(__dirname, '../graphql/schema.graphql')),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            name: "BookStoreApiKey",
            expires: cdk.Expiration.after(cdk.Duration.days(365))
          }
        },
      }
    });

    const listBooksLambda = new lambda.Function(this, "ListBooksHandler", {
      code: lambda.Code.fromAsset("functions"),
      runtime: lambda.Runtime.NODEJS_LATEST,
      handler: "listBooks.handler",
    });

    const listBooksDataSource = api.addLambdaDataSource(
      "listBooksDataSource",
      listBooksLambda
    );

    listBooksDataSource.createResolver("listBooks", {
      typeName: "Query",
      fieldName: "listBooks",
    });
  }
}
