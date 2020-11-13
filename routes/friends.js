const express = require('express')
const router = express.Router()
const aws = require("aws-sdk");
const dbFunctions = require('../dbFunctions');
const auth = require('../auth');
const { getAllFriendRequest } = require('../dbFunctions');
let awsConfig = {
    region: "us-east-2",
    endpoint: "http://dynamodb.us-east-2.amazonaws.com",
    accessKeyId: process.env.AWSAccessKeyId,
    secretAccessKey: process.env.AWSSecretKey,
};
aws.config.update(awsConfig);
router.use(auth)
const dynamoDB = new aws.DynamoDB.DocumentClient();
router.get('/', async(req, res) => {
    const allFriends = await dbFunctions.getAllFriend(req.user.user_id)
    if (!allFriends.error) res.json({ errorCode: 200, friends: allFriends.friends })
    else res.json({ errorCode: 500 })
})
router.get('/request', async(req, res) => {
    const allRequest = await dbFunctions.getAllFriendRequest(req.user.user_id)
    if (!getAllFriendRequest.error) res.json({ errorCode: 200, request: allRequest.data })
    else res.json({ errorCode: 500 })
})

/* request body { 
    accept_user_id:user_id
}
 */
router.put('/accept', async(req, res) => {
    let acceptedUserId = req.body.accept_user_id
    let error = false
        // user who accept receive
    let allFriendReceive = await dbFunctions.getAllFriendReceive(req.user.user_id)
    let acceptedAllFriendRequest = await dbFunctions.getAllFriendRequest(acceptedUserId)
    if (!allFriendReceive.error) {
        let allFriends = allFriendReceive.friends
        let allReceive = allFriendReceive.receive
        allFriends.push(acceptedUserId)
        for (let i = 0; i < allReceive.length; i++) {
            if (allReceive[i] == acceptedUserId) {
                allReceive.splice(i, 1)
            }
        }
        await dbFunctions.updateFriendAndReceive(req.user.user_id, allFriends, allReceive)
    } else error = true
        //user who being accepted
    if (!acceptedAllFriendRequest.error) {
        let acceptedFriend = acceptedAllFriendRequest.friends
        let acceptedRequest = acceptedAllFriendRequest.request
        acceptedFriend.push(req.user.user_id)
        for (let i = 0; i < acceptedRequest.length; i++) {
            if (acceptedRequest[i] == req.user.user_id) {
                acceptedRequest.splice(i, 1)
            }
        }
        console.log(acceptedRequest, "acceptedAllRequest")
        console.log(acceptedFriend, "acceptedAllFriend")
        await dbFunctions.updateFriendAndRequest(acceptedUserId, acceptedFriend, acceptedRequest)
    } else error = true


    if (error) res.json({ errorCode: 500 })
    else res.json({ errorCode: 200 })

})

/* request body {
    request_to_user_id: user_id
} */
router.put('/request', async(req, res) => {
    let requestToUserId = req.body.request_to_user_id
        //user send request
    let error = false
    let allRequest = await dbFunctions.getAllRequestReceive(req.user.user_id)
    if (!allRequest.error) {
        allRequest = allRequest.request
        allRequest.push(requestToUserId)
        await dbFunctions.updateRequest(req.user.user_id, allRequest)
    } else error = true
        //user RECEIVE the request
    let allReceiveUser = await dbFunctions.getAllRequestReceive(requestToUserId)
    if (!allReceiveUser.error) {
        allReceiveUser = allReceiveUser.receive
        allReceiveUser.push(req.user.user_id)
        await dbFunctions.updateReceive(requestToUserId, allReceiveUser)
    } else error = true
    if (!error) res.json({ errorCode: 200 })
    else res.json({ errorCode: 500 })
})

/*request body {
    un_request_to_user_id: user_id
} */
router.put('/unrequest', async(req, res) => {
        let unRequestToUserId = req.body.un_request_to_user_id
        let allRequest = await dbFunctions.getAllRequestReceive(req.user.user_id)
        let error = false
        if (!allRequest.error) {
            allRequest = allRequest.request
            for (let i = 0; i < allRequest.length; i++) {
                if (allRequest[i] == unRequestToUserId)
                    allRequest.splice(i, 1)
            }
            await dbFunctions.updateRequest(req.user.user_id, allRequest)
        } else error = true
        let allReceive = await dbFunctions.getAllRequestReceive(unRequestToUserId)
        if (!allReceive.error) {
            allReceive = allReceive.receive
            for (let i = 0; i < allReceive.length; i++) {
                if (allReceive[i] == req.user.user_id) {
                    allReceive.splice(i, 1)
                }
            }
            await dbFunctions.updateReceive(unRequestToUserId, allReceive)
        } else error = true
        if (!error) res.json({ errorCode: 200 })
        else res.json({ errorCode: 500 })
    })
    /*request body {
        unfriend_user_id:user_id
    } des remove unfriend_user_id from friend list*/

router.put('/unfriend', async(req, res) => {
    let unfriendUser = req.body.unfriend_user_id
    let allFriend = await dbFunctions.getAllFriend(req.user.user_id)
    let error = false
    if (!allFriend.error) {
        allFriend = allFriend.friends
        for (let i = 0; i < allFriend.length; i++) {
            if (allFriend[i] == unfriendUser)
                allFriend.splice(i, 1)
        }
        await dbFunctions.updateFriend(req.user.user_id, allFriend)
    } else error = true
    let allPoorUserFriend = await dbFunctions.getAllFriend(unfriendUser)
    if (!allPoorUserFriend.error) {
        allPoorUserFriend = allPoorUserFriend.friends
        for (let i = 0; i < allPoorUserFriend.length; i++) {
            if (allPoorUserFriend[i] == req.user.user_id) {
                allPoorUserFriend.splice(i, 1)
            }
        }
        await dbFunctions.updateFriend(unfriendUser, allPoorUserFriend)
    } else error = true
    if (!error) res.json({ errorCode: 200 })
    else res.json({ errorCode: 500 })
})
module.exports = router