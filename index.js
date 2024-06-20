const express = require('express')
const mongoose = require('mongoose')
const config = require('config')
const fileUpload = require('express-fileupload')
const router = require('./routes/index')
const app = express()
const PORT = config.get('serverPort')



app.use(fileUpload({}))
app.use(express.json())
app.use('/api', router)


const start = async ()=>{
    try{
        mongoose.connect(config.get("databaseUrl"))
        app.listen(PORT, ()=>{
            console.log(`Сервер запущен на ${PORT} порту`)
        })
    }
    catch (e){

    }
}
start()
