import os
from flask import redirect, url_for
from markupsafe import Markup
from wtforms.fields import PasswordField, StringField
from flask_admin import Admin, AdminIndexView, expose
from flask_admin.contrib.sqla import ModelView
from flask_admin.form import FileUploadField, Select2Field
from flask_login import current_user
from werkzeug.utils import secure_filename
from app.catalog_models import db, Product, Category, ProductImage, User

# Configure upload path relative to this file
file_path = os.path.abspath(os.path.dirname(__file__))
upload_path = os.path.join(file_path, '..', 'uploads')
os.makedirs(upload_path, exist_ok=True)


class SecureModelView(ModelView):
    def is_accessible(self):
        return current_user.is_authenticated

    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('admin_auth.login'))


class CategoryView(SecureModelView):
    form_extra_fields = {
        'image': FileUploadField('Image', base_path=upload_path, relative_path='uploads/')
    }
    column_list = ('id', 'name', 'slug', 'parent', 'display_order', 'is_active', 'image')
    column_labels = dict(id='ID', name='Name', slug='Slug', parent='Parent', display_order='Order', is_active='Active', image='Image')
    column_searchable_list = ('name', 'description')
    column_filters = ('is_active', 'parent')
    
    form_columns = ('name', 'slug', 'description', 'parent', 'image', 'icon', 'display_order', 'is_active')
    
    def _image_thumb(view, context, model, name):
        if not model.image_filename:
            return ''
        src = url_for('static', filename=f'uploads/{model.image_filename}')
        return Markup(f'<img src="{src}" alt="{model.name}" style="height:40px; border-radius:6px; box-shadow:0 2px 8px rgba(0,0,0,.15)"/>')

    column_formatters = {
        'image': _image_thumb
    }
    
    def on_model_change(self, form, model, is_created):
        if hasattr(form, 'image') and form.image.data:
            filename = secure_filename(form.image.data.filename)
            if filename:
                form.image.data.save(os.path.join(upload_path, filename))
                model.image_filename = filename


class ProductImageView(SecureModelView):
    column_list = ('id', 'product', 'original_filename', 'is_primary', 'sort_order')
    column_labels = dict(id='ID', product='Product', original_filename='Filename', is_primary='Primary', sort_order='Order')
    form_columns = ('product', 'original_filename', 'alt_text', 'is_primary', 'sort_order')
    
    column_filters = ('is_primary', 'product')


class ProductView(SecureModelView):
    form_extra_fields = {
        'image': FileUploadField('Main Image', base_path=upload_path, relative_path='uploads/'),
        'category': Select2Field('Category', choices=lambda: [(c.id, c.name) for c in Category.query.order_by('name').all()], coerce=int)
    }
    column_list = ('id', 'title', 'sku', 'price', 'category', 'inventory', 'featured', 'is_active', 'image')
    column_labels = dict(id='ID', title='Title', sku='SKU', price='Price', category='Category', inventory='Stock', featured='Featured', is_active='Active', image='Image')
    column_searchable_list = ('title', 'description', 'sku')
    column_filters = ('is_active', 'featured', 'category')
    
    form_columns = ('title', 'slug', 'description', 'price', 'sale_price', 'sku', 'category', 'inventory', 'featured', 'image', 'is_active')

    def _image_thumb(view, context, model, name):
        if not model.image_filename:
            return ''
        src = url_for('static', filename=f'uploads/{model.image_filename}')
        return Markup(f'<img src="{src}" alt="{model.title}" style="height:40px; border-radius:6px; box-shadow:0 2px 8px rgba(0,0,0,.15)"/>')

    column_formatters = {
        'image': _image_thumb
    }
    
    def on_model_change(self, form, model, is_created):
        if hasattr(form, 'image') and form.image.data:
            filename = secure_filename(form.image.data.filename)
            if filename:
                form.image.data.save(os.path.join(upload_path, filename))
                model.image_filename = filename


class UserView(SecureModelView):
    column_list = ('id', 'username', 'email', 'is_active')
    column_labels = dict(id='ID', username='Username', email='Email', is_active='Active')
    column_searchable_list = ('username', 'email')
    form_excluded_columns = ('password_hash',)
    form_extra_fields = {
        'password': PasswordField('Set/Change Password')
    }

    def on_model_change(self, form, model, is_created):
        # Hash the password if provided
        password = form.password.data if hasattr(form, 'password') else None
        if password:
            model.set_password(password)


class MyAdminIndexView(AdminIndexView):
    @expose('/')
    def index(self):
        if not current_user.is_authenticated:
            return redirect(url_for('admin_auth.login'))
        # Simple stats for dashboard cards
        try:
            products_total = Product.query.count()
            products_active = Product.query.filter_by(is_active=True).count()
            categories_total = Category.query.count()
            categories_active = Category.query.filter_by(is_active=True).count()
            latest = Product.query.order_by(Product.id.desc()).first()
            recent_products = Product.query.order_by(Product.id.desc()).limit(6).all()
            latest_title = latest.title if latest else 'N/A'
        except Exception:
            products_total = 0
            products_active = 0
            categories_total = 0
            categories_active = 0
            latest_title = 'N/A'
            recent_products = []

        stats = {
            'products_total': products_total,
            'products_active': products_active,
            'categories_total': categories_total,
            'categories_active': categories_active,
            'latest_title': latest_title,
        }

        return self.render('admin_dashboard.html', stats=stats, recent_products=recent_products)


def setup_admin(app):
    admin = Admin(
        app,
        name='Diky Catalog',
        template_mode='bootstrap3',
        index_view=MyAdminIndexView(),
        base_template='admin/my_master.html'
    )
    admin.add_view(CategoryView(Category, db.session, name='Categories', category='Catalog', endpoint='category'))
    admin.add_view(ProductView(Product, db.session, name='Products', category='Catalog', endpoint='product'))
    admin.add_view(ProductImageView(ProductImage, db.session, name='Product Images', category='Catalog', endpoint='product_image'))
    admin.add_view(UserView(User, db.session, name='Users', category='System', endpoint='user'))
