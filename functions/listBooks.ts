import { AppSyncResolverHandler } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { Book } from '../types/book';

const client = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(client);

export const handler: AppSyncResolverHandler<null, Book[] | null> = async () => {
    try {
      if (!process.env.BOOKS_TABLE) {
        throw new Error('BOOKS_TABLE is not defined');
      }

      const data = await documentClient
        .send(new ScanCommand({ TableName: process.env.BOOKS_TABLE }));

      return data.Items as Book[];
    } catch (error) {
      console.error(error);
      return null;
    }
};

