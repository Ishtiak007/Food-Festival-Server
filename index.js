const express =require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

// MIDDLEWARE
app.use(cors());
app.use(express.json());







const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.s1bw0ez.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();




    const menuCollection = client.db("foodFestivalDB").collection("menu");
    const reviewsCollection = client.db("foodFestivalDB").collection("reviews");
    const cartsCollection = client.db("foodFestivalDB").collection("carts");



    app.get('/menu',async(req,res)=>{
        const result = await menuCollection.find().toArray();
        res.send(result);
    });
    app.get('/reviews',async(req,res)=>{
        const result = await reviewsCollection.find().toArray();
        res.send(result);
    });


    // carts related api
    app.post('/carts',async(req,res)=>{
        const cartItem = req.body;
        const result = await cartsCollection.insertOne(cartItem);
        res.send(result);
    })




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.get('/',(req,res)=>{
    res.send('Food Festival server is Running');
});
app.listen(port,()=>{
    console.log(`Food Festival Website is running on port ${port}`);
});