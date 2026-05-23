import React, { useState } from 'react';

function Modal({ product, onClose, onAddToCart }) {
    const [quantity, setQuantity] = useState(1);

    const categoryLabel =
        product.category === 'single' ? 'Single' :
            product.category === 'bouquet' ? 'Bouquet' :
                product.category === 'basket' ? 'Basket' : 'Gift Box';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="detail-modal" onClick={e => e.stopPropagation()}>
                <button className="detail-close-btn" onClick={onClose}>×</button>

                <div className="detail-left">
                    <div className="detail-frame">
                        <img
                            src={
                                product.image?.startsWith("data:image")
                                ? product.image
                                : `/images/${product.image}.png`
                            }
                            alt={product.name}
                            className="detail-product-img"
                        />
                    </div>

                    <img
                        src="/images/detail_decoration.png"
                        alt="decoration"
                        className="detail-decoration-img"
                    />
                </div>

                <div className="detail-right">
                    <h2 className="detail-title">{product.name}</h2>

                    <div className="detail-category">{categoryLabel}</div>

                    <div className="detail-divider"></div>

                    <p className="detail-price">${Number(product.price).toFixed(2)}</p>

                    <div className="detail-divider"></div>

                    <p className="detail-description">{product.description}</p>

                    <div className="detail-divider"></div>

                    <label className="detail-quantity-label">Quantity</label>

                    <div className="detail-quantity-row">
                        <button
                            className="detail-qty-btn"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                            −
                        </button>

                        <div className="detail-qty-number">{quantity}</div>

                        <button
                            className="detail-qty-btn"
                            onClick={() => setQuantity(quantity + 1)}
                        >
                            +
                        </button>
                    </div>

                    <button
                        className="detail-add-btn"
                        onClick={() => {
                            for (let i = 0; i < quantity; i++) {
                                onAddToCart(product.id);
                            }
                            onClose();
                        }}
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Modal;