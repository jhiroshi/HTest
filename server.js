const fs = require('fs');
const http = require('http');// Require the http module
const path = require('path')

const PREFIX_PATH_PROJECT = 'src/'
const SERVER_PORT = 5001

const handleGetResponse = async (req, res, pathname) => {
  try {
    let filePath;
    const mimeTypesAllowed={
      ".html": "text/html",
      ".css": "text/css",
      ".js": "text/javascript",
      ".mjs": "text/javascript",
      ".png": "image/png"
    }
  
  switch(pathname) {
    case '/': 
      filePath = path.join(__dirname, PREFIX_PATH_PROJECT, "index.html")
      break;  
    default:
      filePath = path.join(__dirname, PREFIX_PATH_PROJECT, req.url);
      console.log("Trying to read:", filePath);
  }
  
  const contenteType = mimeTypesAllowed[path.extname(filePath)] || "text/plain"
  const content = await fs.promises.readFile(filePath);
  res.writeHead(200, {"content-Type": contenteType})
  res.end(content)
  } catch (error) {
    console.error("Error handling GET response:", error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
}

const handlePostResponse = (req, res) => {


  res.writeHead(404, { 'Content-Type': 'text/html' });// Write response header
  fs.createReadStream('./src/404.html').pipe(res);// Pipe 404.html to response

  // let body = '';
  // request.on('data', chunk => {
  //   body += chunk.toString(); // Convert Buffer to string
  // });
  // request.on('end', () => {
  //   const newDocument = JSON.parse(body);
  //   console.log('New document created:', newDocument);
  //   response.writeHead(201, { 'Content-Type': 'application/json' });
  //   response.end(JSON.stringify({ message: 'Document created', document: newDocument }));
  // });
}

const handleNotFound = (req, res) => {
  res.writeHead(404, { 'Content-Type': 'text/html' });// Write response header
  fs.createReadStream('./src/404.html').pipe(res);// Pipe 404.html to response
}

const server = http.createServer((req, res) => { // Create a server
  const url = new URL(req.url, `http://${req.headers.host}`)// Create a url object with request url and host name
  const {pathname} = url
  const {method} = req

  switch(method) {
    case 'GET': return handleGetResponse(req, res, pathname);
    case 'POST': return handlePostResponse(req, res);
    default: return handleNotFound(req, res)
  }

  // switch(pathname) {// Create a switch statement based on pathname of url
  //   case '/':
  //     if (method === 'GET') {
  //       const filePath = path.join(__dirname, "src/index.html")
  //       fs.readFile(filePath, (err, content)=>{
  //         if(err){}
  //         else{
  //           const ext = path.extname(filePath)
  //           const mimeTypesAllowed={
  //             ".html": "text/html",
  //             ".css": "text/css",
  //             ".js": "text/javascript",
  //             ".png": "image/png"
  //           }
  //           const contentType = mimeTypesAllowed[ext] || "text/plain"

  //           res.writeHead(200, {"content-Type": contentType})
  //           res.end(content)
  //         }
  //       })

  //       // const name = url.searchParams.get('name')// Get value of 'name' query
  //       // res.writeHead(200, { 'Content-Type': 'text/html' });// Write response header
  //       // fs.createReadStream('./src/index.html')
  //       //   .on('error', () => { // Handle error if index.html is not found
  //       //     res.writeHead(500, { 'Content-Type': 'text/plain' });
  //       //     res.end('Internal Server Error');
  //       //   })
  //       // .pipe(res);// Pipe index.html to response
  //     } else if (method === 'POST') {// Check if request is POST and if so, run handlePostResponse()
  //       // handlePostResponse(req, res)
  //       res.writeHead(404, { 'Content-Type': 'text/html' });// Write response header
  //       fs.createReadStream('./src/404.html').pipe(res);// Pipe 404.html to response
  //     }
  //   break
  //   default:
  //     res.writeHead(404, { 'Content-Type': 'text/html' });// Write response header
  //     fs.createReadStream('./src/404.html').pipe(res);// Pipe 404.html to response
  //   break
  // }
})

// Have server listen at port 4001
server.listen(SERVER_PORT, () => {
  console.log(`Server listening at port ${SERVER_PORT}`);
})

// Function for handling POST responses
// function handlePostResponse(request, response){
//   request.setEncoding('utf8');
  
//   // Receive chunks on 'data' event and concatenate to body variable
//   let body = '';
//   request.on('data', function (chunk) {
//     body += chunk;
//   });
  
//   // When done receiving data, select a random choice for server
//   // Compare server choice with player's choice and send an appropriate message back
//   request.on('end', function () {
//     const choices = ['rock', 'paper', 'scissors'];
//     const randomChoice = choices[Math.floor(Math.random() * 3)];

//     const choice = body;

//     let message;

//     const tied = `Aww, we tied! I also chose ${randomChoice}.`;
//     const victory = `Nooooo, you won! I chose ${randomChoice}.`;
//     const defeat = `Ha! You lost. I chose ${randomChoice}.`;

//     if (choice === randomChoice) {
//       message = tied;
//     } else if (
//         (choice === 'rock' && randomChoice === 'paper') ||
//         (choice === 'paper' && randomChoice === 'scissors') ||
//         (choice === 'scissors' && randomChoice === 'rock')
//     ) {
//       message = defeat;
//     } else {
//       message = victory;
//     }
//     response.writeHead(200, { 'Content-Type': 'text/plain' });
//     response.end(`You selected ${choice}. ${message}`);
//   });
// }