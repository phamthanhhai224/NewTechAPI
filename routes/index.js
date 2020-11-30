const jwt = require('jsonwebtoken')
const express = require('express')
const router = express.Router();
const aws = require("aws-sdk");
const dbFunction = require('../dbFunctions')
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
            let active = true
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
router.post('/find', (req, res) => {
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
                    res.json({
                        errorCode: 200,
                        user: {
                            user_id: user.user_id,
                            name: user.name,
                            image: user.image,
                            phone_num: user.phone_num
                        }
                    })
                    found = true
                }
            });
            if (found === false) res.json({ errorCode: 500 })
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
        if (password == data.Item.password && data.Item.active) {
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
router.post('/forgetpassword/:email', (req, res) => {
    
    
    let param = {
        TableName: "users",
        Key: {
            email: req.params.email
        }
    }

    dynamoDB.get(param, (err, data) => {
        if (err) res.json({ errorCode: 500 })
        else {
            
                    res.json({ errorCode: 200 })
                    let updateUser = data.Item
                    updateUser.password = Math.random().toString(36).slice(-8)
                    let param = {
                        TableName: "users",
                        Item: updateUser

                                } 
                    const transporter = nodeMailer.createTransport({
                        service: 'Gmail',
                        auth: {
                            user: 'newtechnode2020@gmail.com',
                            pass: 'nodejs2020'
                        }
                    })
                    let mainOption = {
                        from: 'New Tech Team',
                        to: receiver,
                        subject: "Reset your password",
                        text: ` Your new password:${updateUser.password} `
                    }
                    transporter.sendMail(mainOption, (err, info) => {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log("info")
                        }
                    })
                    dynamoDB.put(param, (err, data) => {
                        if (err) { res.json({ errorCode: 500 }) } else { res.json({ errorCode: 200 }) }
                    })
                    }
                })
            })
        

// function sendEmail(receiver, activeLink) {

//     const transporter = nodeMailer.createTransport({
//         service: 'Gmail',
//         auth: {
//             user: 'newtechnode2020@gmail.com',
//             pass: 'nodejs2020'
//         }
//     })
//     let mainOption = {
//         from: 'New Tech Team',
//         to: receiver,
//         subject: "Please click link reset your password",
//         text: `Click on ${activeLink}  to reset your password`
//     }
//     transporter.sendMail(mainOption, (err, info) => {
//         if (err) {
//             console.log(err)
//         } else {
//             console.log("info")
//         }
//     })
// }
module.exports = router;