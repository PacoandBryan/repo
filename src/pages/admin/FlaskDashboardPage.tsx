import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';

interface DashboardStats {
  products_total: number;
  products_active: number;
  categories_total: number;
  total_inventory: number;
  latest_title: string;
  recent_products: any[];
  categories: any[];
}

const FlaskDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { logout, apiCall } = useAdmin();
  const navigate = useNavigate();
  const blossomsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchStats();
    generateBlossoms();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/stats');
      // Transform the API response to match Flask template format
      const flaskStats = {
        products_total: data.products.total,
        products_active: data.products.active,
        categories_total: data.categories.total,
        total_inventory: data.products.total, // Using total products as inventory placeholder
        latest_title: 'Latest Product',
        recent_products: [], // Will be populated later
        categories: [] // Will be populated later
      };
      setStats(flaskStats);
    } catch (err) {
      console.error('Error fetching stats:', err);
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
      const dur = 8 + Math.random() * 10; // 8-18s
      const delay = Math.random() * -20; // start spread
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

  if (loading) {
    return (
      <div className="dashboard-wrap">
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
            --bg1:#fff0f6; /* blossom mist */
            --bg2:#ffe3ee; /* petal haze */
            --petal:#ffb7c5; /* sakura pink */
            --petal-2:#ff8fab; /* deeper petal */
            --ink:#3d2a2a; /* warm ink */
            --muted:#8c6a6a;
            --card:#fff7fb;
            --border:#ffc2d1;
            --accent:#ff6b9a;
            --accent-2:#ff9ecf;
          }

          html,body{height:100%; background:linear-gradient(120deg,var(--bg1),var(--bg2)); margin:0; padding:0;}
          
          /* Custom navbar styles */
          .navbar-inverse{background:linear-gradient(90deg,#ff9ecf,#ff6b9a); border-color:transparent; border-radius:0; margin-bottom:0; position:fixed; top:0; left:0; right:0; z-index:1000; box-shadow:0 2px 10px rgba(255,107,154,.2); transition:all .4s cubic-bezier(0.4, 0, 0.2, 1);}
          .navbar-inverse:hover{box-shadow:0 4px 20px rgba(255,107,154,.3); transform:translateY(-1px);}
          .navbar-inverse .navbar-brand, .navbar-inverse .navbar-nav>li>a{color:#fff !important; text-shadow:none; transition:all .3s cubic-bezier(0.4, 0, 0.2, 1); position:relative; font-weight:500;}
          .navbar-inverse .navbar-brand:hover, .navbar-inverse .navbar-nav>li>a:hover{color:#fff !important; transform:scale(1.02); opacity:0.95;}
          .navbar-inverse .navbar-nav>li.active>a{background:rgba(255,255,255,.15) !important; border-radius:6px; font-weight:600;}
          
          /* Welcome Luz animation */
          .welcome-luz{
            font-size:120px;
            font-weight:900;
            background:linear-gradient(135deg, #ff6b9a, #ff9ecf, #ffb7c5, #ff8fab);
            background-size:300% 300%;
            -webkit-background-clip:text;
            -webkit-text-fill-color:transparent;
            background-clip:text;
            text-align:center;
            margin:40px 0;
            animation:gradientShift 4s ease infinite, float 3s ease-in-out infinite;
            cursor:pointer;
            transition:all .3s ease;
            text-shadow:0 0 80px rgba(255,107,154,.5);
          }
          .welcome-luz:hover{
            transform:scale(1.1) rotate(-2deg);
            animation-duration:2s, 1.5s;
            text-shadow:0 0 120px rgba(255,107,154,.8);
          }
          @keyframes gradientShift{
            0%,100%{background-position:0% 50%;}
            50%{background-position:100% 50%;}
          }
          @keyframes float{
            0%,100%{transform:translateY(0);}
            50%{transform:translateY(-20px);}
          }
          
          /* Force full-bleed content */
          .container-fluid{width:100% !important; padding:0 !important; background:transparent !important;}
          .container{width:100% !important; max-width:none !important; padding-left:0 !important; padding-right:0 !important;}
          .row{margin-left:0 !important; margin-right:0 !important;}
          #content{padding:0 !important; background:transparent !important;}

          .dashboard-wrap{
            position:relative;
            min-height:100vh;
            padding:92px 28px 28px; /* leave room for top navbar */
            color:var(--ink);
            overflow:hidden; /* contain petals */
          }

          /* Falling petals */
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

          .dash-header{display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:24px;}
          .dash-title{display:flex; align-items:center; gap:12px}
          .dash-title h2{margin:0; font-weight:900; letter-spacing:.3px}

          .cards{display:grid; grid-template-columns:repeat(auto-fill, minmax(240px,1fr)); gap:18px}
          .card{
            background:linear-gradient(180deg, var(--card), #fffafd);
            border:1px solid var(--border);
            border-radius:14px; padding:18px;
            box-shadow:0 14px 34px rgba(255,170,200,.35);
            transition:transform .12s ease, box-shadow .2s ease;
          }
          .card:hover{ transform:translateY(-3px); box-shadow:0 18px 40px rgba(255,150,190,.45) }
          .metric{ font-size:30px; font-weight:900; color:#cc2f63 }
          .muted{ color:var(--muted); font-size:12px }

          .cta-row{ margin-top:22px; display:flex; gap:12px; flex-wrap:wrap }
          .btn-primary{
            background:linear-gradient(135deg, #ff70a6, #ff96c5);
            color:#fff; border:none; border-radius:12px; padding:10px 14px; font-weight:800;
            text-decoration:none; display:inline-flex; align-items:center; gap:8px;
            box-shadow:0 10px 28px rgba(255,120,170,.4);
          }
          .btn-secondary{
            background:transparent; color:#cc2f63; border:1px solid var(--border);
            border-radius:12px; padding:10px 14px; text-decoration:none;
            backdrop-filter:saturate(120%);
          }

          .panel{
            background:linear-gradient(180deg, var(--card), #fffafd);
            border:1px solid var(--border);
            border-radius:14px;
            box-shadow:0 14px 34px rgba(255,170,200,.35);
            margin-bottom:20px;
          }
          .panel-heading{
            background:linear-gradient(90deg,var(--petal),var(--petal-2));
            border:none;
            border-radius:14px 14px 0 0;
            padding:15px 20px;
            color:white;
            font-weight:600;
          }
          .panel-body{
            padding:20px;
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
            </button>
            <a className="navbar-brand" href="/admin/dashboard">Blossom Admin</a>
          </div>
          <div id="navbar" className="navbar-collapse collapse">
            <ul className="nav navbar-nav">
              <li className="active"><a href="/admin/dashboard">Dashboard</a></li>
              <li><a href="/admin/products">Products</a></li>
              <li><a href="/admin/categories">Categories</a></li>
            </ul>
            <ul className="nav navbar-nav navbar-right">
              <li><a href="#" onClick={handleLogout}>Logout</a></li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="dashboard-wrap">
        <div className="blossoms" ref={blossomsRef}></div>

        <div className="container theme-showcase" role="main" style={{marginTop: '80px'}}>
          <div className="row">
            <div className="col-md-12 text-center">
              <div className="welcome-luz">Diky Dashboard</div>
              <p className="lead" style={{color: 'var(--muted)', marginBottom: '40px'}}>Manage your catalog, products, and categories</p>
            </div>
          </div>
          
          {/* Stats Cards */}
          {stats && (
            <div className="row" style={{marginBottom: '40px'}}>
              <div className="col-md-3">
                <div className="card" style={{background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', textAlign: 'center', transition: 'all .3s ease', boxShadow: '0 4px 15px rgba(255,183,197,.2)'}}>
                  <h3 style={{color: 'var(--petal)', margin: '0 0 10px 0', fontWeight: '700'}}>{stats.products_total}</h3>
                  <p style={{color: 'var(--muted)', margin: '0'}}>Total Products</p>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card" style={{background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', textAlign: 'center', transition: 'all .3s ease', boxShadow: '0 4px 15px rgba(255,183,197,.2)'}}>
                  <h3 style={{color: 'var(--petal)', margin: '0 0 10px 0', fontWeight: '700'}}>{stats.categories_total}</h3>
                  <p style={{color: 'var(--muted)', margin: '0'}}>Categories</p>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card" style={{background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', textAlign: 'center', transition: 'all .3s ease', boxShadow: '0 4px 15px rgba(255,183,197,.2)'}}>
                  <h3 style={{color: 'var(--petal)', margin: '0 0 10px 0', fontWeight: '700'}}>{stats.total_inventory}</h3>
                  <p style={{color: 'var(--muted)', margin: '0'}}>Total Inventory</p>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card" style={{background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', textAlign: 'center', transition: 'all .3s ease', boxShadow: '0 4px 15px rgba(255,183,197,.2)'}}>
                  <h3 style={{color: 'var(--petal)', margin: '0 0 10px 0', fontWeight: '700'}}>{stats.products_active}</h3>
                  <p style={{color: 'var(--muted)', margin: '0'}}>Active Products</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Recent Products */}
          <div className="row">
            <div className="col-md-12">
              <div className="panel">
                <div className="panel-heading">
                  <h4 style={{color: 'white', margin: '0', fontWeight: '600'}}>Recent Products</h4>
                </div>
                <div className="panel-body">
                  <p style={{color: 'var(--muted)', textAlign: 'center', padding: '20px'}}>
                    No products yet. <a href="/admin/products" style={{color: 'var(--petal)'}}>Add your first product</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="cta-row">
          <a className="btn-primary" href="/admin/products">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="white" strokeWidth="2"/>
            </svg>
            Manage Products
          </a>
          <a className="btn-primary" href="/admin/categories">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l-5.5 9h11z" stroke="white" strokeWidth="2"/>
            </svg>
            Manage Categories
          </a>
          <a className="btn-secondary" href="/catalog">View Public Catalog</a>
        </div>
      </div>
    </>
  );
};

export default FlaskDashboardPage;
