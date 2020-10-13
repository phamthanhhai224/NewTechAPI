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
router.post('/', (req, res) => {
    let param = {
        TableName: "users",
        KeyConditionExpression: "#user_id= :user_id",
        ExpressionAttributeNames: {
            "#user_id": "user_id"
        },
        ExpressionAttributeValues: {
            ":user_id": req.body.user_id
        }
    }
    dynamoDB.query(param, (err, data) => { //query  user with user_id
        if (err) res.send(err)
        if (data.Count == 0) {
            res.status(404).json({
                errorCode: 404, //Khong tim thay user
            });
        } else {
            if (req.body.password == data.Items[0].password) {
                console.log(data.Items[0])
                user = {
                    user_id: req.body.user_id
                }
                const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
                res.header('auth-token', accessToken).json({ //send token to client
                    errorCode: 200,
                    accessToken: accessToken
                });
            } else { res.status(401).json({ errorCode: 401 }) } //Sai password

        }
    })
})
module.exports = router;