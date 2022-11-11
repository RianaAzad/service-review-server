const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

//*******middle ware*********
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.6ifow7m.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        res.status(401).send({message:'unauthorized'})
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(error, decoded){
        if(error){
            res.status(401).send({message: 'unauthorized'})
        }
        req.decoded = decoded;
        next();
    })
}

async function run(){
    try{
        const serviceCollection = client.db('ghuraFira').collection('services');
        const reviewCollection = client.db('ghuraFira').collection('reviews');

        app.get('/services', async(req, res)=> {
            const query ={}
            const cursor = serviceCollection.find(query).limit(3);
            const services = await cursor.toArray();
            res.send(services);
        });
        app.get('/allServices', async(req, res)=> {
            const query ={}
            const cursor = serviceCollection.find(query);
            const allServices = await cursor.toArray();
            console.log(allServices)
            res.send(allServices);
        });

        app.get('/services/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const service = await serviceCollection.findOne(query);
            res.send(service);
            
        });

        app.post('/allServices', async(req, res)=> {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.send(result);
        })

        // review api

        app.post('/reviews', async(req, res)=>{
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        })

        app.post('/jwt', (req, res)=>{
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{expiresIn: '60d'})
            res.send({token})
        })

        app.get('/reviews', async(req, res)=> {

            let query = {};
            if(req.query.service_id){
                query = {
                    service_id: req.query.service_id
                }
            }
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        app.delete('/reviews/:id', async(req, res)=> {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await reviewCollection.deleteOne(query);
            console.log(result)
            res.send(result);
        })

    }
    finally{

    }
}

run().catch(e => console.error(e));


app.get('/', (req, res) =>{
    res.send('server running');
})

app.listen(port, () => {
    console.log(`the server is running on port: ${port}`)
})
