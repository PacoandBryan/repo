import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';

interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  products_count?: number;
}

const FlaskCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    icon_path: ''
  });
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [iconFileName, setIconFileName] = useState('');
  
  const { logout, apiCall } = useAdmin();
  const navigate = useNavigate();
  const blossomsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCategories();
    generateBlossoms();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/categories');
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
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

  const openModal = () => {
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    document.body.style.overflow = '';
    setFormData({ name: '', description: '', icon: '', icon_path: '' });
    setIconPreview(null);
    setIconFileName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = {
        name: formData.name,
        description: formData.description,
        icon: formData.icon_path || formData.icon
      };
      
      await apiCall('/categories', 'POST', data);
      
      alert('Category added successfully!');
      closeModal();
      fetchCategories();
    } catch (err) {
      console.error('Error adding category:', err);
      alert('Error adding category');
    }
  };

  const handleFileUpload = (file: File) => {
    const allowedTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload only SVG, PNG, or JPG files');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB for icons');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      const result = e.target?.result as string;
      setIconPreview(result);
      setIconFileName(file.name);
      setFormData(prev => ({ ...prev, icon: result, icon_path: '' }));
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

  const removeIcon = () => {
    setIconPreview(null);
    setIconFileName('');
    setFormData(prev => ({ ...prev, icon: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="categories-wrap">
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

          .categories-wrap{
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

          .categories-header{display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:24px;}
          .categories-title{display:flex; align-items:center; gap:12px}
          .categories-title h2{margin:0; font-weight:900; letter-spacing:.3px}

          .category-grid{
            display:grid;
            grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));
            gap:20px;
          }

          .category-card{
            background:linear-gradient(180deg, var(--card), #fffafd);
            border:1px solid var(--border);
            border-radius:14px;
            padding:20px;
            box-shadow:0 14px 34px rgba(255,170,200,.35);
            transition:transform .12s ease, box-shadow .2s ease;
            position:relative;
            overflow:hidden;
          }
          .category-card:hover{ transform:translateY(-3px); box-shadow:0 18px 40px rgba(255,150,190,.45) }

          .category-icon{
            width:50px;
            height:50px;
            background:linear-gradient(135deg, var(--accent), var(--accent-2));
            border-radius:12px;
            display:flex;
            align-items:center;
            justify-content:center;
            margin-bottom:16px;
          }
          .category-icon svg{width:24px; height:24px; stroke:#fff;}

          .category-name{
            font-size:18px;
            font-weight:800;
            color:var(--ink);
            margin-bottom:8px;
          }

          .category-count{
            color:var(--muted);
            font-size:14px;
            margin-bottom:16px;
          }

          .category-actions{
            display:flex;
            gap:8px;
          }
          .btn-action{
            padding:8px 16px;
            border-radius:8px;
            text-decoration:none;
            font-weight:600;
            font-size:13px;
            transition:all .2s;
            flex:1;
            text-align:center;
            cursor:pointer;
            border:none;
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

          .btn-primary{
            background:linear-gradient(135deg, #ff70a6, #ff96c5);
            color:#fff; border:none; border-radius:12px; padding:12px 20px; font-weight:800;
            text-decoration:none; display:inline-flex; align-items:center; gap:8px;
            box-shadow:0 10px 28px rgba(255,120,170,.4);
            transition:all .2s;
            cursor:pointer;
          }
          .btn-primary:hover{transform:translateY(-2px); box-shadow:0 14px 35px rgba(255,120,170,.5);}

          .add-category-card{
            background:linear-gradient(180deg, rgba(255,183,197,.1), rgba(255,183,197,.05));
            border:2px dashed var(--border);
            display:flex;
            flex-direction:column;
            align-items:center;
            justify-content:center;
            min-height:200px;
            cursor:pointer;
            transition:all .2s;
          }
          .add-category-card:hover{
            background:linear-gradient(180deg, rgba(255,183,197,.2), rgba(255,183,197,.1));
            border-color:var(--accent);
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
            max-width:500px;
            width:90%;
            max-height:80vh;
            overflow-y:auto;
            box-shadow:0 20px 60px rgba(255,107,154,.4);
            transform:scale(0.9) translateY(20px);
            transition:transform .3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .modal-overlay.active .modal-wizard{
            transform:scale(1) translateY(0);
          }
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
            padding:20px;
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
            width:40px;
            height:40px;
            margin:0 auto 8px;
            color:var(--muted);
          }
          .file-upload-text{
            color:var(--ink);
            font-weight:600;
            margin-bottom:4px;
            font-size:14px;
          }
          .file-upload-hint{
            color:var(--muted);
            font-size:11px;
          }
          .file-preview{
            margin-top:12px;
            display:none;
          }
          .file-preview.active{
            display:block;
          }
          .preview-image{
            max-width:100px;
            max-height:100px;
            border-radius:8px;
            border:1px solid var(--border);
          }
          .preview-info{
            display:flex;
            justify-content:space-between;
            align-items:center;
            margin-top:8px;
            padding:6px;
            background:var(--bg2);
            border-radius:6px;
          }
          .preview-filename{
            font-size:11px;
            color:var(--ink);
            font-weight:500;
          }
          .preview-remove{
            background:var(--accent);
            color:#fff;
            border:none;
            border-radius:4px;
            padding:3px 6px;
            font-size:10px;
            cursor:pointer;
            transition:all .2s;
          }
          .preview-remove:hover{
            background:var(--petal-2);
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
              <li><a href="/admin/products">Products</a></li>
              <li className="active"><a href="/admin/categories">Categories</a></li>
            </ul>
            <ul className="nav navbar-nav navbar-right">
              <li><a href="#" onClick={handleLogout}>Logout</a></li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="categories-wrap">
        <div className="blossoms" ref={blossomsRef}></div>

        <div className="categories-header">
          <div className="categories-title">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="g1" x1="0" x2="24" y1="0" y2="24">
                  <stop offset="0%" stopColor="#ff6b9a"/>
                  <stop offset="100%" stopColor="#ff9ecf"/>
                </linearGradient>
              </defs>
              <path d="M12 2l-5.5 9h11z" stroke="url(#g1)" strokeWidth="2"/>
              <circle cx="17.5" cy="17.5" r="4.5" stroke="url(#g1)" strokeWidth="2"/>
              <path d="M3 13.5h8v8H3z" stroke="url(#g1)" strokeWidth="2"/>
            </svg>
            <h2>Categories Management</h2>
          </div>
          <button className="btn-primary" onClick={openModal}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2"/>
            </svg>
            Add Category
          </button>
        </div>

        <div className="category-grid">
          {categories.length > 0 ? (
            categories.map((category) => (
              <div className="category-card" key={category.id}>
                <div className="category-icon">
                  {category.icon ? (
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d={category.icon} stroke="white" strokeWidth="2"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="white" strokeWidth="2"/>
                    </svg>
                  )}
                </div>
                <div className="category-name">{category.name}</div>
                <div className="category-count">{category.products_count || 0} products</div>
                <div className="category-actions">
                  <button className="btn-action btn-edit">Edit</button>
                  <button 
                    className="btn-action btn-delete" 
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this category?')) {
                        // Handle delete
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="category-card" style={{gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--muted)'}}>
              No categories found. <button onClick={openModal} style={{color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer'}}>Create your first category</button>
            </div>
          )}
          
          <div className="add-category-card" onClick={openModal}>
            <div style={{textAlign: 'center'}}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{marginBottom: '12px'}}>
                <path d="M12 5v14M5 12h14" stroke="var(--accent)" strokeWidth="2"/>
              </svg>
              <div style={{color: 'var(--accent)', fontWeight: '700'}}>Add New Category</div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
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
                <path d="M12 2l-5.5 9h11z" stroke="url(#modal-gradient)" strokeWidth="2"/>
                <circle cx="17.5" cy="17.5" r="4.5" stroke="url(#modal-gradient)" strokeWidth="2"/>
                <path d="M3 13.5h8v8H3z" stroke="url(#modal-gradient)" strokeWidth="2"/>
              </svg>
              Add New Category
            </div>
            <button className="modal-close" onClick={closeModal}>&times;</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="categoryName">Category Name</label>
              <input 
                type="text" 
                className="form-input" 
                id="categoryName" 
                name="name" 
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="categoryDescription">Description</label>
              <textarea 
                className="form-textarea" 
                id="categoryDescription" 
                name="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category Icon</label>
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
                  accept=".svg,.png,.jpg,.jpeg"
                />
                <svg className="file-upload-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="17,8 12,3 7,8" stroke="currentColor" strokeWidth="2"/>
                  <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <div className="file-upload-text">Upload icon or use SVG path</div>
                <div className="file-upload-hint">SVG, PNG or JPG (Square format preferred)</div>
              </div>
              <div className={`file-preview ${iconPreview ? 'active' : ''}`}>
                <img className="preview-image" src={iconPreview || ''} alt="Category icon preview"/>
                <div className="preview-info">
                  <span className="preview-filename">{iconFileName}</span>
                  <button className="preview-remove" type="button" onClick={removeIcon}>Remove</button>
                </div>
              </div>
              <small style={{color: 'var(--muted)', fontSize: '11px', marginTop: '4px', display: 'block'}}>Or enter SVG path below:</small>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="categoryIconPath">SVG Path (Alternative)</label>
              <input 
                type="text" 
                className="form-input" 
                id="categoryIconPath" 
                name="icon_path" 
                placeholder="M12 2l-5.5 9h11z"
                value={formData.icon_path}
                onChange={(e) => setFormData(prev => ({ ...prev, icon_path: e.target.value, icon: '' }))}
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn-submit">Add Category</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default FlaskCategoriesPage;
