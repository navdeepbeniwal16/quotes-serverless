import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const client = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: "us-east-1" })
);
const TABLE = "Quotes";
const INDEX = "quote-quoter-index";

// Method to validate the quote body
const validateBody = (requestBody) => {
  const requiredFields = ["quoter", "quote"];
  for (const field of requiredFields) {
    if (!requestBody[field] || requestBody[field] === "") {
      throw new Error(
        "Request body is missing required fields: 'quoter', 'quote'"
      );
    }
  }
};

// Method to check if quote entry with same values of 'quote' and 'quoter' is present
const isPresent = async (quoteData) => {
  const { quote, quoter } = quoteData;

  const params = {
    TableName: TABLE,
    IndexName: INDEX, // Allows efficient retrieval of data
    KeyConditionExpression: "quote = :quote and quoter = :quoter",
    ExpressionAttributeValues: {
      ":quote": quote,
      ":quoter": quoter,
    },
  };

  const result = await client.send(new QueryCommand(params));
  return result.Items && result.Items.length > 0;
};

const createNewQuote = async (quoteData) => {
  const { quote, quoter, source } = quoteData;
  const id = uuidv4();

  const quoteItem = {
    id,
    quote,
    quoter,
    source: source || null, // Can be null
    likes: 0, // Initialize likes with 0 as default
  };
  const params = {
    TableName: TABLE,
    Item: quoteItem,
  };

  await client.send(new PutCommand(params));
  return {
    statusCode: 201,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({
      message: "Quote created successfully",
      quote: quoteItem,
    }),
  };
};

export const handler = async (event) => {
  console.log("Input Data:", event);

  // Check to ensure body is present in request and is non-empty
  if (!event.body) {
    console.error("Request body is missing");
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ message: "Request body is missing" }),
    };
  }

  // Parse request body into JSON
  let body;
  try {
    body = JSON.parse(event.body);
    console.log("Parsed Request Body:", body);
  } catch (error) {
    console.error("Error occurred when parsing request body:", error);
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        message: "Invalid JSON format",
        error: error.message,
      }),
    };
  }

  // Validate quote request body
  try {
    validateBody(body);
  } catch (error) {
    console.error("Invalid request body", body);
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        message: "Invalid request body",
        error: error.message,
      }),
    };
  }

  // Check if quote is a new one, and create a new entry in DynamoDb 'Quotes' table
  try {
    const isQuotePresent = await isPresent(body);
    console.log("Is quote already present?", isQuotePresent);

    if (isQuotePresent) {
      console.error("Quote with the quote and quoter already exists");
      return {
        statusCode: 409,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          message: "Quote with the quote and quoter already exists",
        }),
      };
    }

    return await createNewQuote(body);
  } catch (error) {
    console.error("Error occured while creating a quote", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        message: "Error checking if quote is present: Internal server error:",
        error: error.message,
      }),
    };
  }
};
