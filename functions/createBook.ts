import { AppSyncResolverHandler } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { Book, MutationCreateBookArgs } from '../types/book';

const client = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(client);

export const handler: AppSyncResolverHandler<MutationCreateBookArgs, Book | null> = async (e) => {
    const book = e.arguments.book;
    try {
        if (!process.env.BOOKS_TABLE) {
            throw new Error('BOOKS_TABLE is not defined');
            return null;
        }

        await documentClient.send(new PutCommand({ TableName: process.env.BOOKS_TABLE, Item: book }))
        return book;
    } catch (error) {
        console.error(error);
        return null;
    }
    return null;
}