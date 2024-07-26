import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

const client = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: "us-east-1" })
);
const TABLE = "Quotes";

// Method to get all quote entries from DynamoDb table 'Quotes'
const getAllQuotes = async () => {
  const params = { TableName: TABLE };
  const result = await client.send(new ScanCommand(params));
  const quotes = result.Items || [];

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Quotes retrieved successfully",
      metadata: { total_count: quotes.length },
      quotes,
    }),
  };
};

// Method to get specific quote by it's 'id'
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

  // Create a quote object to send back in response
  const quote = {
    id: result.Item.id,
    quoter: result.Item.quoter,
    quote: result.Item.quote,
    source: result.Item.source || null,
    likes: result.Item.likes,
  };

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Quote with id ${id} retrieved successfully`,
      quote: quote,
    }),
  };
};

// Method to get quote entries matching the query parameters
const getQuotesByQueryParams = async (paramsData) => {
  const filterExpressions = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  // Dynamically populate filter expression, names and values to be queried for Quotes
  for (const [key, value] of Object.entries(paramsData)) {
    const attributeName = `#${key}`;
    filterExpressions.push(`${attributeName} = :${key}`);
    expressionAttributeNames[attributeName] = key;
    expressionAttributeValues[`:${key}`] = value;
  }

  const params = {
    TableName: TABLE,
    FilterExpression: filterExpressions.join(" and "),
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
  };

  const result = await client.send(new ScanCommand(params));
  console.log("Query result:", result.Items);

  const quotes = result.Items || [];
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Quotes queried successfully",
      metadata: {
        total_count: quotes.length,
      },
      quotes: quotes,
    }),
  };
};

export const handler = async (event) => {
  console.log("Input Data:", event);

  try {
    if (event.pathParameters && event.pathParameters.id) {
      // Client has requested for quote with a specific 'id'
      const quoteId = event.pathParameters.id;
      return await getQuoteById(quoteId);
    } else if (
      event.queryStringParameters &&
      Object.keys(event.queryStringParameters).length !== 0
    ) {
      // Client has requested for quotes matching query parameters
      return await getQuotesByQueryParams(event.queryStringParameters);
    } else {
      // All quotes
      return await getAllQuotes();
    }
  } catch (error) {
    console.error("Error occured while retrieving quotes:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error occured while retrieving quotes",
        error: error.message,
      }),
    };
  }
};
