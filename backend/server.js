const express = require("express");
const cors = require("cors");
const http = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const colors = require("colors");
const { Server } = require("socket.io");

//import routes
const authRoute = require("./routes/auth.js");
const gameRoute = require("./routes/games.js");

const connectDB = require("./config/db.js");
const { notFound, errorHandler } = require("./middlewares/errorMiddlewares.js");

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
	cors: {
		// origin: "http://localhost:3000",
		origin: "https://async-tic-tac-toe-two.vercel.app",

		methods: ["GET", "POST", "PUT"],
	},
});
//config
dotenv.config();
connectDB();
const port = process.env.PORT || 5000;

//middlewares
app.use(express.json());
app.use(cors());

//routes
app.use(authRoute);
app.use(gameRoute);

//middlewares error handling
app.use(notFound);
app.use(errorHandler);

io.on("connection", (socket) => {
	socket.on("newgame", (player2) => {
		// socket.emit("newgamecreated", player2);
		socket.broadcast.emit("newgamecreated", player2);
	});

	socket.on("setup", (userData) => {
		socket.join(userData.username);
		socket.emit("connected" + userData.username);
	});

	socket.on("join room", (gameid) => {
		socket.join(gameid);
	});

	socket.on("new message", (newMessageReceived) => {
		socket
			.in(newMessageReceived.turn)
			.emit("message received", newMessageReceived);
	});
});

httpServer.listen(port, console.log(`Server running on ${port}`.bgYellow.bold));
