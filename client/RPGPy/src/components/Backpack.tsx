import { useState, useEffect } from 'react';
import { Button, Spin, Card, message } from 'antd';
import axios from 'axios';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useUserStore } from '../../components/UserStore';
import '../css/Backpack.css';

const URL = import.meta.env.VITE_API_URL;
interface BackpackItem {
    id: string;
    name: string;
    category?: string;
    quantity?: number;
}

interface BackpackProps {
    onSelectItem?: (itemName: string) => void;
    onAddToInventory?: (itemName: string) => void;
}

export default function Backpack({ onSelectItem, onAddToInventory }: BackpackProps) {
    const [items, setItems] = useState<BackpackItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const {user} = useUserStore();

    const fetchBackpackItems = async () => {
        setLoading(true);
        try {

            const PackItem = await axios.get(`${URL}/user/v1/inventory/items/${user?.uid}`, {withCredentials:true});
            const Items: BackpackItem[] = PackItem.data.map((items: any)=>(
                {
                    id: items.id,
                    name: items.name,
                    category: items.category,
                    quantity: items.quantity || 1 // Default to 1 if quantity not provided
                }
            ));

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            setItems(Items);

        } catch (error) {
            console.error('Error fetching backpack items:', error);
            message.error('Failed to load backpack items');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBackpackItems();
    }, []);

    const handleItemClick = (item: BackpackItem) => {
        // Only one item can be selected at a time
        setSelectedItem(item.name);
        
        // Callback to parent component
        if (onSelectItem) {
            onSelectItem(item.name);
        }
    };

    const handleAddToInventory = () => {
        if (!selectedItem) {
            message.warning('Please select an item first');
            return;
        }

        // Find the selected item to get its quantity
        const selectedItemData = items.find(item => item.name === selectedItem);
        
        // Add selected item to GameUI inventory
        if (onAddToInventory) {
            onAddToInventory(selectedItem);
            message.success(`${selectedItem} ${selectedItemData?.quantity ? `(x${selectedItemData.quantity})` : ''} added to inventory!`);
            // Clear selection after adding
            setSelectedItem(null);
        }
    };
    
    const getCatColor = (cat: string) => {
        switch (cat) {
            case 'Skills': return '#95a5a6';
            case 'Weapon': return '#f39c12';
            default: return '#95a5a6';
        }
    };



    if (loading) {
        return (
            <div className="backpack-container loading">
                <Spin size="large" tip="Loading backpack..." />
            </div>
        );
    }

    return (
        <div className="backpack-container">
            <div className="backpack-header">
                <h2>🎒 Backpack Items</h2>
                <Button 
                    type="primary" 
                    onClick={fetchBackpackItems}
                    loading={loading}
                >
                    Refresh Items
                </Button>
            </div>

            <div className="backpack-content">
                {items.length === 0 ? (
                    <p className="empty-message">No items available</p>
                ) : (
                    <div className="backpack-grid">
                        {items.map((item) => (
                            <Card
                                key={item.id}
                                className={`backpack-item ${selectedItem === item.name ? 'selected' : ''}`}
                                onClick={() => handleItemClick(item)}
                                hoverable
                                // style={{ borderColor: selectedItem === item.name ? getRarityColor(item.rarity) : undefined }}
                            >
                                {selectedItem === item.name && (
                                    <CheckCircleOutlined className="selected-icon" />
                                )}
                                
                                {/* Quantity Badge */}
                                <div className="item-quantity-badge">
                                    x{item.quantity || 1}
                                </div>
                                
                                <div className="item-rarity" style={{ backgroundColor: getCatColor(item.category || "") }}>
                                    {item.category?.toUpperCase()}
                                </div>
                                <h3 className="item-name">{item.name}</h3>
                                <p className="item-description">{item.category}</p>
                                
                              
                                <p className="item-quantity-text">Quantity: {item.quantity || 1}</p>
                                {/*<p className="item-effect">Effect: {item.effect}</p> */}
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {selectedItem && (
                <div className="backpack-footer">
                    <div className="selected-info">
                        <span>Selected: <strong>{selectedItem}</strong></span>
                        {items.find(item => item.name === selectedItem)?.quantity && (
                            <span className="selected-quantity"> (Qty: {items.find(item => item.name === selectedItem)?.quantity})</span>
                        )}
                    </div>
                    <Button 
                        type="primary" 
                        size="large"
                        onClick={handleAddToInventory}
                    >
                        Add to Game Inventory
                    </Button>
                </div>
            )}
        </div>
    );
}