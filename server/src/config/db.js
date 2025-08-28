//config/db.js

const db = require("mysql2");


const connection=db.createPool({
    host: "localhost",
    user: "leow",
    password: "leow2208",
    database: "rpgpy",
    waitForConnections:true
})


// db.getConnection((err, connection)=>{
//     if(err){
//         console.error("Error connecting to database: ", err);
//         return;
//     } else{
//         console.log("Connected to database");
//         connection.release();
//     }
// })

module.exports = connection;

