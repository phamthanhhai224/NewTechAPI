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
    dynamoDB.query(param, (err, data) => {
        if (err) res.send(err)
        if (data.Count == 0) {
            res.send({
                message: "wrong user_id",
            });
        } else {
            if (req.body.password == data.Items[0].password) {
                if (data.Items[0].admin == true) {
                    user = {
                        admin: true,
                        user_id: req.body.user_id,
                    }
                } else user = {
                    admin: false,
                    user_id: req.body.user_id
                }

                const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
                res.header('auth-token', accessToken).json({
                    message: 'logged in',
                    accessToken: accessToken
                });
            } else {
                res.send({
                    message: "wrong password"
                });
            }
        }
    })
})
module.exports = router;