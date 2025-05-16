import { io } from "socket.io-client";

const socket = io("http://localhost:3000"); // adjust port if needed

export default socket;
