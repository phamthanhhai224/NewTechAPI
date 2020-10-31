require("dotenv").config();
const express = require("express");
const cors = require('cors')
const app = express();
const indexRoute = require('./routes/index')
const loginRoute = require('./routes/login')
const adminRoute = require('./routes/signup')
const userRoute = require('./routes/users')
const user = require('./routes/profile')
const signup = require('./routes/signup')
app.use(cors())
app.use(express.json());
app.use('/', indexRoute)
app.use('/login', loginRoute)
app.use('/admin', adminRoute)
app.use('/admin/users', userRoute)
app.use('/profile', user)
app.use('/signup', signup)
    //PORT
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
});