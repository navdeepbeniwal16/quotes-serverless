# Kwot

## Project Overview

Kwot is your home to exploring and finding the best funny quotes from movies and tv-shows. This web application comprises of a serverless backend and a react based frontend client application.

1. **Serverless Backend:** The backend service is built using various AWS serverless technologies to handle essential APIs for creating, fetching, updating, and deleting quotes. The setup includes:
   - AWS Lambda: Functions for handling different HTTP methods (GET, POST, PUT, DELETE) for the APIs.
   - Amazon API Gateway: Defines the APIs and routes requests to the relevant Lambda functions.
   - Amazon DynamoDB: A NoSQL database service to store quote entries with fields: quote, quoter, source, and likes.

Note: All Lambda function code and dependency modules are stored in the functions folder.

2. **React Frontend:** The frontend is a React-based application that allows users to:
   - Create/Add new quotes
   - View all quotes stored in the database
   - Query quotes based on the movie/TV name or quoter name
   - Like, update, and delete quotes

Note: The React application is built and hosted as a Docker image.

3. **Docker:** A Docker image for the React application is built and hosted on Docker Hub as navdeep16/kwot:latest. The image serves the production build of the React application.

##  Access the Hosted Application
The production version of the application can be accessed at http://35.153.138.140/

## Running Locally with Docker
For a quick and efficient local setup, you can pull and run the Docker image. Make sure you have docker installed on your system

1. Pull the Docker image:

   ```bash
   docker pull navdeep16/kwot:latest
   ```

2. Run the Docker container:

   ```bash
   docker run -d -p 80:80 navdeep16/kwot:latest
   ```
3. Access the application: Open your browser and navigate to http://localhost
