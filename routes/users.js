const express = require('express')
const router = express.Router();
const aws = require("aws-sdk");
const verify = require('../auth')
const role_auth = require('../role_auth')
const nodeMailer = require('nodemailer')
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
    }) //cái này không chạy luôn,đừng quan tâm
    let param = {
        TableName: "users",
        Key: {
            user_id: req.params.user_id
        }
    }
    dynamoDB.delete(param, (err, data) => {
        if (err) res.json(err)
        res.json({
            errorCode: 200
        })
    })
})

/* method POST
    des: reset old password with new randomize password
    route : users/reset
*/
router.post('/reset/:user_id', (req, res) => {

    let param = {
        TableName: "users",
        Key: {
            user_id: req.params.user_id
        }
    }
    dynamoDB.get(param, (err, data) => {
        if (err) res.json({ errorCode: 500 })
        else {
            let updateUser = data.Item
            updateUser.password = Math.random().toString(36).slice(-8)
            let param = {
                TableName: "users",
                Item: updateUser

            }
            const transporter = nodeMailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.NEW_TECH_MAIL,
                    pass: process.env.NEW_TECH_MAIL_PASSWORD
                }
            })
            let mainOption = {
                from: 'New Tech Team',
                to: updateUser.email,
                subject: "We just reset your password",
                text: `Your new password is : ${updateUser.password}
                        please change your password!!`
            }
            transporter.sendMail(mainOption, (err, info) => {
                if (err) {
                    res.json({
                        errorCode: 500,
                        error: err
                    })
                } else {
                    res.json({
                        errorCode: 200,
                        msg: "send success"
                    })
                }
            })
            dynamoDB.put(param, (err, data) => {
                if (err) { res.json({ errorCode: 500 }) } else { res.json({ errorCode: 200 }) }
            })
        }
    })
})
router.post('/changepassword/:user_id', (req, res) => {

    let param = {
        TableName: "users",
        Key: {
            user_id: req.params.user_id
        }
    }
    dynamoDB.get(param, (err, data) => {
        if (err) res.json({ errorCode: 500 })
        else {
            let updateUser = data.Item
            updateUser.password = req.body.password
            let param = {
                TableName: "users",
                Item: updateUser

            }
            dynamoDB.put(param, (err, data) => {
                if (err) { res.json({ errorCode: 500 }) } else { res.json({ errorCode: 200 }) }
            })
        }
    })
})
// router.post('/forgetpassword/:email', (req, res) => {
    
    
//     let param = {
//         TableName: "users",
//         Key: {
//             email: req.params.email
//         }
//     }

//     let user = dynamoDB.get(param, (err, data) => {
//         if (err) res.json({ errorCode: 500 })
//         else {
//             let User = data.Item
//             dynamoDB.put(param, (err, data) => {
//                 if (err) {
//                     res.json({ errorCode: 500 })
//                 } else {
//                     res.json({ errorCode: 200 })
//                      let activeLink = process.env.ACTIVE_API + process.env.PORT + "/active/" + User.email
//                      sendEmail(User.email, activeLink)
//                     }
//                 })
//             }
//         })
// })
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