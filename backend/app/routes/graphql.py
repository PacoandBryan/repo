from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import graphene
from graphene import relay
from graphql_server.flask import GraphQLView
from ..models.product import Product
from ..models.category import Category
from ..utils.middleware import RateLimiter, track_api_usage

# Define GraphQL Schema
class CategoryType(graphene.ObjectType):
    id = graphene.ID()
    name = graphene.String()
    slug = graphene.String()
    description = graphene.String()
    parent_id = graphene.String()
    image_url = graphene.String()
    
    def resolve_id(self, info):
        return self.id
    
    def resolve_name(self, info):
        return self.name
    
    def resolve_slug(self, info):
        return self.slug
    
    def resolve_description(self, info):
        return self.description
    
    def resolve_parent_id(self, info):
        return self.parent_id
    
    def resolve_image_url(self, info):
        return self.image_url

class ProductVariantType(graphene.ObjectType):
    id = graphene.ID()
    sku = graphene.String()
    price = graphene.Float()
    sale_price = graphene.Float()
    stock = graphene.Int()
    attributes = graphene.JSONString()

class ProductType(graphene.ObjectType):
    id = graphene.ID()
    title = graphene.JSONString()
    description = graphene.JSONString()
    slug = graphene.String()
    price = graphene.Float()
    sale_price = graphene.Float()
    featured = graphene.Boolean()
    status = graphene.String()
    category_id = graphene.String()
    subcategory_ids = graphene.List(graphene.String)
    tags = graphene.List(graphene.String)
    image_urls = graphene.List(graphene.String)
    variants = graphene.List(ProductVariantType)
    metadata = graphene.JSONString()
    created_at = graphene.DateTime()
    updated_at = graphene.DateTime()
    
    category = graphene.Field(CategoryType)
    
    def resolve_id(self, info):
        return self.id
    
    def resolve_title(self, info):
        return self.title
    
    def resolve_description(self, info):
        return self.description
    
    def resolve_slug(self, info):
        return self.slug
    
    def resolve_price(self, info):
        return self.price
    
    def resolve_sale_price(self, info):
        return self.sale_price
    
    def resolve_featured(self, info):
        return self.featured
    
    def resolve_status(self, info):
        return self.status
    
    def resolve_category_id(self, info):
        return self.category_id
    
    def resolve_subcategory_ids(self, info):
        return self.subcategory_ids
    
    def resolve_tags(self, info):
        return self.tags
    
    def resolve_image_urls(self, info):
        return self.image_urls
    
    def resolve_variants(self, info):
        return self.variants if hasattr(self, 'variants') else []
    
    def resolve_metadata(self, info):
        return self.metadata
    
    def resolve_created_at(self, info):
        return self.created_at
    
    def resolve_updated_at(self, info):
        return self.updated_at
    
    def resolve_category(self, info):
        if not self.category_id:
            return None
        
        category = Category.find_by_id(self.category_id)
        return category

class ProductConnection(relay.Connection):
    class Meta:
        node = ProductType
    
    total_count = graphene.Int()
    
    @staticmethod
    def resolve_total_count(root, info):
        return root.length

class Query(graphene.ObjectType):
    # Product queries
    product = graphene.Field(
        ProductType,
        id=graphene.String(),
        slug=graphene.String()
    )
    products = relay.ConnectionField(
        ProductConnection,
        search=graphene.String(),
        category_id=graphene.String(),
        min_price=graphene.Float(),
        max_price=graphene.Float(),
        status=graphene.String(),
        featured=graphene.Boolean(),
        tags=graphene.List(graphene.String),
        sort_by=graphene.String(),
        sort_order=graphene.String()
    )
    
    # Category queries
    category = graphene.Field(
        CategoryType,
        id=graphene.String(),
        slug=graphene.String()
    )
    categories = graphene.List(
        CategoryType,
        parent_id=graphene.String()
    )
    
    def resolve_product(self, info, id=None, slug=None):
        if id:
            return Product.find_by_id(id)
        elif slug:
            return Product.find_by_slug(slug)
        return None
    
    def resolve_products(self, info, **kwargs):
        # Extract connection arguments
        first = kwargs.get('first')
        after = kwargs.get('after')
        
        # Extract filter arguments
        filters = {
            'search': kwargs.get('search'),
            'categoryId': kwargs.get('category_id'),
            'minPrice': kwargs.get('min_price'),
            'maxPrice': kwargs.get('max_price'),
            'status': kwargs.get('status'),
            'featured': kwargs.get('featured'),
            'sortBy': kwargs.get('sort_by'),
            'sortOrder': kwargs.get('sort_order', 'asc')
        }
        
        if kwargs.get('tags'):
            filters['tags'] = kwargs.get('tags')
        
        # Handle pagination
        skip = 0
        limit = first if first else 10
        
        if after:
            # Convert cursor to offset
            try:
                offset = int(relay.Node.from_global_id(after)[1])
                skip = offset + 1
            except:
                skip = 0
        
        # Get products with filters
        products = Product.find_all(limit=limit, skip=skip, **filters)
        
        # Get total count for pagination
        total = Product.count(**filters)
        
        # Create edges for connection
        edges = [
            relay.ConnectionField.Edge(
                node=product,
                cursor=relay.Connection.offset_to_cursor(i + skip)
            )
            for i, product in enumerate(products)
        ]
        
        # Create page info
        page_info = relay.Connection.PageInfo(
            start_cursor=edges[0].cursor if edges else None,
            end_cursor=edges[-1].cursor if edges else None,
            has_previous_page=skip > 0,
            has_next_page=(skip + limit) < total
        )
        
        # Create connection
        connection = ProductConnection(
            edges=edges,
            page_info=page_info,
            length=total
        )
        
        return connection
    
    def resolve_category(self, info, id=None, slug=None):
        if id:
            return Category.find_by_id(id)
        elif slug:
            return Category.find_by_slug(slug)
        return None
    
    def resolve_categories(self, info, parent_id=None):
        return Category.find_all(parent_id=parent_id)

# Create schema
schema = graphene.Schema(query=Query)

# Create blueprint
graphql_bp = Blueprint('graphql', __name__)

# Define the GraphQL view
graphql_view = GraphQLView.as_view(
    'graphql',
    schema=schema,
    graphiql=True  # Set to False in production
)

# Apply rate limiting to GraphQL endpoint
rate_limiter = RateLimiter(requests_per_minute=100)
graphql_view = rate_limiter(graphql_view)
graphql_view = track_api_usage(graphql_view)

# Register routes
graphql_bp.add_url_rule('', view_func=graphql_view) 