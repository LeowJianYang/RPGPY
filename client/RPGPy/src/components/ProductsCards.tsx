import React from 'react';
import type { Product } from '../../components/ProductsTypes'; 
import styles from '../css/module/ProductCard.module.css' 

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className={styles.productCard}>
      <div className={styles.imageContainer}>
        <img src={product.imageUrl} alt={product.name} className={styles.productImage} />
      </div>
      <div className={styles.productInfo}>
        <h3 className={styles.productName}>{product.name}</h3>
        <p className={styles.productPrice}>${product.price.toFixed(2)}</p>
      </div>
      <button className={styles.addToCartBtn}>Add to Cart</button>
    </div>
  );
};

export default ProductCard;