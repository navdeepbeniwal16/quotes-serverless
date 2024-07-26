import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";

const client = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: "us-east-1" })
);
const TABLE = "Quotes";

// Method to validate quote request body
const validateBody = (requestBody) => {
  const requiredFields = ["quoter", "quote", "source", "likes"];
  for (const field of requiredFields) {
    if (!requestBody[field] || requestBody[field] === "") {
      throw new Error(
        "Request body is missing required fields: 'quoter', 'quote', 'source', 'likes'"
      );
    }

    if (field === "likes" && typeof requestBody[field] !== "number") {
      // Check to ensure likes value is a number
      throw new Error("'likes' is not a number");
    }
  }
};

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

// Method to updat the entry in DynamoDb 'Quotes' table
const updateQuote = async (quoteId, quoteData) => {
  const params = {
    TableName: TABLE,
    Item: {
      id: quoteId,
      ...quoteData,
    },
  };

  await client.send(new PutCommand(params));

  // Populate the quoteData object with id
  quoteData["id"] = quoteId;
  console.log("Updated Quote:", quoteData);
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Quote updated successfully",
      quote: quoteData,
    }),
  };
};

export const handler = async (event) => {
  console.log("Input Data", event);

  // Check to ensure path parameter 'id'
  if (!event.pathParameters || !event.pathParameters.id) {
    console.error("{id} path parameter is missing in the url");
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "{id} path parameter is missing in the url",
      }),
    };
  }

  // Check to ensure body is present in request and is non-empty
  if (!event.body) {
    console.error("Request body is missing");
    return {
      statusCode: 400,
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
      body: JSON.stringify({
        message: "Invalid JSON passed",
        error: error.message,
      }),
    };
  }

  // Validate request body
  try {
    validateBody(body);
  } catch (error) {
    console.error("Error validating quote body:", error);
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Error validating quote body",
        error: error.message,
      }),
    };
  }

  // Fetch the quote id from the path parameter and update the entry on DynamoDb 'Quotes' table
  try {
    const quoteId = event.pathParameters.id;
    console.log("QuoteId:", quoteId);

    const isPresent = await isQuotePresent(quoteId);
    console.log("Is Quote already present?", isPresent);

    if (isPresent) {
      return await updateQuote(quoteId, body);
    } else {
      console.error("Quote with the passed {id} doesn't exist");
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Quote with the passed {id} doesn't exist",
        }),
      };
    }
  } catch (error) {
    console.error("Error updating quote:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error updating quote",
        error: error.message,
      }),
    };
  }
};
