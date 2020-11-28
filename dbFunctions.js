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
const getUserById = async(id) => {
    try {
        let param = {
            TableName: "users",
            Key: {
                user_id: id
            }
        }
        const data = await dynamoDB.get(param).promise()
        return ({
            error: false,
            data: {
                user_id: data.Item.user_id,
                name: data.Item.name,
                image: data.Item.image,
                phone_num: data.Item.phone_num
            }
        })
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
const getAllFriend = async(user_id) => {
    try {
        let param = {
            TableName: "users",
            Key: {
                user_id: user_id
            }
        }
        const data = await dynamoDB.get(param).promise()
        return { error: false, friends: data.Item.friends }
    } catch (error) {
        return { error: true, data: error }
    }
}
const getAllFriendRequest = async(user_id) => {
    try {
        let param = {
            TableName: "users",
            Key: {
                user_id: user_id
            }
        }
        const data = await dynamoDB.get(param).promise()
        return { error: false, request: data.Item.request, friends: data.Item.friends }
    } catch (error) {
        return { error: true, data: error }
    }
}
const getAllFriendReceive = async(user_id) => {
    try {
        let param = {
            TableName: "users",
            Key: {
                user_id: user_id
            }
        }
        const data = await dynamoDB.get(param).promise()
        return { error: false, receive: data.Item.receive, friends: data.Item.friends }
    } catch (error) {
        return { error: true, data: error }
    }
}
const updateFriendAndReceive = async(user_id, newFriend, newReceive) => {
    try {
        let param = {
            TableName: "users",
            Key: {
                user_id: user_id
            },
            UpdateExpression: "set receive = :newReceiveList,friends = :newFriends",
            ExpressionAttributeValues: {
                ":newReceiveList": newReceive,
                ":newFriends": newFriend
            }
        }
        await dynamoDB.update(param).promise()
        return { error: false }
    } catch (error) {
        return { error: true, data: error }
    }
}
const updateFriendAndRequest = async(user_id, newFriend, newRequest) => {
    try {
        let param = {
            TableName: "users",
            Key: {
                user_id: user_id
            },
            UpdateExpression: "set #request = :newRequestList, friends = :newFriends",
            ExpressionAttributeNames: {
                "#request": "request"
            },
            ExpressionAttributeValues: {
                ":newRequestList": newRequest,
                ":newFriends": newFriend
            }
        }
        await dynamoDB.update(param).promise()
        return { error: false, data: data }
    } catch (error) {
        return { error: true, data: error }
    }
}
const getAllRequestReceive = async(user_id) => {
    try {
        let param = {
            TableName: "users",
            Key: {
                user_id: user_id
            }
        }
        const data = await dynamoDB.get(param).promise()
        return { error: false, request: data.Item.request, receive: data.Item.receive }
    } catch (error) {
        return { error: true, data: error }
    }
}
const updateRequest = async(user_id, newRequest) => {
    try {
        let param = {
            TableName: "users",
            Key: {
                user_id: user_id
            },
            UpdateExpression: "set #request = :newRequestList",
            ExpressionAttributeNames: {
                "#request": "request"
            },
            ExpressionAttributeValues: {
                ":newRequestList": newRequest,
            }
        }
        await dynamoDB.update(param).promise()
        return { error: false, data: data }
    } catch (error) {
        return { error: true, data: error }
    }
}
const updateReceive = async(user_id, newReceive) => {
    try {
        let param = {
            TableName: "users",
            Key: {
                user_id: user_id
            },
            UpdateExpression: "set #receive = :newReceiveList",
            ExpressionAttributeNames: {
                "#receive": "receive"
            },
            ExpressionAttributeValues: {
                ":newReceiveList": newReceive,
            }
        }
        await dynamoDB.update(param).promise()
        return { error: false, data: data }
    } catch (error) {
        return { error: true, data: error }
    }
}
const updateFriend = async(user_id, newFriend) => {
    try {
        let param = {
            TableName: "users",
            Key: {
                user_id: user_id
            },
            UpdateExpression: "set friends = :newFriends",
            ExpressionAttributeValues: {
                ":newFriends": newFriend
            }
        }
        await dynamoDB.update(param).promise()
        return { error: false, data: data }
    } catch (error) {
        return { error: true, data: error }
    }
}

module.exports = {
    getAllUser,
    getUserById,
    updateUserImage,
    getAllFriend,
    getAllFriendRequest,
    getAllFriendReceive,
    updateFriendAndReceive,
    updateFriendAndRequest,
    getAllRequestReceive,
    updateReceive,
    updateRequest,
    updateFriend,
}