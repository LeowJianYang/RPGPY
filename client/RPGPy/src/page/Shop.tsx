import React, { useState, useEffect } from 'react';
import { SearchOutlined, FilterOutlined, HeartOutlined, StarFilled } from '@ant-design/icons';
import type { Product } from '../../components/ProductsTypes';
import '../css/Shop.css';
import axios from 'axios';
import api from '../utils/api';
import { useUserStore } from '../../components/UserStore';
const URL= import.meta.env.VITE_API_URL;
import { ModalForm } from '../components/Modal';
import type { ModalFormProps } from '../utils/ButtonCompo';
import { SelfButton } from '../components/Modal';
import { useToast } from '../components/Toast';

const categories = ['All', 'Skills', 'Decoration', 'Weapon'];

const ShopPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [wishlistItems, setWishlistItems] = useState<number[]>([]);
  const {user} = useUserStore();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalProps, setModalProps] = useState<ModalFormProps>();
  const [coins, setCoins]  = useState<number>(0);
  const {notify} = useToast();

  const fetchProducts = async () =>{
        try{

            const res = await api.get(`${URL}/shop/v1/products`, {withCredentials:true});

            const fetchedProducts: Product[] = res.data.map((products: any) => ({
                id: products.prod_id,
                name: products.prod_name,
                category: products.prod_cat,
                price: products.prod_price,
                imageUrl: products.prod_name + ".png",
                description: products.prod_desc ?? ""
            }));

            setProducts(fetchedProducts);
            setFilteredProducts(fetchedProducts);
        } 
        catch {
            console.error("Failed to fetch products from API, using mock data.");
        }
  };

  const fetchCoins = async () => {
     try {
        const res = await api.get(`${URL}/user/v1/coins/${user?.uid}`, {withCredentials:true});
        setCoins(res.data.Coin);
     }
     catch (err){
        console.error("Failed to fetch coins:", err);
     }
  }


  useEffect(() => {
    fetchProducts();
    fetchCoins();
    //setFilteredProducts(products);
  }, []);

  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort products
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchTerm, sortBy]);

  const handlePurchaseModal = (items:Product) => {
    setModalProps({
      title: "Confirm Purchase?",
      open: modalOpen,
      onOk: () => {handlePurchase(items)},
      onCancel: () => {setModalOpen(false)},
      children: 
      <>
        <p>Are you sure you want to purchase this item?</p>
        <div style={{marginBottom: '1rem'}}>
           <picture>
              <img src={items.imageUrl} alt={items.name} />
           </picture>
           <p><strong>Items: </strong> {items.name}</p>
           <p><strong>Price: </strong> C$ {items.price?.toFixed(2) ?? 0}</p>
           <p><strong>Description: </strong> {items.description}</p>
        </div>
      </>,
      footer: 
      <>
        <SelfButton type='primary' onClick={()=>{handlePurchase(items)}}>
           Purchase
        </SelfButton>

        <SelfButton type='danger' onClick={()=>{setModalOpen(false)}}>
            Cancel
        </SelfButton>
      </>
    });
    setModalOpen(true);

  }

  const handlePurchase = async (product: Product) => {
    await axios.post(`${URL}/shop/v1/purchase/${product?.category}/${user?.uid}/${product?.id}`,{},{withCredentials:true} ).then((_res)=>{
      
      notify( "success",  "Purchase",  "Purchase Successful!",  "topRight" );
      fetchCoins();
    }) 
    .catch((err:any)=>{
      notify( "error",  "Purchase",  "Purchase Failed! Reason: " + err?.response.data.error ,  "topRight" );
      console.error("Purchase failed:", err);
    })
  };

  const handleToggleWishlist = (productId: number | string) => {
    setWishlistItems(prev => 
      prev.includes(Number(productId))
        ? prev.filter(id => id !== Number(productId))
        : [...prev, Number(productId)]
    );
  };

  return (
    <div className="shop-container">
      
      {/* Hero Section */}
      <section className="shop-hero">
        <div className="shop-hero-content">
          <h1 className="shop-hero-title">Discover Amazing Products</h1>
          <p className="shop-hero-subtitle">Curated collection of premium items for your lifestyle</p>
          <div className="shop-hero-stats">
            <div className="stat-item">
              <span className="stat-number">{products.length}+</span>
              <span className="stat-label">Products</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">4.8</span>
              <span className="stat-label">Rating</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="shop-controls">
        <div className="controls-container">
          {/* Search Bar */}
          <div className="search-container">
            <SearchOutlined className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Filter Controls */}
          <div className="filter-controls">
            <div className="filter-group">
              <FilterOutlined className="filter-icon" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            <div className='coin-display'>
              <picture>
                <img src="/Icon/coin.png" alt="Coin Icon" className="coin-icon" />
              </picture>
              <p className='coin-text'>C$ {coins?.toFixed(2) ?? 0}</p>
            </div>

          
          </div>
        </div>

        {/* Category Filter */}
        <div className="category-filter">
          <div className="category-pills">
            {categories.map(category => (
              <button
                key={category}
                className={`category-pill ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <main className="shop-main">
        <div className="products-container">
          {filteredProducts.length === 0 ? (
            <div className="no-products">
              <h3>No products found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image-container">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="product-image"
                    />
                    <button 
                      className={`wishlist-btn ${wishlistItems.includes(Number(product.id)) ? 'active' : ''}`}
                      onClick={() => handleToggleWishlist(product.id)}
                    >
                      <HeartOutlined />
                    </button>
                    <div className="product-category-badge">
                      {product.category}
                    </div>
                  </div>
                  
                  <div className="product-content">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                    
                    <div className="product-rating">
                      {[...Array(5)].map((_, i) => (
                        <StarFilled key={i} className="star-icon" />
                      ))}
                      <span className="rating-text">(4.8)</span>
                    </div>
                    
                    <div className="product-footer">
                      <div className="price-container">
                        <span className="product-price">C$ {product.price.toFixed(2)}</span>
                      </div>
                      
                      <button 
                        className="add-to-cart-btn"
                        onClick={() => handlePurchaseModal(product)}
                      >
                        Purchase
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <ModalForm
        open={modalOpen}
        title={`${modalProps?.title}`}
        onOk={modalProps?.onOk}
        onCancel={modalProps?.onCancel}
        onClose={modalProps?.onClose}
        footer={modalProps?.footer}
      >

        {modalProps?.children}

      </ModalForm>

    </div>
  );
};

export default ShopPage;