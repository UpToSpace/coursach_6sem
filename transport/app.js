const express = require('express');
const config = require('config');
const mongoose = require('mongoose');
const https = require("https");
const fs = require("fs");
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const Ticket = require('./models/Ticket');

const app = express();

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
const allClients = [];
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
            //console.log(`⚡: ${socket.id} user just connected!`);
            socket.on("subscribe", (data) => {
                const userId = data.userId;
                const existingUserIdIndex = allClients.findIndex(e => e.userId === userId);
                if (existingUserIdIndex === -1) {
                    allClients.push({ userId: userId, socketId: socket });
                    console.log(`user ${userId} on socket ${socket.id} subscribed!`);
                } else {
                    allClients[existingUserIdIndex].socketId = socket;
                    console.log(`user ${userId} on socket ${socket.id} subscribed!`);
                }
            });

            setInterval(async () => {
                const tickets = await Ticket.find({
                    dateEnd: { $lte: new Date() }, userNotificated: false
                }).populate('ticketType');
                //console.log(allClients)
                if (tickets.length > 0) {
                    tickets.forEach(ticket => {
                        const client = allClients.find(e => e.userId === ticket.owner.valueOf())?.socketId;
                        if (client) {
                            client.emit('message', JSON.stringify(ticket));
                        }
                    })
                }
            }, 10000)

            socket.on('disconnect', () => {
                const index = allClients.findIndex(e => e.socketId === socket.id);
                if (index !== -1) {
                    allClients.splice(index, 1);
                }
                console.log(`user ${socket.id} disconnected!`);
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

