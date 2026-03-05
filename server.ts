import express from "express";
import path from "path";

const server = express();
const port = 3030;

server.use(express.urlencoded({ extended: true }));
server.use(express.json());
server.use(express.static(path.join(__dirname, "web/static")))

server.set("view engine", "ejs");
server.set("views", path.join(__dirname, "web/views"));
server.set("routes", path.join(__dirname, "src/routes"));

server.get("/", function (request, response) {
    response.render("index")
})

server.listen(port, function () {
    console.log("[Server]", "Server started on port", port);
});

export default server;
