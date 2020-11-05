const express = require('express')
const aws = require('aws-sdk')
const auth = require('../auth')
const multer = require('multer')
const { v4: uuidv4 } = require('uuid')
const dbFunctions = require('../dbFunctions')

let awsConfig = {
    region: "us-east-2",
    accessKeyId: process.env.AWSAccessKeyId,
    secretAccessKey: process.env.AWSSecretKey,
}
aws.config.update(awsConfig)
const dynamoDB = new aws.DynamoDB.DocumentClient({
    endpoint: "http://dynamodb.us-east-2.amazonaws.com"
})
const s3 = new aws.S3({
    endpoint: "http://s3.us-east-2.amazonaws.com"
})

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
                    errorCode: 200,
                    user: {
                        name: data.Item.name,
                        email: data.Item.email,
                        phone_num: data.Item.phone_num,
                        friends: data.Item.friends,
                        pending: data.Item.pending,
                        image: data.Item.image
                    }
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
    // upload middleware
const storage = multer.memoryStorage({
    destination: (req, file, callback) => {
        callback(null, '')
    }
})
let uploadFile = multer({ storage }).single('image')
router.post('/upload', uploadFile, (req, res) => {
    let file = req.file.originalname.split('.')
    const fileType = file[file.length - 1].toLowerCase()
    const param = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${uuidv4()}.${fileType}`,
        Body: req.file.buffer

    }
    s3.upload(param, async(err, data) => {
        if (err) { res.json({ errorCode: 500, error: err }) } else {
            let update = await dbFunctions.updateUserImage(req.user.user_id, data.Location)
            if (update.error) { console.log("error update data") } else { console.log("updated success") }
            res.json({ errorCode: 200, location: data.Location })
        }
    })
})
router.put('/upload', async(req, res) => {
    let param = {
        TableName: "users",
        Key: {
            user_id: req.user.user_id
        },
        UpdateExpression: "set image= :i",
        ExpressionAttributeValues: {
            ":i": req.body.location
        }
    }
    dynamoDB.update(param, (err, data) => {
        if (err) res.json({ errorCode: 500, data: err })
        else res.json({ errorCode: 200, data: data })
    })
})

module.exports = router;