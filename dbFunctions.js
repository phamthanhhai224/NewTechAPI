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
const getAllUser = async() => {
    try {
        let param = { TableName: "users" }
        const data = await dynamoDB.scan(param).promise()
        return { error: false, data: data.Items }
    } catch (error) {
        return { error: true, data: error }
    }
}
const findUserById = async(id) => {
    try {
        let param = {
            TableName: "users",
            Key: {
                user_id: id
            }
        }
        const data = await dynamoDB.get(param).promise()
        return ({ error: false, data: data.Item })
    } catch (error) {
        return ({ error: true, data: error })
    }
}
const updateUserImage = async(user_id, location) => {
    try {
        let param = {
            TableName: "users",
            Key: {
                user_id: user_id
            },
            UpdateExpression: "set image= :i",
            ExpressionAttributeValues: {
                ":i": location
            }
        }
        const data = await dynamoDB.update(param).promise()
        return ({ error: false, data: data })
    } catch (error) {
        return { error: true, data: error }
    }
}
module.exports = {
    getAllUser,
    findUserById,
    updateUserImage
}