import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = "Quotes";

const getQuoteById = async (id) => {
  const params = {
    TableName: TABLE,
    Key: { id },
  };

  const result = await client.send(new GetCommand(params));
  if (!result.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Quote not found" }),
    };
  }

  const quote = {
    id: result.Item.id,
    quoter: result.Item.quoter,
    quote: result.Item.quote,
    source: result.Item.source || null,
    likes: result.Item.likes,
  };

  return { statusCode: 200, body: JSON.stringify(quote) };
};

const getAllQuotes = async () => {
  const params = { TableName: TABLE };
  const result = await client.send(new ScanCommand(params));
  const quotes = result.Items || [];

  return {
    statusCode: 200,
    body: JSON.stringify({
      metadata: { total_count: quotes.length },
      quotes,
    }),
  };
};

export const handler = async (event) => {
  console.log("Input Data:", event);

  try {
    if (event.pathParameters && event.pathParameters.id) {
      const quoteId = event.pathParameters.id;
      return await getQuoteById(quoteId);
    } else {
      return await getAllQuotes();
    }
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
