import express from 'express';

const server = express();
const port = 3030;

server.use(express.urlencoded({ extended: true }))
server.use(express.json());

server.set("view engine", "ejs");

server.listen(port, function () {
    console.log("[Server]", "Server started on port", port)
})

export default server;
