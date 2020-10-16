const express = require('express')
const router = express.Router();
const aws = require("aws-sdk");
const verify = require('../auth')
const role_auth = require('../role_auth')
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
router.use(role_auth)
    // Get all the user
router.get("/", (req, res) => {

    let param = {
        TableName: "users"
    }
    dynamoDB.scan(param, (err, data) => {
        if (err) {
            res.json({ errorCode: 401 }) // khong co quyen
        }
        let resData = []
        data.Items.forEach(Item => {
            if (!Item.admin) resData.push(Item)
        });
        res.json(resData)
    })
})


// get One user with user_id
router.get('/:user_id', (req, res) => {
    if (req.body.admin == false) return res.json({
            message: "you dont have permission!!"
        }) // cái này không chạy đâu
    let param = {
        TableName: "users",
        Key: {
            user_id: req.params.user_id
        }
    }
    dynamoDB.get(param, (err, data) => {
        if (err) res.json(err)
        if (data == null) res.status(404).send({
            errorCode: 404 // khong ton tai user
        })
        else {
            res.json(data.Item)
        }
    })
})

//DELETE one user
router.delete('/:user_id', (req, res) => {
    if (req.body.admin == false) return res.json({
            message: "you dont have permission!!"
        }) //cái này không chạy luôn
    let param = {
        TableName: "users",
        Key: {
            user_id: req.params.user_id
        }
    }
    dynamoDB.delete(param, (err, data) => {
        if (err) res.json(err)
        res.status(200).json({
            errorCode: 200
        })
    })
})
module.exports = router;