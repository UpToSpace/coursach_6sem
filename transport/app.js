const express = require('express');
const config = require('config');
const mongoose = require('mongoose');
const https = require("https");
const fs = require("fs");

const app = express();

app.use(express.json({ extended: true }));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/tickets/types', require('./routes/ticket.types.routes'));
app.use('/api/tickets', require('./routes/ticket.routes'));
app.use('/api/stops', require('./routes/stops.routes'));
app.use('/api/routes', require('./routes/routes.routes'));
app.use('/api/transports', require('./routes/transport.routes'));

const PORT = config.get('port') || 5000;
async function start() {
    try {
        await mongoose.connect(config.get('mongoUri'), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            //useCreateIndex: true
        });
        https
            .createServer(
                {
                    key: fs.readFileSync("./config/key.pem"),
                    cert: fs.readFileSync("./config/cert.pem"),
                },
                app)
            .listen(PORT, () => {
                console.log(`Server has been started on port ${PORT}...`)
            });
    } catch (e) {
        console.log('Server Error', e.message);
        process.exit(1);
    }
}

start()

