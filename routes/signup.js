const express = require('express')
const router = express.Router();
const aws = require('aws-sdk')
const { v4: uuidv4 } = require('uuid')
let awsConfig = {
    region: "us-east-2",
    endpoint: "http://dynamodb.us-east-2.amazonaws.com",
    accessKeyId: process.env.AWSAccessKeyId,
    secretAccessKey: process.env.AWSSecretKey,
};
aws.config.update(awsConfig);
const dynamoDB = new aws.DynamoDB.DocumentClient();
router.get("/", (req, res) => {
    res.send("signup")
})
router.post('/', (req, res) => {
    let allUser = {
        TableName: "users"

    }
    dynamoDB.scan(allUser, (err, data) => {
        if (err) {
            res.json({ errorCode: 500 })
        } else {
            const allUser = data.Items
            let existUser = false;
            allUser.forEach(user => {
                if (user.email == req.body.email) {
                    existUser = true;
                }
            });
            if (existUser) {
                res.json({
                    errorCode: 1,
                    msg: "user already exist"
                })
            } else {
                let newUser = {
                    user_id: uuidv4(),
                    email: req.body.email,
                    password: req.body.password,
                    active: true
                }
                let param = {
                    TableName: "users",
                    Item: newUser
                }
                dynamoDB.put(param, (err, data) => {
                    if (err) {
                        res.json({ errorCode: 500 })
                    } else(res.json({ errorCode: 200 }))
                })
            }
        }
    })

})

module.exports = router;