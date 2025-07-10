import React, { useState } from 'react';
import app  from '../firebase';
//import { db, storage } from './firebase'; // Your Firebase initialization
import { v4 as uuidv4 } from 'uuid';

const PurchaseOrderForm = () => {
  
    const [order, setOrder] = useState({
    orderId: uuidv4(),
    customerName: '',
    date: new Date().toISOString().split('T')[0],
    items: Array(5).fill().map((_, i) => ({
      id: uuidv4(),
      materialId: '',
      name: '',
      quantity: 1,
      price: 0,
      imgFile: null,
      imgUrl: ''
    }))
  });

  const handleInputChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...order.items];
    updatedItems[index] = { ...updatedItems[index], [name]: value };
    setOrder({ ...order, items: updatedItems });
  };

  const handleImageUpload = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate image file
    if (!file.type.match('image.*')) {
      alert('Please upload an image file');
      return;
    }

    const updatedItems = [...order.items];
    updatedItems[index] = { 
      ...updatedItems[index], 
      imgFile: file,
      // Show preview while waiting for upload
      imgUrl: URL.createObjectURL(file) 
    };
    setOrder({ ...order, items: updatedItems });
  };

  const uploadImage = async (file, itemId) => {
    if (!file) return null;
    
    const storagePath = `purchase_orders/${order.orderId}/items/${itemId}/${file.name}`;
    const storageRef = storage.ref(storagePath);
    
    try {
      const snapshot = await storageRef.put(file);
      const downloadUrl = await snapshot.ref.getDownloadURL();
      return { url: downloadUrl, path: storagePath };
    } catch (error) {
      console.error("Upload failed:", error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Upload all images first
      const uploadPromises = order.items.map(item => 
        item.imgFile ? uploadImage(item.imgFile, item.id) : null
      );
      
      const uploadResults = await Promise.all(uploadPromises);

      // Update items with image URLs
      const itemsWithUrls = order.items.map((item, index) => ({
        ...item,
        imgUrl: uploadResults[index]?.url || '',
        imgPath: uploadResults[index]?.path || '',
        // Remove the File object before saving
        imgFile: undefined 
      }));

      // Prepare the final order data
      const orderData = {
        ...order,
        items: itemsWithUrls,
        createdAt: new Date().toISOString()
      };

      // Save to Firestore
      await db.collection('purchaseOrders').doc(order.orderId).set(orderData);
      
      alert('Purchase order saved successfully!');
    } catch (error) {
      console.error("Error saving order:", error);
      alert('Failed to save purchase order');
    }
  };

  return (
    <div className="purchase-order-form">
      <h2>Create Purchase Order</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Customer Name</label>
          <input
            type="text"
            value={order.customerName}
            onChange={(e) => setOrder({...order, customerName: e.target.value})}
            required
          />
        </div>

        <h3>Items</h3>
        {order.items.map((item, index) => (
          <div key={item.id} className="item-card">
            <h4>Item {index + 1}</h4>
            
            <div className="form-group">
              <label>Material ID</label>
              <input
                type="text"
                name="materialId"
                value={item.materialId}
                onChange={(e) => handleInputChange(index, e)}
                required
              />
            </div>

            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={item.name}
                onChange={(e) => handleInputChange(index, e)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={item.quantity}
                  onChange={(e) => handleInputChange(index, e)}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  name="price"
                  value={item.price}
                  onChange={(e) => handleInputChange(index, e)}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Product Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(index, e)}
              />
              {item.imgUrl && (
                <div className="image-preview">
                  <img src={item.imgUrl} alt="Preview" width="100" />
                </div>
              )}
            </div>
          </div>
        ))}

        <button type="submit" className="submit-btn">
          Save Purchase Order
        </button>
      </form>
    </div>
  );
};

export default PurchaseOrderForm;