//config/db.js

const db = require("mysql2");


const connection=db.createPool({
    host: process.env.DB_INFF_HN,
    user: process.env.DB_INFF_UN,
    password: process.env.DB_INFF_PW,
    database: process.env.DB_INFF_DBN,
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

