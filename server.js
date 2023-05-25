var app =require('./index')
const http=require('http')
require('dotenv').config()


const server =http.createServer(app)

server.listen(process.env.PORT, (error) => {
    if (error) throw error
    console.log('App listening on port 3000!');
});