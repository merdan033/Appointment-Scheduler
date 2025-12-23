/**
 * Appointment Scheduler - Main Server File
 * 
 * This is the entry point of the application. It sets up and configures
 * the Express server, loads environment variables, and initializes
 * the application on the specified port.
 * 
 * @module server
 */

// Load environment variables from .env file
// This must be done before importing any other modules that depend on env vars
require('dotenv').config();

// Import Express framework for building the web server
const express = require('express');

// Import body-parser middleware to parse incoming request bodies
// This allows us to access request data in JSON format
const bodyParser = require('body-parser');

/**
 * Initialize Express application
 * Creates an instance of the Express application that will handle
 * all HTTP requests and responses
 */
const app = express();

/**
 * Configure the port number
 * Uses the PORT environment variable if available, otherwise defaults to 3000
 * This allows for flexible deployment across different environments
 */
const PORT = process.env.PORT || 3000;

/**
 * Middleware Configuration
 * 
 * bodyParser.json() - Parses incoming JSON payloads in request bodies
 *   - Automatically converts JSON strings to JavaScript objects
 *   - Makes parsed data available in req.body
 * 
 * bodyParser.urlencoded({ extended: true }) - Parses URL-encoded payloads
 *   - Handles form submissions and query parameters
 *   - extended: true allows parsing of nested objects
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Root Route Handler
 * 
 * GET / - Health check endpoint
 * 
 * Purpose: 
 *   - Verifies that the server is running and responding to requests
 *   - Can be used for monitoring and health checks
 * 
 * Response:
 *   - Status: 200 OK
 *   - Body: JSON object with server status message
 * 
 * @route GET /
 * @returns {Object} JSON response indicating server is running
 */
app.get('/', (req, res) => {
  // Send a JSON response indicating the server is operational
  res.status(200).json({
    message: 'Server running',
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

/**
 * Start the Express server
 * 
 * This function binds the application to the specified port and
 * starts listening for incoming HTTP requests.
 * 
 * Error Handling:
 *   - If the server fails to start (e.g., port already in use),
 *     the error will be logged to the console
 * 
 * @listens {number} PORT - The port number to listen on
 */
app.listen(PORT, () => {
  // Log server startup information
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Access the server at: http://localhost:${PORT}`);
});

/**
 * Export the Express app instance
 * This allows the app to be imported and used in other modules
 * (e.g., for testing purposes)
 */
module.exports = app;

