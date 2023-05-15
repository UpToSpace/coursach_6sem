const express = require('express');
const config = require('config');
const mongoose = require('mongoose');
const https = require("https");
const fs = require("fs");
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const Ticket = require('./models/Ticket');
const User = require('./models/User');

const app = express();
const WSPORT = config.get('wsport') || 5002;
var clients = [];
// const wss = new WebSocket.Server({ port: WSPORT }, () => {
//     console.log(`WS server started on port ${WSPORT}...`);
// });


// wss.on('connection', function connection(ws) { 
//     ws.on('message', function incoming(message) {
//         console.log(message.toString());
//         clients.push({ id: message.toString(), ws: ws });
//         wss.clients.forEach(async (client) => {
//             // const tickets = await Ticket.find({ dateEnd: { $lte: new Date() } })
//             // .populate('ticketType');
//             const tickets = await Ticket.find({})
//             if (client.readyState === ws.OPEN && tickets.length > 0) {
//                 tickets.forEach(ticket => {
//                     client[ticket.owner].send(JSON.stringify(ticket));
//                 });
//             }
//         });
//     });
// });


app.use(express.json({ extended: true }));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/tickets/types', require('./routes/ticket.types.routes'));
app.use('/api/tickets', require('./routes/ticket.routes'));
app.use('/api/stops', require('./routes/stops.routes'));
app.use('/api/routes', require('./routes/routes.routes'));
app.use('/api/transports', require('./routes/transport.routes'));
app.use('/api/schedule', require('./routes/schedule.routes'));
app.use('/api/user', require('./routes/user.routes'))

const PORT = config.get('port') || 5000;
async function start() {
    try {
        await mongoose.connect(config.get('mongoUri'), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            //useCreateIndex: true
        });
        const httpsServer = https.createServer(
            {
                key: fs.readFileSync("./cert/L.key"),
                cert: fs.readFileSync("./cert/L.crt"),
            },
            app)
        const io = require("socket.io")(httpsServer, {
            cors: {
                origin: "https://localhost:3000",
                methods: ["GET", "POST"],
            },
        });

        io.on("connection", (socket) => {
            console.log(`⚡: ${socket.id} user just connected!`);
            setInterval(async () => {
                const tickets = await Ticket.find({
                    dateEnd: { $lte: new Date() }, userNotificated: false}).populate('ticketType');
                if (tickets.length > 0) {
                    socket.emit('message', JSON.stringify(tickets));
                }
            }, 5000)
            socket.on('disconnect', () => {
                console.log('user disconnected');
            })
        });

        httpsServer.listen(PORT, () => {
            console.log(`Server has been started on port ${PORT}...`)
        });

    } catch (e) {
        console.log('Server Error', e.message);
        process.exit(1);
    }
}

start()

