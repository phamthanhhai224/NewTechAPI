const express = require('express')
const aws = require('aws-sdk')
const auth = require('../auth')

let awsConfig = {
    region: "us-east-2",
    endpoint: "http://dynamodb.us-east-2.amazonaws.com",
    accessKeyId: process.env.AWSAccessKeyId,
    secretAccessKey: process.env.AWSSecretKey,
}
aws.config.update(awsConfig)
const dynamoDB = new aws.DynamoDB.DocumentClient()

const router = express.Router();
router.use(auth)
    // method GET
    // des: load currently logged in account
    // route /profile
router.get("/", (req, res) => {
        let param = {
            TableName: "users",
            Key: {
                user_id: req.user.user_id
            }
        }
        dynamoDB.get(param, (err, data) => {
            if (err) {
                res.json({
                    errorCode: 500,
                    err
                })
            } else {
                let resData = {

                    name: data.Item.name,
                    email: data.Item.email,
                    phone_num: data.Item.phone_num,
                    friends: data.Item.friends,
                    pending: data.Item.pending,
                    img: data.Item.img
                }
                res.json(resData)
            }
        })

    })
    /*
        method GET
        des : load profile with :id
        route /profile/:id
    */
router.get('/:id', (req, res) => {
        let param = {
            TableName: "users",
            Key: {
                user_id: req.params.id
            }
        }
        dynamoDB.get(param, (err, data) => {
            if (err) {
                res.json(err)
            } else {
                let resData = {
                    name: data.Item.name,
                    email: data.Item.email,
                    phone_num: data.Item.phone_num
                }
                res.json(resData)
            }
        })
    })
    // method PUT
    // des : update or create profile that is logged in
    // route /profile
router.put('/', (req, res) => {
    let param = {
        TableName: "users",
        Key: {
            user_id: req.user.user_id
        },
        UpdateExpression: 'set #phone_num = :p , #name = :n',
        ExpressionAttributeNames: {
            '#phone_num': 'phone_num',
            '#name': "name"
        },
        ExpressionAttributeValues: {
            ':p': req.body.phone_num,
            ':n': req.body.name
        },
        ReturnValues: "UPDATED_NEW"
    }
    dynamoDB.update(param, (err, data) => {
        if (err) res.json({ errorCode: 500, err: err })
        else {
            res.json({ errorCode: 200 })
        }
    })
})
router.put('/password', (req, res) => {
    let param = {
        TableName: "users",
        Key: {
            user_id: req.user.user_id
        },
        UpdateExpression: 'set #password  = :p ',
        ExpressionAttributeNames: {
            '#password': 'password',

        },
        ExpressionAttributeValues: {
            ':p': req.body.password,
        },
        ReturnValues: "UPDATED_NEW"
    }
    dynamoDB.update(param, (err, data) => {
        if (err) res.json({ errorCode: 500, err: err })
        else {
            res.json({ errorCode: 200 })
        }
    })
})


module.exports = router;