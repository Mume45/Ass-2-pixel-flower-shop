// Modal.jsx
// Purpose: Displays detailed product information in a popup when a product is selected.
import React from 'react';

function Modal({ product, onClose, onAddToCart }) {
    // Props: product (object), onClose (function), onAddToCart (function)

    return (
        /* Closes modal when clicking on the darkened overlay */
        <div className="modal-overlay" onClick={onClose}>

            {/* Prevents modal from closing when clicking inside the content area */}
            <div className="modal-content" onClick={e => e.stopPropagation()}>

                <button className="close-btn" onClick={onClose}>X</button>

                <div className="modal-image-container">
                    <img
                        src={`/images/${product.image}.png`}
                        alt={product.name}
                        className="modal-product-image"
                    />
                </div>

                <h2 className="modal-title">{product.name}</h2>

                <p className="modal-category">
                    Category: {
                        product.category === 'single' ? 'Single Stem' :
                            product.category === 'bouquet' ? 'Bouquet' :
                                product.category === 'basket' ? 'Flower Basket' : 'Gift Box'
                    }
                </p>

                <p className="modal-description">{product.description}</p>
                <p className="modal-price">${product.price.toFixed(2)}</p>

                {/* Adds product to cart and closes modal simultaneously */}
                <button
                    className="modal-add-btn"
                    onClick={() => {
                        onAddToCart(product.id);
                        onClose();
                    }}
                >
                    + Add to Cart
                </button>
            </div>
        </div>
    );
}

export default Modal;