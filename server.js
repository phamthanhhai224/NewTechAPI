require("dotenv").config();
const express = require("express");
const app = express();
const indexRoute = require('./routes/index')
const loginRoute = require('./routes/login')
const adminRoute = require('./routes/admin')
const userRoute = require('./routes/users')

app.use(express.json());
app.use('/', indexRoute)
app.use('/login', loginRoute)
app.use('/admin', adminRoute)
app.use('/admin/users', userRoute)
    //PORT
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
});