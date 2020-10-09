const jwt = require('jsonwebtoken')
module.exports = function(req, res, next) {
    const token = req.header('auth-token')
    if (!token) return res.status(401).json({
        message: 'Access denied'
    })
    try {
        const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        req.body = verified
        next()
    } catch (err) {

    }
}