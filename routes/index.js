const jwt = require('jsonwebtoken')
const express = require('express')
const router = express.Router();
const aws = require("aws-sdk");
let awsConfig = {
    region: "us-east-2",
    endpoint: "http://dynamodb.us-east-2.amazonaws.com",
    accessKeyId: process.env.AWSAccessKeyId,
    secretAccessKey: process.env.AWSSecretKey,
};
aws.config.update(awsConfig);
const dynamoDB = new aws.DynamoDB.DocumentClient();
router.post("/", (req, res) => {
    let param = {
        TableName: "users"
    }
    dynamoDB.scan(param, (err, data) => {
        if (err) res.json({ errorCode: 500 })
        else {
            allUser = data.Items
            let found = false
            allUser.forEach(user => {
                if (user.email == req.body.email) {
                    logIn(user.user_id, req.body.password, res)
                    found = true
                }
            });
            if (!found) res.json({ errorCode: 401 })
        }
    })
})

function logIn(user_id, password, res) {
    let param = {
        TableName: "users",
        Key: {
            user_id: user_id
        }
    }
    dynamoDB.get(param, (err, data) => { //query  user with user_id
        if (err) res.send(err)
        if (password == data.Item.password) {
            user = {
                user_id: user_id
            }
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
            res.header('auth-token', accessToken).json({ //send token to client
                errorCode: 200,
                accessToken: accessToken
            });
        } else { res.json({ errorCode: 401 }) } //Sai password


    })
}
module.exports = router;