const express = require('express');
const config = require('config');
const mongoose = require('mongoose');
const https = require("https");
const fs = require("fs");
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();

app.use(express.json({ extended: true }));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', require('./routes/auth.routes'));
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
            useUnifiedTopology: true
        });
        const httpsServer = https.createServer(
            {
                key: fs.readFileSync("./cert/L.key"),
                cert: fs.readFileSync("./cert/L.crt"),
            },
            app)

        httpsServer.listen(PORT, () => {
            console.log(`Server has been started on port ${PORT}...`)
        });

    } catch (e) {
        console.log('Server Error', e.message);
        process.exit(1);
    }
}

start()

