import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as appsync from "aws-cdk-lib/aws-appsync";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as nodeJsLambda from 'aws-cdk-lib/aws-lambda-nodejs';
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
      },
      logConfig: {
        fieldLogLevel: appsync.FieldLogLevel.ALL,
      },
      xrayEnabled: true,
    });

    const booksTable = new dynamodb.Table(this, "BooksTable", {
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    const commonLambdaProps: Omit<lambda.FunctionProps, "handler"> = {
      code: lambda.Code.fromAsset("functions"),
      runtime: lambda.Runtime.NODEJS_LATEST,
      memorySize: 1024,
      architecture: lambda.Architecture.ARM_64,
      environment: {
        BOOKS_TABLE: booksTable.tableName,
      },
    };

    const listBooksLambda = new lambda.Function(this, "ListBooksHandler", {
      handler: "listBooks.handler",
      ...commonLambdaProps,
    });

    booksTable.grantReadData(listBooksLambda);

    const listBooksDataSource = api.addLambdaDataSource(
      "listBooksDataSource",
      listBooksLambda
    );

    listBooksDataSource.createResolver("listBooks", {
      typeName: "Query",
      fieldName: "listBooks",
    });

    const createBookLambda = new lambda.Function(this, "CreateBookHandler", {
      handler: "createBook.handler",
      ...commonLambdaProps,
    });

    booksTable.grantReadWriteData(createBookLambda);

    const createBookDataSource = api.addLambdaDataSource(
      "createBookDataSource",
      createBookLambda
    );

    createBookDataSource.createResolver("createBook", {
      typeName: "Mutation",
      fieldName: "createBook",
    });

    const getBookByIdLambda = new lambda.Function(this, "getBookByIdHandler", {
      handler: "getBookById.handler",
      ...commonLambdaProps,
    });

    booksTable.grantReadData(getBookByIdLambda);

    const getBookByIdDataSource = api.addLambdaDataSource(
      "getBookByIdDataSource",
      getBookByIdLambda
    );

    getBookByIdDataSource.createResolver("getBookById", {
      typeName: "Query",
      fieldName: "getBookById",
    });

    const updateBookLambda = new nodeJsLambda.NodejsFunction(this, "updateBookHandler", {
      ...commonLambdaProps,
      entry: path.join(__dirname, "../functions/updateBook.ts"),
    });

    booksTable.grantReadWriteData(updateBookLambda);

    const updateBookDataSource = api.addLambdaDataSource(
      "updateBookDataSource",
      updateBookLambda
    );

    updateBookDataSource.createResolver("updateBook", {
      typeName: "Mutation",
      fieldName: "updateBook",
    });
  }
}