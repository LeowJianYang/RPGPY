const express = require('express');
const shopRoutes = express.Router();
const {promiseConnection}= require("../config/db");



// Fetch all products
shopRoutes.get('/v1/products', async (_req,res)=>{
      
    try{
        const [rows] = await promiseConnection.query("Select * from shop");
        return res.status(200).json(rows);
    } catch (error){
        console.error("Error fetching products:", error);
        return  res.status(500).json({ error: "Internal Server Error", det: error?.sqlState });
    }
});


shopRoutes.post('/v1/purchase/:productCat/:userId/:productId', async (req, res) => {
  const { userId, productId, productCat } = req.params;

  // Validate input parameters
  if (!userId || !productId || !productCat) {
    return res.status(400).json({ 
      error: "Missing required parameters",
      required: ["userId", "productId", "productCat"]
    });
  }

  // Validate userId and productId are numbers
  if (isNaN(parseInt(userId)) || isNaN(parseInt(productId))) {
    return res.status(400).json({ 
      error: "Invalid parameter format. userId and productId must be numbers" 
    });
  }

  // Validate product
  const validCategories = ["Decoration", "Skills", "Weapon", "Special", "Amour"];
  if (!validCategories.includes(productCat.trim())) {
    return res.status(400).json({ 
      error: "Invalid product category",
      validCategories: validCategories
    });
  }

  let connection;
  try {
    // Get a connection from pool using Promise
    connection = await promiseConnection.getConnection();
    await connection.beginTransaction(); 

    // Fetch product details
    const [productRows] = await connection.query(
      "SELECT * FROM shop WHERE prod_id = ?",
      [parseInt(productId)]
    );
    
    if (productRows.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ error: "Product not found" });
    }

    const product = productRows[0];

    // Verify product category matches
    if (product.prod_cat !== productCat) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ 
        error: "Product category mismatch",
        expected: product.prod_cat,
        provided: productCat
      });
    }

    // Check user balance
    const [userRows] = await connection.query(
      "SELECT Coin FROM userdata WHERE userId = ?",
      [parseInt(userId)]
    );
    
    if (userRows.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ error: "User not found" });
    }

    const userCoins = userRows[0].Coin;

    if (userCoins < product.prod_price) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ 
        error: "Insufficient balance",
        required: product.prod_price,
        available: userCoins
      });
    }

    // Check the counts of decoration items
    if (productCat === "Decoration") {
      const [invRows] = await connection.query(
        "SELECT counts FROM inventory WHERE userId = ? AND prod_id = ?",
        [parseInt(userId), parseInt(productId)]
      );

      if (invRows.length > 0 && invRows[0].counts >= 1) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ error: "You already own this decoration item" });
      }
    }

    // Deduct coins
    const newBalance = userCoins - product.prod_price;
    await connection.query(
      "UPDATE userdata SET Coin = ? WHERE userId = ?",
      [newBalance, parseInt(userId)]
    );

    // Add item to inventory
    if (productCat === "Decoration") {
      await connection.query(
        `INSERT INTO inventory (userId, prod_id, counts)
         VALUES (?, ?, 1)
         ON DUPLICATE KEY UPDATE counts = 1`,
        [parseInt(userId), parseInt(productId)]
      );
    } else {
      await connection.query(
        `INSERT INTO inventory (userId, prod_id, counts)
         VALUES (?, ?, 1)
         ON DUPLICATE KEY UPDATE counts = counts + 1`,
        [parseInt(userId), parseInt(productId)]
      );
    }

    await connection.commit(); // Commit transaction
    connection.release();

    return res.status(200).json({ 
      success: true,
      message: "Purchase successful",
      transaction: {
        userId: parseInt(userId),
        productId: parseInt(productId),
        productName: product.prod_name,
        price: product.prod_price,
        previousBalance: userCoins,
        newBalance: newBalance,
        category: productCat
      }
    });

  } catch (error) {
    console.error("Purchase error:", error);
    if (connection) {
      try {
        await connection.rollback();
        connection.release();
      } catch (rollbackError) {
        console.error("Rollback error:", rollbackError);
      }
    }
    return res.status(500).json({ 
      error: "Internal Server Error", 
      message: error.message,
      sqlState: error?.sqlState || error?.code
    });
  }
});


module.exports = shopRoutes;