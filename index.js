const express =require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;

// MIDDLEWARE
app.use(cors());
app.use(express.json());







const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
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
    const usersCollection = client.db("foodFestivalDB").collection("users");



    //JWT RELATED API
    app.post('/jwt',async(req,res)=>{
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'});
        res.send({token});
    });
    //MIDDLEWARE
    const verifyToken =(req,res,next)=>{
        // console.log('inside varified token',req.headers.authorization);
        if(!req.headers.authorization){
        return res.status(401).send({message:'unauthorized access'});
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
        if(err){
          return res.status(401).send({message: 'unauthorized access'})
        }
        req.decoded=decoded;
        next();
      })
    }



    // VERIFY ADMIN
    const verifyAdmin = async(req,res, next)=>{
        const email = req.decoded.email;
        const query = {email:email}
        const user = await usersCollection.findOne(query);
        const isAdmin = user?.role === 'admin'
        if(!isAdmin){
          return res.status(403).send({message : ' forbidden access'});
        }
        next();
      }



    app.get('/menu',async(req,res)=>{
        const result = await menuCollection.find().toArray();
        res.send(result);
    });
    app.get('/reviews',async(req,res)=>{
        const result = await reviewsCollection.find().toArray();
        res.send(result);
    });



    //menu related API
    app.post('/menu',verifyToken,verifyAdmin,async(req,res)=>{
        const item = req.body;
        const result = await menuCollection.insertOne(item);
        res.send(result);
    });
    app.delete('/menu/:id',verifyToken,verifyAdmin, async(req,res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await menuCollection.deleteOne(query);
        res.send(result)
      });
    app.get('/menu/:id', async (req, res) => {
        const id = req.params.id;
        const query = {_id : new ObjectId(id)}
        const result = await menuCollection.findOne(query);
        res.send(result);
        console.log(result)
    });
    app.patch('/menu/:id',async(req,res)=>{
        const item = req.body;
        const id = req.params.id;
        const filter = {_id : new ObjectId(id)}
        const updatedDoc={
          $set:{
            name : item.name,
            category : item.category,
            price: item.price,
            recipe: item.recipe,
            image: item.image,
            offer: item.offer,
            rating: item.rating,
            posiviteOne: item.posiviteOne,
            posiviteTwo: item.posiviteTwo
          }
        }
        const result = await menuCollection.updateOne(filter,updatedDoc);
        res.send(result);
    })


    // carts related api
    app.post('/carts',async(req,res)=>{
        const cartItem = req.body;
        const result = await cartsCollection.insertOne(cartItem);
        res.send(result);
    });
    app.get('/carts',async(req,res)=>{
        const email = req.query.email;
        const query ={email:email};
        const result = await cartsCollection.find(query).toArray();
        res.send(result);
    });
    app.delete('/carts/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id : new ObjectId(id)}
        const result = await cartsCollection.deleteOne(query);
        res.send(result)
    });



    //  User related API
    app.get('/users/admin/:email',verifyToken, async(req,res)=>{
        const email = req.params.email;
        if(email !== req.decoded.email){
          return res.status(403).send({message : "forbidden access"})
        }
        const query = {email:email}
        const user = await usersCollection.findOne(query);
        let admin = false;
        if(user){
          admin= user?.role === 'admin';
        }
        res.send({admin});
      });
    app.post('/users',async (req,res)=>{
        const user = req.body;
        const query ={email: user.email}
        const existingUser = await usersCollection.findOne(query);
        if(existingUser){
          return res.send({message: 'user already exists', insertedId : null})
        }
        const result = await usersCollection.insertOne(user);
        res.send(result);
    });
    app.get('/users',verifyToken,verifyAdmin,async(req,res)=>{
        const result = await usersCollection.find().toArray();
        res.send(result);
    });
    app.delete('/users/:id',verifyToken,verifyAdmin, async(req,res)=>{
        const id = req.params.id;
        const query = {_id : new ObjectId(id)};
        const result = await usersCollection.deleteOne(query);
        res.send(result);
    });
    app.patch('/users/admin/:id', verifyToken,verifyAdmin,async(req,res)=>{
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)};
        const updatedDoc = {
          $set :{
            role : 'admin'
          }
        }
        const result = await usersCollection.updateOne(filter,updatedDoc);
        res.send(result);
    });  




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