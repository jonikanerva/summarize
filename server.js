// Development server with API key access endpoints
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Get OpenAI API key from environment
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

// MIME types for serving files
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// Create a basic HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;
  
  // Handle API key endpoint
  if (pathname === '/get-api-key') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.writeHead(200);
    
    // Return API key in JSON response
    res.end(JSON.stringify({ 
      apiKey: OPENAI_API_KEY 
    }));
    return;
  }
  
  // Normalize pathname to ensure it points to a file
  pathname = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.join(__dirname, pathname);
  
  // Get file extension
  const extname = path.extname(filePath);
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  // Read and serve the file
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // File not found
        fs.readFile(path.join(__dirname, '404.html'), (err, content) => {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(content || 'File not found');
        });
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      // Successful response
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Start the server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`OpenAI API key ${OPENAI_API_KEY ? 'is' : 'is NOT'} available in the environment`);
});