const jwt = require('jsonwebtoken')
module.exports = function(req, res, next) {
    const token = req.header('auth-token')
    if (!token) return res.status(401).json({
        errorCode: 401 // Khong co token
    })
    try {
        const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        req.body = verified
        next()
    } catch (err) {
        res.status(401).json({
            errorCode: 401 //Token khong hop le
        })
    }
}