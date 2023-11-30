const express = require('express');
const app = express();
const cors = require('cors');

const {MongoClient} = require("mongodb");
const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);

let port = 3003;
app.use(cors());
app.use(express.json());

app.options('/', cors({
    origin: ['http://127.0.0.1:8001', 'http://localhost:8001'],
    credentials: true,
    methods: ['POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

app.listen(port, () => console.log(`listening on port ${port}`))

function generateSessionID() {
    const randValue = Math.random().toString(36).substring(2);
    const timestamp = Date.now().toString(36);

    return randValue + timestamp;
}

// READ A USER
app.post('/', async (request, response) => {
    let userID; 
    try{
        const {username, password} = request.body;

        await client.connect();
        const usersCollection = await client.db('dailyBugle').collection('users');
        const auth = await usersCollection.findOne({username: username, password: password});

        if (auth) {
            userID = auth._id;
            const sessionID = generateSessionID();
            await usersCollection.updateOne({_id: userID}, {$set: {sessionID: sessionID}});
            response.send({'auth': 'Authenticated', 'sessionID': sessionID, 'username': username});
        }
        else {
            response.send({'auth': 'Not Authenticated'});
        }
        
    }
    catch( error) {
        console.error(error);
    }
    finally{
        client.close();
    }
});

app.post('/getUserInfo', async (request, response) => {
    

    try{
        const {sessionID} = request.body;
        await client.connect();
        const usersCollection = await client.db('dailyBugle').collection('users')
        const session = await usersCollection.findOne({sessionID: sessionID});

        if (session) {
            response.send({'sessionID': session.sessionID, 'username': session.username, 'role': session.role});
        }
        else {
            response.send({'sessionID': null, 'username': null, 'role': null});
        }
    }
    catch( error) {
        console.error(error);
    }
    finally{
        client.close();
    }
});

// UPDATE A USER
app.put('/', async (request, response) => {


    try {
        await client.connect();
        await client.db('dailyBugle').collection('users')
    } 
    catch (error) {
        console.error(error);
    }
    finally {
        client.close();
    }
});