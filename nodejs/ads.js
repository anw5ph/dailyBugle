const express = require('express');
const app = express();
const cors = require('cors');

const {MongoClient} = require("mongodb");
const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);

let port = 3005;
app.use(cors());
app.use(express.json());

app.options('/', cors({
    origin: ['http://127.0.0.1:8001', 'http://localhost:8001'],
    credentials: true,
    methods: ['POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));


app.listen(port, () => console.log(`listening on port ${port}`))

// GET ALL ADS
app.get('/', async (request, response) => {
    try{

        await client.connect();
        const adsCollection = await client.db('dailyBugle').collection('ads');
        const ads = await adsCollection.find().toArray();
        console.log(ads);

        response.send({'ads': ads});
        
    }
    catch( error) {
        console.error(error);
    }
    finally{
        client.close();
    }
});

app.post('/trackAd', async (request, response) => {
    try{
        await client.connect();
        const adEventsCollection = await client.db('dailyBugle').collection('adEvents');
        const result = await adEventsCollection.insertOne(request.body);
        console.log(result);

        response.send({"message": "Ad tracked successfully"});
    }
    catch( error) {
        console.error(error);
    }
    finally{
        client.close();
    }

});

app.post('/getComments', async (request, response) => {
    try{
        await client.connect();
        const commentsCollection = await client.db('dailyBugle').collection('comments');
        const result = await commentsCollection.find({articleID: request.body.articleID}).toArray();
        console.log(result);

        response.send({"comments": result});
    }
    catch( error) {
        console.error(error);
    }
    finally{
        client.close();
    }

});

app.post('/addComment', async (request, response) => {
    try{
        await client.connect();
        const commentsCollection = await client.db('dailyBugle').collection('comments');
        const result = await commentsCollection.insertOne(request.body);
        console.log(result);

        response.send({"message": "Comment succesfully uploaded"});
    }
    catch( error) {
        console.error(error);
    }
    finally{
        client.close();
    }

});

// app.post('/getUserInfo', async (request, response) => {
//     try{
//         const {sessionID} = request.body;
//         await client.connect();
//         const usersCollection = await client.db('dailyBugle').collection('users')
//         const session = await usersCollection.findOne({sessionID: sessionID});

//         if (session) {
//             response.send({'sessionID': session.sessionID, 'username': session.username, 'role': session.role});
//         }
//         else {
//             response.send({'sessionID': null, 'username': null, 'role': null});
//         }
//     }
//     catch( error) {
//         console.error(error);
//     }
//     finally{
//         client.close();
//     }
// });

// // UPDATE A USER
// app.put('/', async (request, response) => {

//     try {
//         await client.connect();
//         await client.db('dailyBugle').collection('users')
//     } 
//     catch (error) {
//         console.error(error);
//     }
//     finally {
//         client.close();
//     }
// });