//import the require dependencies
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var cors = require('cors');
app.set('view engine', 'ejs');
var path = require('path');
var multer = require("multer");
var fs = require('fs');
var AWS = require('aws-sdk');
const { checkAuth } = require("./passport");
const { auth } = require("./passport");
auth();
const { graphqlHTTP } = require("express-graphql");

const graphQlSchema = require('./graphql/schema');
const graphQlResolvers = require('./graphql/resolver');

const { mongoDB } = require('./config');
const mongoose = require('mongoose');

const GroupPerson = require('./Models/GroupPersonModel')
const ExpenseItem = require('./Models/ExpenseItemModel')
var options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 500,
    bufferMaxEntries: 0
};
mongoose.connect(mongoDB, options, (err, res) => {
    if (err) {
        console.log(err);
        console.log(`MongoDB Connection Failed`);
    } else {
        console.log(`MongoDB Connected`);
    }
});
mongoose.set('useFindAndModify', false);

//use cors to allow cross origin resource sharing
app.use(cors());

//use express session to maintain session data
app.use(session({
    secret              : 'cmpe273_secret_key',
    resave              : false, // Forces the session to be saved back to the session store, even if the session was never modified during the request
    saveUninitialized   : false, // Force to save uninitialized session to db. A session is uninitialized when it is new but not modified.
    duration            : 60 * 60 * 1000,    // Overall duration of Session : 30 minutes : 1800 seconds
    activeDuration      :  5 * 60 * 1000
}));

var fileFilter = function (req, file, cb) {
    var acceptableMime = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
    if (acceptableMime.indexOf(file.mimetype) !== -1) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};
var storage = multer.diskStorage({
    destination: path.resolve(__dirname, "./upload"),
    filename: function (req, file, cb) {
        let extName = file.originalname.slice(file.originalname.lastIndexOf("."));
        let fileName = Date.now();
        cb(null, fileName + extName);
    },
});
const imageUploader = multer({
    fileFilter,
    storage
}).single("file");

app.use(bodyParser.json());



app.use(
    '/graphql',
    graphqlHTTP({
      schema: graphQlSchema,
      rootValue: graphQlResolvers,
      graphiql: true
    })
  );



const s3 = new AWS.S3({
    accessKeyId: "AKIAXVWN4WFGRBBGFJHM",
    secretAccessKey: "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"
})
app.post('/upload',imageUploader,(req,res,next) => {
    if(!req.file){
        res.status(404).send({message: "File not found"})
    }
    const name = Math.floor(Date.now()/1000)+req.file.originalname
    const params={
        Bucket: "mys3-xichao",
        Key: name,
        Body: fs.createReadStream(req.file.path),
        ContentType: req.file.mimetype,
        ACL: 'public-read'
    }
    s3.upload(params,(err,data) =>{
        if(err){
            res.status(400).send(err)
        }
        var s = data.Location
        res.status(200).json({
            
                    message: 'success',
                    data: {
                        "url": s
                    },
        });
        // res.status(200).send(data.Location)
    })
})
app.get('/upload', function (req, res) {
    res.sendFile( __dirname + "/" + req.url );
});
 


app.post('/settle_up',async function(req,res){
    var userId = req.body.user_id;
    var res1 = await ExpenseItem.find({owe_id:userId,status:0})

    for (var i=0; i<res1.length; i++) {
        let m =  res1[i].money
        console.log("1")
        var result1 = await GroupPerson.findOne({person_id: res1[i].owed_id,group_id:res1[i].group_id})
        await GroupPerson.findByIdAndUpdate( {_id:result1._id},{$set: {balance:result1.balance-m}})
        console.log("2")
        var result2 = await GroupPerson.findOne({person_id: userId,group_id:result1.group_id})
        await GroupPerson.findByIdAndUpdate( {_id:result2._id},{$set: {balance:result2.balance+m}})                                  
    }
    console.log("3")
    var result1 = await ExpenseItem.updateMany({owe_id:userId,status:0},{$set: {status:1}})
    console.log("4")
    var res2 = await ExpenseItem.find({owed_id:userId,status:0})

    for (var i=0; i<res2.length; i++) {
        let m2 =  res2[i].money
        console.log("5")
        var result3 = await GroupPerson.findOne({person_id: res2[i].owe_id,group_id:res2[i].group_id})
        await GroupPerson.findByIdAndUpdate( {_id:result3._id},{$set: {balance:result3.balance+m2}})
        console.log("6")
        var result4 = await GroupPerson.findOne({person_id: userId,group_id:result3.group_id})
        await GroupPerson.findByIdAndUpdate( {_id:result4._id},{$set: {balance:result4.balance-m2}})
    } 
    console.log("7")
    await ExpenseItem.updateMany({owed_id:userId,status:0},{$set: {status:1}})
        res.status(200).json({
            message: 'success'
        });       
          
});



//start your server on port 3001
app.listen(3001);
module.exports = app;
console.log("Server Listening on port 3001")
