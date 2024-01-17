const mongoose = require('mongoose')
const dburl = "mongodb+srv://admin:admin@cluster0.0b330r1.mongodb.net/DrivingGest?retryWrites=true&w=majority";

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(dburl, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

mongoose.set("strictQuery" , false)

module.exports = () =>{
  return mongoose.connect(dburl, 
    {
      useNewUrlParser: true, useunifiedTopology: true
    })
}




