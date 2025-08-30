//config/db.js

const db = require("mysql2");

const url = new URL(process.env.SERVICE_URI);


const connection=db.createPool({
    host: process.env.DB_INFF_HN,
    user: process.env.DB_INFF_UN,
    password: process.env.DB_INFF_PW,
    database: url.pathname.replace("/",""),
    port:process.env.DB_INFF_PR,
    waitForConnections:true,
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

