const aws = require('aws-sdk')
let awsConfig = {
    region: "us-east-2",
    endpoint: "http://dynamodb.us-east-2.amazonaws.com",
    accessKeyId: process.env.AWSAccessKeyId,
    secretAccessKey: process.env.AWSSecretKey,
};
aws.config.update(awsConfig);
const dynamoDB = new aws.DynamoDB.DocumentClient();
module.exports = function(req, res, next) {
    let param = {
        TableName: "users",
        Key: {
            "user_id": req.body.user_id
        }
    }
    dynamoDB.get(param, (err, data) => {
        if (err) return res.json({ message: "cant find user" })
        let user = data.Item
        if (user.admin) {
            next()
            return
        }
        res.json({ message: "you dont have permission" })

    })
}