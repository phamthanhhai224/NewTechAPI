const express = require('express')
const router = express.Router();
const aws = require("aws-sdk");
const verify = require('../auth')
    // config AWS
let awsConfig = {
    region: "us-east-2",
    endpoint: "http://dynamodb.us-east-2.amazonaws.com",
    accessKeyId: process.env.AWSAccessKeyId,
    secretAccessKey: process.env.AWSSecretKey,
};
aws.config.update(awsConfig);
const dynamoDB = new aws.DynamoDB.DocumentClient();
router.use(verify)
    // Get all the user
router.get("/", (req, res) => {
    if (req.body.admin == false) return res.json({
        message: "you dont have permission!!"
    })

    let param = {
        TableName: "users"
    }
    dynamoDB.scan(param, (err, data) => {
        if (err) {
            res.status(401).send(err)
        }
        res.json(data.Items)
    })
})


// get One user with user_id
router.get('/:user_id', (req, res) => {
    let param = {
        TableName: "users",
        Key: {
            user_id: req.params.user_id
        }
    }
    dynamoDB.get(param, (err, data) => {
        if (err) res.json(err)
        if (data == null) res.send({
            message: "Cant find user"
        })
        else {
            res.json(data.Item)
        }
    })
})

//DELETE one user
router.delete('/:user_id', (req, res) => {
    let param = {
        TableName: "users",
        Key: {
            user_id: req.params.user_id
        }
    }
    dynamoDB.delete(param, (err, data) => {
        if (err) res.json(err)
        res.json({
            message: "Delete success"
        })
    })
})
router.use((req, res, next) => {

})
module.exports = router;