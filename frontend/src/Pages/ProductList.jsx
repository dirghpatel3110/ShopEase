import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import '../CSS/ProductList.css';
import Navbar from "./Navbar";

Modal.setAppElement('#root');

export default function ProductList() {
  
  const [productsByCategory, setProductsByCategory] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [confirmModalIsOpen, setConfirmModalIsOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [editedProduct, setEditedProduct] = useState({
    id: '',
    name: '',
    price: '',
    description: '',
    category: '',
    warranty_price: '',
    retailer_special_discounts:'',
    manufacturer_rebates:'',
    accessories: []
  });
  const [newAccessory, setNewAccessory] = useState({
    id: '',
    name: '',
    price: '',
    description: ''
  });
  const [addModalIsOpen, setAddModalIsOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    id:'',
    name: '',
    price: '',
    description: '',
    image:'',
    category: '',
    warranty_price: '',
    retailer_special_discounts:'',
    manufacturer_rebates:'',
    availableItems:'',
    accessories: []
  });
  const [newAccessoryForAdd, setNewAccessoryForAdd] = useState({ name: '', price: '', description: '' }); // State for accessory in add modal

  const openAddModal = () => setAddModalIsOpen(true);
  const closeAddModal = () => {
    setAddModalIsOpen(false);
    setNewProduct({
        id:'',
        name: '',
        price: '',
        description: '',
        image:'',
        category: '',
        warranty_price: '',
        retailer_special_discounts:'',
        manufacturer_rebates:'',
        availableItems:'',
        accessories: []
    });
    setNewAccessoryForAdd({id:'', name: '', price: '', description: '' }); 
  };

  const handleNewProductInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleNewAccessoryForAddChange = (e) => {
    const { name, value } = e.target;
    setNewAccessoryForAdd({ ...newAccessoryForAdd, [name]: value });
  };

  const addAccessoryForAdd = () => {
    setNewProduct({
      ...newProduct,
      accessories: [...newProduct.accessories, newAccessoryForAdd]
    });
    setNewAccessoryForAdd({ name: '', price: '', description: '' }); 
  };

  useEffect(() => {
    axios.get('http://localhost:5001/api/auth/products')
      .then(response => {
        setProductsByCategory(response?.data); 
      })
      .catch(error => {
        console.error('There was an error fetching the products!', error);
      });
  }, []);

  const handleDelete = (productId, category) => {
    setProductToDelete({ id: productId, category });
    setConfirmModalIsOpen(true);
  };

  const confirmDelete = () => {
    const { id } = productToDelete; // Destructure only the id
  
    // Use the id to delete the product
    axios.delete(`http://localhost:5001/api/auth/products/${id}`)
      .then(() => {
        // Remove the product from the products array using filter
        setProductsByCategory(prevProducts => prevProducts.filter(product => product.id !== id));
  
        // Close the confirmation modal after deletion
        closeConfirmModal();
      })
      .catch(error => {
        console.error('There was an error deleting the product!', error);
      });
  };
  
  

  const handleView = (productId) => {
    const product = productsByCategory.find(p => p.id === productId);
    setSelectedProduct(product);
    setModalIsOpen(true);
  };

  const handleEdit = (productId) => {
    const product = productsByCategory.find(p => p.id === productId);
    setEditedProduct(product);
    setEditModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedProduct(null);
  };

  const closeEditModal = () => {
    setEditModalIsOpen(false);
    setEditedProduct({
      id: '',
      name: '',
      price: '',
      description: '',
      category: '',
      warranty_price: '',
      retailer_special_discounts:'',
      manufacturer_rebates:'',
      accessories: []
    });
  };

  const closeConfirmModal = () => {
    setConfirmModalIsOpen(false);
    setProductToDelete(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct({ ...editedProduct, [name]: value });
  };

  const handleAccessoryChange = (index, e) => {
    const { name, value } = e.target;
    const updatedAccessories = [...editedProduct.accessories];
    updatedAccessories[index] = {
      ...updatedAccessories[index],
      [name]: value
    };
    setEditedProduct({ ...editedProduct, accessories: updatedAccessories });
  };

  const addAccessory = () => {
    setEditedProduct({
      ...editedProduct,
      accessories: [...editedProduct.accessories, newAccessory]
    });
    setNewAccessory({ id: '', name: '', price: '', description: '' });
  };

  const submitEdit = (e) => {
    e.preventDefault();
  
    // Prepare the product object to update
    const productToUpdate = {
      ...editedProduct,
      id: String(editedProduct.id), // Ensure ID is a string
    };
  
    // Make the PUT request to update the product
    axios.put(`http://localhost:5001/api/auth/products/${productToUpdate.id}`, productToUpdate)
      .then((response) => {
        if (response.status === 200) {
          const updatedProduct = response.data.updatedProduct; // Extract updated product from API response
  
          // Update the specific product by ID
          setProductsByCategory((prevProducts) =>
            prevProducts.map((product) =>
              product.id === updatedProduct.id ? updatedProduct : product
            )
          );
  
          // Close the edit modal after a successful update
          closeEditModal();
        }
      })
      .catch((error) => {
        console.error('Error updating product:', error.message);
      });
  };
  
  const submitAddProduct = (e) => {
    e.preventDefault();
  
    axios.post('http://localhost:5001/api/auth/products', newProduct)
      .then(response => {
        if (response.status === 201) {
          // Assuming 'response.data.product' contains the new product data
          const updatedProduct = response.data.product;
  
          // Update the state with the new product (assuming 'products' is an array)
          setProductsByCategory(prevProducts => [...prevProducts, updatedProduct]);
  
          // Close modal after submission
          closeAddModal();
        }
      })
      .catch(error => {
        console.error('There was an error adding the product!', error);
      });
  };


  const generateProductWithAI = () => {
    axios
      .post('http://localhost:5001/api/auth/product-ai')
      .then(response => {
        if (response.status === 200) {
          const generatedProduct = response.data.data;
  
          // Update the form with generated product details
          setNewProduct({
            ...newProduct,
            ...generatedProduct,
            accessories: generatedProduct.accessories || [],
          });
        }
      })
      .catch(error => {
        console.error('Error generating product with AI:', error);
        alert('There was an error generating the product. Please try again.');
      });
  };
  
  

  return (
    <>
    <Navbar/>
    <div className='list-product'>
      <h1>All Products List</h1>
      <div className="btn"><p><button className='add' onClick={openAddModal}>ADD</button></p></div>
        <div>
          <div className="listproduct-format-main">
            <p>Id</p>
            <p>Name</p>
            <p>Price</p>
            <p>View</p>
            <p>Edit</p>
            <p>Remove</p>
          </div>
          <div className="listproduct-allproduct">
            <hr />
            {productsByCategory.map(product => (
              <div key={product.id} className="listproduct-format-main">
                <p>{product.id}</p>
                <p>{product.name}</p>
                <p>${product.price}</p>
                <p><button onClick={() => handleView(product.id)}>View</button></p>
                <p><button onClick={() => handleEdit(product.id)}>Edit</button></p>
                <p><button onClick={() => handleDelete(product.id)}>Remove</button></p>
              </div>
            ))}
          </div>
        </div>     
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Product Details"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Product Details</h2>
        {selectedProduct ? (
          <div>
            <p><strong>Id:</strong> {selectedProduct.id}</p>
            <p><strong>Name:</strong> {selectedProduct.name}</p>
            <p><strong>Price:</strong> ${selectedProduct.price}</p>
            <p><strong>Description:</strong> {selectedProduct.description}</p>
            <p><strong>Category:</strong> {selectedProduct.category}</p>
            <p><strong>Image:</strong>{selectedProduct.image}</p>
            <p><strong>Warranty:</strong> ${selectedProduct.warranty_price}</p>
            <p><strong>Retailer-Special-Discounts:</strong> ${selectedProduct.retailer_special_discounts}</p>
            <p><strong>Manufacturer-Rebate:</strong> ${selectedProduct.manufacturer_rebates}</p>
            <p><strong>AvailableItems:</strong>{selectedProduct.availableItems}</p>
            <br />
            <h3>Accessories:</h3>
            {selectedProduct.accessories.map((accessory, index) => (
              <div key={index}>
                <p><strong>Id:</strong>{accessory.id}</p>
                <p><strong>Accessory Name:</strong> {accessory.name}</p>
                <p><strong>Price:</strong> ${accessory.price}</p>
                <p><strong>Description:</strong> {accessory.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No product selected</p>
        )}
        <br />
        <button onClick={closeModal} className="cancel-button">Close</button>
      </Modal>
      <Modal
        isOpen={addModalIsOpen}
        onRequestClose={closeAddModal}
        contentLabel="Add Product"
        className="edit-modal"
        overlayClassName="overlay"
      >
        <h2>Add Product</h2>
        <button onClick={generateProductWithAI} style={{ marginBottom: '15px', backgroundColor: '#007bff', color: '#fff' }}>
          Generate Product with AI
        </button>
        <form onSubmit={submitAddProduct}>
        <label>Name</label>
        <input type="text" name="name" value={newProduct.name} onChange={handleNewProductInputChange} required />
          <label>Id</label>
          <input type="text" name="id" value={newProduct.id} onChange={handleNewProductInputChange} required />
          <label>Price</label>
          <input type="text" name="price" value={newProduct.price} onChange={handleNewProductInputChange} required />
          <label>Description</label>
          <input type="text" name="description" value={newProduct.description} onChange={handleNewProductInputChange} />
          <label>Category</label>
          <input type="text" name="category" value={newProduct.category} onChange={handleNewProductInputChange} required />
          <label>Image URL</label>
            <input 
            type="text" 
            name="image" 
            value={newProduct.image} 
            onChange={handleNewProductInputChange} 
            required 
            />
          <label>Warranty</label>
          <input type="text" name="warranty_price" value={newProduct.warranty_price} onChange={handleNewProductInputChange} />
          <label>Retailer-Special-Discounts</label>
          <input type="text" name="retailer_special_discounts" value={newProduct.retailer_special_discounts} onChange={handleNewProductInputChange} />
          <label>Manufacturer-Rebate</label>
          <input type="text" name="manufacturer_rebates" value={newProduct.manufacturer_rebates} onChange={handleNewProductInputChange} />
          <label>availableItems</label>
          <input type="text" name="availableItems" value={newProduct.availableItems} onChange={handleNewProductInputChange} required />
          <h3>Add Accessories:</h3>
          <input type="text" placeholder="Accessory Id" name="id" value={newAccessoryForAdd.id} onChange={handleNewAccessoryForAddChange} />
          <input type="text" placeholder="Accessory Name" name="name" value={newAccessoryForAdd.name} onChange={handleNewAccessoryForAddChange} />
          <input type="text" placeholder="Accessory Price" name="price" value={newAccessoryForAdd.price} onChange={handleNewAccessoryForAddChange} />
          <input type="text" placeholder="Accessory Description" name="description" value={newAccessoryForAdd.description} onChange={handleNewAccessoryForAddChange} />
          <button style={{backgroundColor:'#218838'}} type="button" onClick={addAccessoryForAdd}>Add Accessory</button>

          <div className="button-container">
            <button type="submit">Add Product</button>
            <button type="button" onClick={closeAddModal} className="cancel-button">Cancel</button>
          </div>
        </form>
      </Modal>
      <Modal
        isOpen={editModalIsOpen}
        onRequestClose={closeEditModal}
        contentLabel="Edit Product"
        className="edit-modal"
        overlayClassName="overlay"
      >
        <h2>Edit Product</h2>
        <form onSubmit={submitEdit}>
          <label>Id</label>
          <input type="text" name="id" value={editedProduct.id} onChange={handleInputChange} />
          <label>Name</label>
          <input type="text" name="name" value={editedProduct.name} onChange={handleInputChange} />
          <label>Price</label>
          <input type="text" name="price" value={editedProduct.price} onChange={handleInputChange} />
          <label>Description</label>
          <input type="text" name="description" value={editedProduct.description} onChange={handleInputChange} />
          <label>Category</label>
          <input type="text" name="category" value={editedProduct.category} onChange={handleInputChange} />
          <label>Image</label>
          <input type="text" name="image" value={editedProduct.image} onChange={handleInputChange} />
          <label>Warranty</label>
          <input type="text" name="warranty_price" value={editedProduct.warranty_price} onChange={handleInputChange}/>
          <label>Retailer-Special-Discounts</label>
          <input type="text" name="retailer_special_discounts" value={editedProduct.retailer_special_discounts
} onChange={handleInputChange} />
          <label>Manufacturer-Rebate</label>
          <input type="text" name="manufacturer_rebates" value={editedProduct.manufacturer_rebates} onChange={handleInputChange} />
          <label>AvailableItems</label>
          <input type="text" name="availableItems" value={editedProduct.availableItems} onChange={handleInputChange} />
          <h3>Edit Accessories:</h3>
          {editedProduct.accessories.map((accessory, index) => (
            <div key={index}>
              <input
                type="text"
                name="id"
                value={accessory.id}
                onChange={(e) => handleAccessoryChange(index, e)}
                placeholder="Accessory ID"
              />
              <input
                type="text"
                name="name"
                value={accessory.name}
                onChange={(e) => handleAccessoryChange(index, e)}
                placeholder="Accessory Name"
              />
              <input
                type="text"
                name="price"
                value={accessory.price}
                onChange={(e) => handleAccessoryChange(index, e)}
                placeholder="Accessory Price"
              />
              <input
                type="text"
                name="description"
                value={accessory.description}
                onChange={(e) => handleAccessoryChange(index, e)}
                placeholder="Accessory Description"
              />
            </div>
          ))}

          <h3>Add New Accessory:</h3>
          <input
            type="text"
            placeholder="Accessory Id"
            name="id"
            value={newAccessory.id}
            onChange={(e) => setNewAccessory({ ...newAccessory, id: e.target.value })}
          />
          <input
            type="text"
            placeholder="Accessory Name"
            name="name"
            value={newAccessory.name}
            onChange={(e) => setNewAccessory({ ...newAccessory, name: e.target.value })}
          />
          <input  
            type="text"
            placeholder="Accessory Price"
            name="price"
            value={newAccessory.price}
            onChange={(e) => setNewAccessory({ ...newAccessory, price: e.target.value })}
          />
          <input
            type="text"
            placeholder="Accessory Description"
            name="description"
            value={newAccessory.description}
            onChange={(e) => setNewAccessory({ ...newAccessory, description: e.target.value })}
          />
          <button style={{backgroundColor:'#218838'}} type="button" onClick={addAccessory}>Add Accessory</button>

          <div className="button-container">
            <button style={{backgroundColor:'#218838'}} type="submit">Save Changes</button>
            <button  type="button" onClick={closeEditModal} className="cancel-button">Cancel</button>
          </div>
        </form>
      </Modal>
      <Modal
        isOpen={confirmModalIsOpen}
        onRequestClose={closeConfirmModal}
        contentLabel="Confirm Delete"
        className="confirm-modal"
        overlayClassName="overlay"
      >
        <h2>Confirm Delete</h2>
        <p>Are you sure you want to delete this product?</p>
        <div className="button-container">
          <button onClick={confirmDelete}>Yes</button> &nbsp;
          <button onClick={closeConfirmModal} className="cancel-button">No</button>
        </div>
      </Modal>
    </div>
    </>
  );
}
