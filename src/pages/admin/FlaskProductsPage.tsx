import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';

interface Product {
  id: number;
  title: string;
  description?: string;
  price: number;
  category_id?: number;
  category_name?: string;
  image_url?: string;
  is_active: boolean;
  created_at?: string;
  sku?: string;
  inventory?: number;
}

const FlaskProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '',
    sku: '',
    inventory: '',
    is_active: true
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState('');
  
  const { logout, apiCall } = useAdmin();
  const navigate = useNavigate();
  const blossomsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProducts();
    generateBlossoms();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/products');
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateBlossoms = () => {
    if (!blossomsRef.current) return;
    
    const root = blossomsRef.current;
    const count = 24;
    
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'petal';
      el.style.left = Math.random() * 100 + 'vw';
      el.style.top = (-10 - Math.random() * 30) + 'vh';
      el.style.opacity = (0.6 + Math.random() * 0.4).toFixed(2);
      const dur = 8 + Math.random() * 10;
      const delay = Math.random() * -20;
      const drift = (Math.random() * 100 - 50) + 'px';
      el.style.setProperty('--x', drift);
      el.style.animation = `fall ${dur}s linear ${delay}s infinite`;
      el.style.background = Math.random() > 0.3
        ? 'radial-gradient(circle at 30% 30%, #fff 0 20%, transparent 21%), var(--petal)'
        : 'radial-gradient(circle at 30% 30%, #fff 0 20%, transparent 21%), var(--petal-2)';
      root.appendChild(el);
    }
  };

  const handleLogout = async (event: React.MouseEvent) => {
    event.preventDefault();
    try {
      await fetch('/admin/logout?format=json', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      logout();
      navigate('/');
    }
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        title: product.title,
        description: product.description || '',
        price: product.price.toString(),
        category_id: product.category_id?.toString() || '',
        sku: product.sku || '',
        inventory: product.inventory?.toString() || '',
        is_active: product.is_active
      });
      setImagePreview(product.image_url || null);
      setImageFileName(product.image_url ? 'existing' : '');
    } else {
      setEditingProduct(null);
      setFormData({
        title: '',
        description: '',
        price: '',
        category_id: '',
        sku: '',
        inventory: '',
        is_active: true
      });
      setImagePreview(null);
      setImageFileName('');
    }
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    document.body.style.overflow = '';
    setEditingProduct(null);
    setFormData({
      title: '',
      description: '',
      price: '',
      category_id: '',
      sku: '',
      inventory: '',
      is_active: true
    });
    setImagePreview(null);
    setImageFileName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        inventory: formData.inventory ? parseInt(formData.inventory) : null,
        image_url: imagePreview
      };
      
      if (editingProduct) {
        await apiCall(`/products/${editingProduct.id}`, 'PUT', data);
        alert('Product updated successfully!');
      } else {
        await apiCall('/products', 'POST', data);
        alert('Product added successfully!');
      }
      
      closeModal();
      fetchProducts();
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Error saving product');
    }
  };

  const handleDelete = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await apiCall(`/products/${productId}`, 'DELETE');
      alert('Product deleted successfully!');
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Error deleting product');
    }
  };

  const handleFileUpload = (file: File) => {
    const allowedTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload only image files (PNG, JPG, SVG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      const result = e.target?.result as string;
      setImagePreview(result);
      setImageFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (uploadAreaRef.current) {
      uploadAreaRef.current.classList.remove('dragover');
    }
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === '' || 
                         (statusFilter === 'active' && product.is_active) ||
                         (statusFilter === 'inactive' && !product.is_active);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="products-wrap">
        <div className="text-center">
          <div className="welcome-luz">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          :root{
            --bg1:#fff0f6;
            --bg2:#ffe3ee;
            --petal:#ffb7c5;
            --petal-2:#ff8fab;
            --ink:#3d2a2a;
            --muted:#8c6a6a;
            --card:#fff7fb;
            --border:#ffc2d1;
            --accent:#ff6b9a;
            --accent-2:#ff9ecf;
          }

          html,body{height:100%; background:linear-gradient(120deg,var(--bg1),var(--bg2)); margin:0; padding:0;}
          
          .navbar-inverse{background:linear-gradient(90deg,#ff9ecf,#ff6b9a); border-color:transparent; border-radius:0; margin-bottom:0; position:fixed; top:0; left:0; right:0; z-index:1000; box-shadow:0 2px 10px rgba(255,107,154,.2); transition:all .4s cubic-bezier(0.4, 0, 0.2, 1);}
          .navbar-inverse:hover{box-shadow:0 4px 20px rgba(255,107,154,.3); transform:translateY(-1px);}
          .navbar-inverse .navbar-brand, .navbar-inverse .navbar-nav>li>a{color:#fff !important; text-shadow:none; transition:all .3s cubic-bezier(0.4, 0, 0.2, 1); position:relative; font-weight:500;}
          .navbar-inverse .navbar-brand:hover, .navbar-inverse .navbar-nav>li>a:hover{color:#fff !important; transform:scale(1.02); opacity:0.95;}
          .navbar-inverse .navbar-nav>li.active>a{background:rgba(255,255,255,.15) !important; border-radius:6px; font-weight:600;}
          
          .container-fluid{width:100% !important; padding:0 !important; background:transparent !important;}
          .container{width:100% !important; max-width:none !important; padding-left:0 !important; padding-right:0 !important;}
          .row{margin-left:0 !important; margin-right:0 !important;}

          .products-wrap{
            position:relative;
            min-height:100vh;
            padding:92px 28px 28px;
            color:var(--ink);
            overflow:hidden;
          }

          .blossoms{position:absolute; inset:0; pointer-events:none;}
          .petal{position:absolute; width:14px; height:14px; border-radius:67% 33% 67% 33%/33% 67% 33% 67%;
            background:radial-gradient(circle at 30% 30%, #fff 0 20%, transparent 21%), var(--petal);
            box-shadow: inset -2px -2px 0 rgba(255,150,170,.5);
            opacity:.85; filter:saturate(105%);
          }
          @keyframes fall{
            0%{ transform:translate3d(var(--x,0), -10%, 0) rotate(0deg); opacity:.0 }
            8%{ opacity:.9 }
            100%{ transform:translate3d(calc(var(--x,0) + 10px), 110vh, 0) rotate(360deg); opacity:.95 }
          }

          .products-header{display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:24px;}
          .products-title{display:flex; align-items:center; gap:12px}
          .products-title h2{margin:0; font-weight:900; letter-spacing:.3px}

          .products-table-container{
            background:linear-gradient(180deg, var(--card), #fffafd);
            border:1px solid var(--border);
            border-radius:14px;
            box-shadow:0 14px 34px rgba(255,170,200,.35);
            overflow:hidden;
          }

          .products-table{
            width:100%;
            border-collapse:collapse;
          }
          .products-table th{
            background:linear-gradient(90deg,#ff9ecf,#ff6b9a);
            color:#fff;
            padding:16px;
            text-align:left;
            font-weight:700;
            letter-spacing:.3px;
          }
          .products-table td{
            padding:16px;
            border-bottom:1px solid var(--border);
          }
          .products-table tr:hover{background:rgba(255,183,197,.1);}
          .products-table tr:last-child td{border-bottom:none;}

          .product-image{
            width:60px;
            height:60px;
            border-radius:8px;
            object-fit:cover;
            border:2px solid var(--border);
          }

          .product-actions{
            display:flex;
            gap:8px;
          }
          .btn-action{
            padding:6px 12px;
            border-radius:8px;
            text-decoration:none;
            font-weight:600;
            font-size:12px;
            transition:all .2s;
            cursor: pointer;
            border: none;
            position: relative;
            overflow: hidden;
          }
          .btn-edit{
            background:linear-gradient(135deg, #ff70a6, #ff96c5);
            color:#fff;
          }
          .btn-edit:hover{transform:translateY(-1px); box-shadow:0 6px 20px rgba(255,120,170,.4);}
          .btn-delete{
            background:linear-gradient(135deg, #ff6b6b, #ff8787);
            color:#fff;
          }
          .btn-delete:hover{transform:translateY(-1px); box-shadow:0 6px 20px rgba(255,100,100,.4);}

          .btn-action::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
          }
          
          .btn-action:hover::before {
            left: 100%;
          }
          
          .btn-action::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255,255,255,0.3);
            transform: translate(-50%, -50%);
            transition: width 0.6s, height 0.6s;
          }
          
          .btn-action:active::after {
            width: 300px;
            height: 300px;
          }

          .modal-overlay{
            position:fixed;
            top:0;
            left:0;
            right:0;
            bottom:0;
            background:rgba(0,0,0,.6);
            backdrop-filter:blur(5px);
            z-index:2000;
            display:none;
            align-items:center;
            justify-content:center;
            opacity:0;
            transition:opacity .3s ease;
          }
          .modal-overlay.active{
            display:flex;
            opacity:1;
          }
          .modal-wizard{
            background:linear-gradient(180deg, var(--card), #fffafd);
            border:1px solid var(--border);
            border-radius:20px;
            padding:32px;
            max-width:600px;
            width:90%;
            max-height:80vh;
            overflow-y:auto;
            box-shadow:0 20px 60px rgba(255,107,154,.4);
            transform:scale(0.9) translateY(20px) rotateX(10deg);
            transition:transform .3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
          }
          .modal-overlay.active .modal-wizard{
            transform:scale(1) translateY(0) rotateX(0);
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          .modal-wizard {
            animation: float 3s ease-in-out infinite;
          }
          
          .modal-overlay.active .modal-wizard {
            animation: float 3s ease-in-out infinite;
          }
          
          .modal-wizard::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(45deg, #ff6b9a, #ff9ecf, #ffb7c5, #ff8fab, #ff6b9a);
            border-radius: 20px;
            z-index: -1;
            opacity: 0;
            transition: opacity 0.3s ease;
            background-size: 400% 400%;
            animation: gradientShift 4s ease infinite;
          }
          
          .modal-overlay.active .modal-wizard::before {
            opacity: 0.7;
          }
          
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          .btn-primary{
            background:linear-gradient(135deg, #ff70a6, #ff96c5);
            color:#fff; border:none; border-radius:12px; padding:12px 20px; font-weight:800;
            text-decoration:none; display:inline-flex; align-items:center; gap:8px;
            box-shadow:0 10px 28px rgba(255,120,170,.4);
            transition:all .2s;
            cursor:pointer;
          }
          .btn-primary:hover{transform:translateY(-2px); box-shadow:0 14px 35px rgba(255,120,170,.5);}

          .status-badge{
            padding:4px 12px;
            border-radius:20px;
            font-size:11px;
            font-weight:700;
            text-transform:uppercase;
            letter-spacing:.5px;
          }
          .status-active{background:linear-gradient(135deg, #4ade80, #22c55e); color:#fff;}
          .status-inactive{background:linear-gradient(135deg, #f87171, #ef4444); color:#fff;}

          .search-box{
            background:var(--card);
            border:1px solid var(--border);
            border-radius:12px;
            padding:12px 16px;
            width:300px;
            color:var(--ink);
            outline:none;
            transition:all .2s;
          }
          .search-box:focus{border-color:var(--accent); box-shadow:0 0 0 4px rgba(255,107,154,.18);}

          .filter-dropdown{
            background:var(--card);
            border:1px solid var(--border);
            border-radius:12px;
            padding:12px 16px;
            color:var(--ink);
            outline:none;
            cursor:pointer;
            transition:all .2s;
          }
          .filter-dropdown:focus{border-color:var(--accent); box-shadow:0 0 0 4px rgba(255,107,154,.18);}

          .modal-header{
            display:flex;
            align-items:center;
            justify-content:space-between;
            margin-bottom:24px;
          }
          .modal-title{
            font-size:24px;
            font-weight:800;
            color:var(--ink);
            display:flex;
            align-items:center;
            gap:12px;
          }
          .modal-close{
            background:transparent;
            border:none;
            font-size:24px;
            color:var(--muted);
            cursor:pointer;
            padding:8px;
            border-radius:8px;
            transition:all .2s;
          }
          .modal-close:hover{
            background:var(--bg2);
            color:var(--accent);
          }
          .form-group{
            margin-bottom:20px;
          }
          .form-label{
            display:block;
            margin-bottom:8px;
            font-weight:600;
            color:var(--ink);
          }
          .form-input, .form-textarea{
            width:100%;
            padding:12px 16px;
            border:1px solid var(--border);
            border-radius:10px;
            background:var(--card);
            color:var(--ink);
            font-size:14px;
            transition:all .2s;
            outline:none;
          }
          .form-input:focus, .form-textarea:focus{
            border-color:var(--accent);
            box-shadow:0 0 0 4px rgba(255,107,154,.18);
          }
          .form-textarea{
            min-height:80px;
            resize:vertical;
          }
          .form-actions{
            display:flex;
            gap:12px;
            justify-content:flex-end;
            margin-top:24px;
          }
          .btn-cancel{
            padding:12px 24px;
            border:1px solid var(--border);
            border-radius:10px;
            background:transparent;
            color:var(--ink);
            font-weight:600;
            cursor:pointer;
            transition:all .2s;
          }
          .btn-cancel:hover{
            background:var(--bg2);
          }
          .btn-submit{
            padding:12px 24px;
            border:none;
            border-radius:10px;
            background:linear-gradient(135deg, #ff70a6, #ff96c5);
            color:#fff;
            font-weight:700;
            cursor:pointer;
            transition:all .2s;
            box-shadow:0 4px 15px rgba(255,120,170,.3);
          }
          .btn-submit:hover{
            transform:translateY(-1px);
            box-shadow:0 6px 20px rgba(255,120,170,.4);
          }

          .file-upload-area{
            border:2px dashed var(--border);
            border-radius:12px;
            padding:24px;
            text-align:center;
            background:var(--card);
            transition:all .3s ease;
            cursor:pointer;
            position:relative;
          }
          .file-upload-area:hover{
            border-color:var(--accent);
            background:rgba(255,183,197,.1);
          }
          .file-upload-area.dragover{
            border-color:var(--accent);
            background:rgba(255,183,197,.2);
            transform:scale(1.02);
          }
          .file-upload-input{
            display:none;
          }
          .file-upload-icon{
            width:48px;
            height:48px;
            margin:0 auto 12px;
            color:var(--muted);
          }
          .file-upload-text{
            color:var(--ink);
            font-weight:600;
            margin-bottom:4px;
          }
          .file-upload-hint{
            color:var(--muted);
            font-size:12px;
          }
          .file-preview{
            margin-top:16px;
            display:none;
          }
          .file-preview.active{
            display:block;
          }
          .preview-image{
            max-width:100%;
            max-height:200px;
            border-radius:8px;
            border:1px solid var(--border);
          }
          .preview-info{
            display:flex;
            justify-content:space-between;
            align-items:center;
            margin-top:8px;
            padding:8px;
            background:var(--bg2);
            border-radius:6px;
          }
          .preview-filename{
            font-size:12px;
            color:var(--ink);
            font-weight:500;
          }
          .preview-remove{
            background:var(--accent);
            color:#fff;
            border:none;
            border-radius:4px;
            padding:4px 8px;
            font-size:11px;
            cursor:pointer;
            transition:all .2s;
          }
          .preview-remove:hover{
            background:var(--petal-2);
          }
          .aspect-ratio-info{
            font-size:11px;
            color:var(--muted);
            margin-top:4px;
          }
        `
      }} />

      {/* Navigation Bar */}
      <nav className="navbar navbar-inverse">
        <div className="container-fluid">
          <div className="navbar-header">
            <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
            <a className="navbar-brand" href="/admin/dashboard">Blossom Admin</a>
          </div>
          <div id="navbar" className="navbar-collapse collapse">
            <ul className="nav navbar-nav">
              <li><a href="/admin/dashboard">Dashboard</a></li>
              <li className="active"><a href="/admin/products">Products</a></li>
              <li><a href="/admin/categories">Categories</a></li>
            </ul>
            <ul className="nav navbar-nav navbar-right">
              <li><a href="#" onClick={handleLogout}>Logout</a></li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="products-wrap">
        <div className="blossoms" ref={blossomsRef}></div>

        <div className="products-header">
          <div className="products-title">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="g1" x1="0" x2="24" y1="0" y2="24">
                  <stop offset="0%" stopColor="#ff6b9a"/>
                  <stop offset="100%" stopColor="#ff9ecf"/>
                </linearGradient>
              </defs>
              <path d="M20 7h-9l-2-2H4c-1.11 0-2 .89-2 2v10c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V9c0-1.11-.89-2-2-2z" stroke="url(#g1)" strokeWidth="2"/>
            </svg>
            <h2>Products Management</h2>
          </div>
          <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
            <input 
              type="text" 
              className="search-box" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              className="filter-dropdown" 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button className="btn-primary" onClick={() => openModal()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2"/>
              </svg>
              Add Product
            </button>
          </div>
        </div>

        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.title} className="product-image"/>
                      ) : (
                        <div style={{width: '60px', height: '60px', background: 'var(--bg2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '10px'}}>No Image</div>
                      )}
                    </td>
                    <td style={{fontWeight: '600'}}>{product.title}</td>
                    <td>{product.category_name || 'Uncategorized'}</td>
                    <td style={{fontWeight: '700', color: 'var(--accent)'}}>${product.price.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${product.is_active ? 'status-active' : 'status-inactive'}`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{color: 'var(--muted)', fontSize: '14px'}}>
                      {product.created_at ? new Date(product.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>
                      <div className="product-actions">
                        <button className="btn-action btn-edit" onClick={() => openModal(product)}>Edit</button>
                        <button className="btn-action btn-delete" onClick={() => handleDelete(product.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{textAlign: 'center', padding: '40px', color: 'var(--muted)'}}>
                    No products found. <button onClick={() => openModal()} style={{color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer'}}>Add your first product</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      <div className={`modal-overlay ${showModal ? 'active' : ''}`} onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}>
        <div className="modal-wizard">
          <div className="modal-header">
            <div className="modal-title">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="modal-gradient" x1="0" x2="24" y1="0" y2="24">
                    <stop offset="0%" stopColor="#ff6b9a"/>
                    <stop offset="100%" stopColor="#ff9ecf"/>
                  </linearGradient>
                </defs>
                <path d="M20 7h-9l-2-2H4c-1.11 0-2 .89-2 2v10c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V9c0-1.11-.89-2-2-2z" stroke="url(#modal-gradient)" strokeWidth="2"/>
              </svg>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </div>
            <button className="modal-close" onClick={closeModal}>&times;</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="productTitle">Product Title</label>
              <input 
                type="text" 
                className="form-input" 
                id="productTitle" 
                name="title" 
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="productDescription">Description</label>
              <textarea 
                className="form-textarea" 
                id="productDescription" 
                name="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div style={{display: 'flex', gap: '16px'}}>
              <div className="form-group" style={{flex: 1}}>
                <label className="form-label" htmlFor="productPrice">Price</label>
                <input 
                  type="number" 
                  className="form-input" 
                  id="productPrice" 
                  name="price" 
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                />
              </div>

              <div className="form-group" style={{flex: 1}}>
                <label className="form-label" htmlFor="productSKU">SKU</label>
                <input 
                  type="text" 
                  className="form-input" 
                  id="productSKU" 
                  name="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="productInventory">Inventory</label>
              <input 
                type="number" 
                className="form-input" 
                id="productInventory" 
                name="inventory"
                value={formData.inventory}
                onChange={(e) => setFormData(prev => ({ ...prev, inventory: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Product Image</label>
              <div 
                className="file-upload-area" 
                ref={uploadAreaRef}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  uploadAreaRef.current?.classList.add('dragover');
                }}
                onDragLeave={() => uploadAreaRef.current?.classList.remove('dragover')}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  className="file-upload-input" 
                  ref={fileInputRef}
                  onChange={handleFileInput}
                  accept="image/*"
                />
                <svg className="file-upload-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="17,8 12,3 7,8" stroke="currentColor" strokeWidth="2"/>
                  <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <div className="file-upload-text">Upload product image</div>
                <div className="file-upload-hint">PNG, JPG, WebP or SVG (Recommended: 800x600px)</div>
              </div>
              <div className={`file-preview ${imagePreview ? 'active' : ''}`}>
                <img className="preview-image" src={imagePreview || ''} alt="Product preview"/>
                <div className="preview-info">
                  <span className="preview-filename">{imageFileName}</span>
                  <button className="preview-remove" type="button" onClick={removeImage}>Remove</button>
                </div>
              </div>
              <div className="aspect-ratio-info">Recommended aspect ratio: 4:3 for best display</div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <input 
                  type="checkbox" 
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                /> Active Product
              </label>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn-submit">{editingProduct ? 'Update Product' : 'Add Product'}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default FlaskProductsPage;
