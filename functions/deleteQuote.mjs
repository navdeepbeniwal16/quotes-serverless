import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const client = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: "us-east-1" })
);
const TABLE = "Quotes";

// Method to ensure a quote entry with the id is already present
const isQuotePresent = async (quoteId) => {
  const params = {
    TableName: TABLE,
    Key: { id: quoteId },
  };

  const existingItem = await client.send(new GetCommand(params));
  if (existingItem.Item) {
    return true;
  }
  return false;
};

// Method to delete the entry in DynamoDb 'Quotes' table
const deleteQuote = async (quoteId) => {
  const params = {
    TableName: TABLE,
    Key: { id: quoteId },
  };

  await client.send(new DeleteCommand(params));
  console.log("Deleted Quote (with Id):", quoteId);
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({
      message: "Quote deleted successfully",
      id: quoteId,
    }),
  };
};

export const handler = async (event) => {
  console.log("Input Data", event);

  // Check for path paramter id
  if (!event.pathParameters || !event.pathParameters.id) {
    console.error("{id} path parameter is missing in the url");
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        message: "{id} path parameter is missing in the url",
      }),
    };
  }

  // Fetch 'id' from path paramters and delete entry from DynamoDb table 'Quotes'
  try {
    const quoteId = event.pathParameters.id;
    console.log("QuoteId:", quoteId);

    const isPresent = await isQuotePresent(quoteId);
    console.log("Is Quote already present?", isPresent);

    if (isPresent) {
      return await deleteQuote(quoteId);
    } else {
      console.error("Quote with the passed {id} doesn't exist");
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          message: "Quote with the passed {id} doesn't exist",
        }),
      };
    }
  } catch (error) {
    console.error(`Error deleting quote`, error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        message: "Internal server error",
        error: error.message,
      }),
    };
  }
};
