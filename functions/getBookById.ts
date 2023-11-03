import { AppSyncResolverHandler } from "aws-lambda";
import { Book, QueryGetBookByIdArgs } from "../types/book";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({})
);

export const handler: AppSyncResolverHandler<
  QueryGetBookByIdArgs,
  Book | null
> = async (event) => {
    try {
        if (!process.env.BOOKS_TABLE) {
        throw new Error("BOOKS_TABLE is not defined");
        }
    
        const { bookId } = event.arguments;
    
        const {Item} = await ddbDocClient.send(
        new GetCommand({
            TableName: process.env.BOOKS_TABLE,
            Key: {
            id: bookId,
            },
        })
        );  
    
        return Item as Book;
    } catch (error) {
        console.error(error);
        return null;
    }
    };