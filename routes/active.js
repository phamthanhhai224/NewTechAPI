const express = require('express')
const router = express.Router()
const aws = require("aws-sdk");
let awsConfig = {
    region: "us-east-2",
    endpoint: "http://dynamodb.us-east-2.amazonaws.com",
    accessKeyId: process.env.AWSAccessKeyId,
    secretAccessKey: process.env.AWSSecretKey,
};
aws.config.update(awsConfig);
const dynamoDB = new aws.DynamoDB.DocumentClient();
router.get('/:user_id', (req, res) => {
    let param = {
        TableName: "users",
        Key: { user_id: req.params.user_id },
        UpdateExpression: "set active = :setActive",
        ExpressionAttributeValues: {
            ":setActive": true
        }
    }
    dynamoDB.update(param, (err, data) => {
        if (err) res.send("Cant active your account, please try again")
        else res.send("active success fully, you can login to our app")
    })
})

module.exports = router