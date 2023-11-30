const express = require('express');
const app = express();
const cors = require('cors');

const {MongoClient, ObjectId} = require("mongodb");
const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);

let port = 3004;
app.use(cors());
app.use(express.json());

app.options('/', cors({
    origin: ['http://127.0.0.1:8001', 'http://localhost:8001'],
    credentials: true,
    methods: ['POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

app.listen(port, () => console.log(`listening on port ${port}`))

// GET ALL ARTICLES
app.get('/', async (request, response) => {
    try{

        await client.connect();
        const articlesCollection = await client.db('dailyBugle').collection('articles');
        const articles = await articlesCollection.find({}).toArray();

        response.send({'articles': articles});

        // if (auth) {
        //     userID = auth._id;
        //     const sessionID = generateSessionID();
        //     await usersCollection.updateOne({_id: userID}, {$set: {sessionID: sessionID}});
        //     response.send({'auth': 'Authenticated', 'sessionID': sessionID, 'username': username});
        // }
        // else {
        //     response.send({'auth': 'Not Authenticated'});
        // }
        
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
app.put('/', async (request, response) => {

    const articleID = new ObjectId(request.body.articleID);

    const articleFilter = {"_id": articleID};

    const articleUpdate = {
        $set: {
            "title": request.body.title,
            "body": request.body.body,
            "teaser": request.body.teaser,
            "categories": request.body.categories,
        }
    };

    try {
        await client.connect();
        await client.db('dailyBugle').collection('articles')
        .updateOne(articleFilter, articleUpdate)
        .then( results => response.send(results))
        .catch( error => console.error(error));
    } 
    catch (error) {
        console.error(error);
    }
    finally {
        client.close();
    }
});