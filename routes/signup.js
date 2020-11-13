const express = require('express')
const router = express.Router();
const aws = require('aws-sdk')
const { v4: uuidv4 } = require('uuid');
const dbFunctions = require('../dbFunctions')
const nodeMailer = require('nodemailer')
let awsConfig = {
    region: "us-east-2",
    endpoint: "http://dynamodb.us-east-2.amazonaws.com",
    accessKeyId: process.env.AWSAccessKeyId,
    secretAccessKey: process.env.AWSSecretKey,
};
aws.config.update(awsConfig);
const dynamoDB = new aws.DynamoDB.DocumentClient();
router.get("/", async(req, res) => {
    const data = await dbFunctions.getAllUser()
    console.log(data)
    res.send("ds")
})
router.post('/', (req, res) => {
    let allUser = {
        TableName: "users"

    }
    console.log(req.body)
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
                    active: false
                }
                let param = {
                    TableName: "users",
                    Item: newUser
                }
                dynamoDB.put(param, (err, data) => {
                    if (err) {
                        res.json({ errorCode: 500 })
                    } else {
                        res.json({ errorCode: 200 })
                        let activeLink = process.env.ACTIVE_API + process.env.PORT + "/active/" + newUser.user_id
                        sendEmail(newUser.email, activeLink)
                    }
                })
            }
        }
    })

})

function sendEmail(receiver, activeLink) {
    const transporter = nodeMailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.NEW_TECH_MAIL,
            pass: process.env.NEW_TECH_MAIL_PASSWORD
        }
    })
    let mainOption = {
        from: 'New Tech Team',
        to: receiver,
        subject: "Please active your account",
        text: `Click on ${activeLink}  to active your account`
    }
    transporter.sendMail(mainOption, (err, info) => {
        if (err) {
            console.log(err)
        } else {
            console.log(info)
        }
    })
}
module.exports = router;