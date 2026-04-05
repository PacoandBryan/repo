from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone
from sqlalchemy.orm import relationship


db = SQLAlchemy()


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)


class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    image_url = db.Column(db.String(255))
    image_filename = db.Column(db.String(255))
    icon = db.Column(db.String(50))
    display_order = db.Column(db.Integer, default=0)
    parent_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    level = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    parent = relationship('Category', remote_side=[id], backref='children')
    products = relationship('Product', back_populates='category', cascade='all, delete-orphan')


class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    sale_price = db.Column(db.Numeric(10, 2))
    sku = db.Column(db.String(50), unique=True, nullable=False)
    image_filename = db.Column(db.String(255))
    image_url = db.Column(db.String(255))
    image_data = db.Column(db.LargeBinary)
    inventory = db.Column(db.Integer, default=0)
    featured = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    category = relationship('Category', back_populates='products')
    images = relationship('ProductImage', back_populates='product', cascade='all, delete-orphan')
    promotions = relationship('Promotion', back_populates='product', cascade='all, delete-orphan')

    @property
    def active_promotion(self):
        """Return the currently active promotion (if any)."""
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        for promo in self.promotions:
            if not promo.is_active:
                continue
            if promo.starts_at and promo.starts_at > now:
                continue
            if promo.ends_at and promo.ends_at < now:
                continue
            return promo
        return None

    def effective_price(self):
        """Return the price after applying any active promotion or manual sale price."""
        promo = self.active_promotion
        if promo:
            if promo.discount_type == 'percentage':
                return round(float(self.price) * (1 - float(promo.discount_value) / 100), 2)
            elif promo.discount_type == 'fixed':
                return round(max(float(self.price) - float(promo.discount_value), 0), 2)
        
        # Fallback to manual sale_price column if no active promotion
        if self.sale_price is not None:
            return float(self.sale_price)
            
        return float(self.price)


class ProductImage(db.Model):
    __tablename__ = 'product_images'
    
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    url = db.Column(db.String(500))
    image_data = db.Column(db.LargeBinary)
    alt_text = db.Column(db.String(255))
    sort_order = db.Column(db.Integer, default=0)
    is_primary = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    product = relationship('Product', back_populates='images')


class Promotion(db.Model):
    __tablename__ = 'promotions'

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    label = db.Column(db.String(100), nullable=False)  # e.g. "Flash Sale 🔥"
    discount_type = db.Column(db.String(20), nullable=False, default='percentage')  # 'percentage' | 'fixed'
    discount_value = db.Column(db.Numeric(10, 2), nullable=False)
    starts_at = db.Column(db.DateTime, nullable=True)   # null = always started
    ends_at = db.Column(db.DateTime, nullable=True)     # null = never expires
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    product = relationship('Product', back_populates='promotions')
