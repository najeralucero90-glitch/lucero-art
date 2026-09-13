import React,{useEffect,useMemo,useState}from"react";
import{createRoot}from"react-dom/client";
import{Menu,Bell,Heart,ArrowRight,Home,Palette,Pencil,MessageCircle,UserRound,Flower2,PawPrint,Mountain,Search,X,ShoppingBag,Trash2,CheckCircle,Plus,Settings,LogOut,Phone,Package,ChevronLeft,Lock,User,Truck,CreditCard}from"lucide-react";
import"./styles.css";
// Código para mostrar errores de JavaScript en pantalla durante la prueba
window.addEventListener("error", (e) => {
  document.body.innerHTML =
    "<pre style='padding:20px;color:red;white-space:pre-wrap'>" +
    (e.error?.stack || e.message) +
    "</pre>";
});

window.addEventListener("unhandledrejection", (e) => {
  document.body.innerHTML =
    "<pre style='padding:20px;color:red;white-space:pre-wrap'>" +
    (e.reason?.stack || e.reason) +
    "</pre>";
});

const cats=[
{name:"Dibujos disponibles",icon:Flower2,tone:"pink"},
{name:"Dibujos personalizados",icon:PawPrint,tone:"green"},
{name:"Paisajes",icon:Mountain,tone:"blue"},
{name:"Animales",icon:PawPrint,tone:"lilac"},
{name:"Retratos",icon:UserRound,tone:"sand"}
];
const WA=import.meta.env.VITE_WHATSAPP||"529615712134";
const TRANSFER={bank:import.meta.env.VITE_TRANSFER_BANK||"Banco por configurar",holder:import.meta.env.VITE_TRANSFER_HOLDER||"Lucero Art",account:import.meta.env.VITE_TRANSFER_ACCOUNT||"Por configurar",clabe:import.meta.env.VITE_TRANSFER_CLABE||"Por configurar"};
const money=n=>new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"}).format(n);

const API_BASE=(import.meta.env.VITE_API_URL||"").replace(/\/$/,"");

async function api(path,opts={}){
 const r=await fetch(`${API_BASE}${path}`,{headers:{"Content-Type":"application/json",...(opts.headers||{})},...opts});
 const data=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(data.error||"Ocurrió un error");
 return data;
}
function App(){
 const[page,setPage]=useState("Inicio"),[menu,setMenu]=useState(false),[query,setQuery]=useState(""),[search,setSearch]=useState(false),[transfer,setTransfer]=useState(false);
 const[category,setCategory]=useState("Todos"),[products,setProducts]=useState([]),[favorites,setFavorites]=useState(()=>JSON.parse(localStorage.getItem("la-fav")||"[]"));
 const[cart,setCart]=useState(()=>JSON.parse(localStorage.getItem("la-cart")||"[]")),[selected,setSelected]=useState(null),[toast,setToast]=useState("");
 const[user,setUser]=useState(()=>JSON.parse(localStorage.getItem("la-user")||"null")),[auth,setAuth]=useState(null),[orders,setOrders]=useState([]),[admin,setAdmin]=useState(false);
 const notify=t=>{setToast(t);setTimeout(()=>setToast(""),2800)};
 useEffect(()=>{api("/api/products").then(d=>setProducts(d.products)).catch(()=>notify("No se pudo cargar el catálogo"))},[]);
 useEffect(()=>localStorage.setItem("la-fav",JSON.stringify(favorites)),[favorites]);
 useEffect(()=>localStorage.setItem("la-cart",JSON.stringify(cart)),[cart]);
 useEffect(()=>{if(user){api("/api/orders",{headers:{Authorization:`Bearer ${user.token}`}}).then(d=>setOrders(d.orders)).catch(()=>{})}},[user]);
 const go=p=>{setPage(p);setMenu(false);setSelected(null);scrollTo(0,0)};
 const filtered=useMemo(()=>products.filter(p=>(category==="Todos"||p.category===category)&&p.name.toLowerCase().includes(query.toLowerCase())),[products,category,query]);
 const add=p=>{setCart(c=>[...c,p]);notify(`${p.name} agregado al carrito`)};
 const total=cart.reduce((s,p)=>s+p.price,0);
 const toggleFav=id=>setFavorites(f=>f.includes(id)?f.filter(x=>x!==id):[...f,id]);
 const whatsapp=t=>window.open(`https://wa.me/${WA}?text=${encodeURIComponent(t)}`,"_blank");
 async function checkout(){
   if(!cart.length)return;
   try{
     const d=await api("/api/checkout",{method:"POST",body:JSON.stringify({items:cart.map(p=>p.id)})});
     if(d.url)window.location.href=d.url; else notify("Stripe aún no está configurado. Puedes usar transferencia.");
   }catch(e){notify(e.message)}
 }
 async function requestTransfer(){
   if(!user){setAuth("login");return}
   try{
     const d=await api("/api/transfer-orders",{method:"POST",headers:{Authorization:`Bearer ${user.token}`},body:JSON.stringify({items:cart.map(p=>p.id)})});
     setTransfer(d);
   }catch(e){notify(e.message)}
 }
 async function submitOrder(e){
   e.preventDefault(); if(!user){setAuth("login");return}
   const d=new FormData(e.currentTarget);
   try{
    await api("/api/custom-orders",{method:"POST",headers:{Authorization:`Bearer ${user.token}`},body:JSON.stringify({name:d.get("name"),phone:d.get("phone"),type:d.get("type"),idea:d.get("idea")})});
    notify("¡Solicitud recibida!");e.currentTarget.reset();
   }catch(err){notify(err.message)}
 }
 async function login(email,password){
   const d=await api("/api/auth/login",{method:"POST",body:JSON.stringify({email,password})});
   localStorage.setItem("la-user",JSON.stringify(d.user));setUser(d.user);setAuth(null);notify("Sesión iniciada");
 }
 async function register(name,email,password){
   const d=await api("/api/auth/register",{method:"POST",body:JSON.stringify({name,email,password})});
   localStorage.setItem("la-user",JSON.stringify(d.user));setUser(d.user);setAuth(null);notify("Cuenta creada");
 }
 async function adminLogin(email,password){
   const d=await api("/api/admin/login",{method:"POST",body:JSON.stringify({email,password})});
   localStorage.setItem("la-user",JSON.stringify(d.user));setUser(d.user);setAdmin(true);setAuth(null);go("Admin");
 }
 return <div className="app">
  <header className="topbar"><button className="iconBtn" onClick={()=>setMenu(!menu)}><Menu/></button><div className="brand" onClick={()=>go("Inicio")}><div className="brandName">Lucero Art <span>❀</span></div><div className="tagline">ARTE QUE HABLA DE TI</div></div><div className="headActions"><button className="iconBtn" onClick={()=>go("Carrito")}><ShoppingBag/><b>{cart.length}</b></button><button className="iconBtn notification"><Bell/><i/></button></div></header>
  {menu&&<div className="drawer">{["Inicio","Catálogo","Encargos","Mensajes","Mi perfil","Carrito"].map(x=><button key={x} onClick={()=>go(x)}>{x}</button>)}<hr/><button onClick={()=>user?.role==="admin"?go("Admin"):setAuth("admin")}><Settings/> Administración</button></div>}
  {page==="Inicio"&&<main>
   <section className="hero"><div className="heroCopy"><div className="welcome">Bienvenida a</div><h1>Lucero Art</h1><div className="heartLine">♡ <span/></div><p>Aquí encontrarás dibujos únicos, hechos con pasión, para decorar, regalar o simplemente disfrutar.</p><button className="primary" onClick={()=>go("Catálogo")}>Ver catálogo <ArrowRight size={18}/></button></div><div className="heroImage"><img src="/assets/hero.jpg"/><div className="heroNote">Cada dibujo<br/>tiene una<br/>historia...<br/>♡</div></div></section>
   <section className="categories">{cats.map(({name,icon:Icon,tone})=><button className="category" key={name} onClick={()=>{setCategory(name);go("Catálogo")}}><div className={`catIcon ${tone}`}><Icon/></div><span>{name}</span></button>)}</section>
   <section className="popular"><div className="sectionHead"><h2>Más populares</h2><button onClick={()=>go("Catálogo")}>Ver todo <ArrowRight size={17}/></button></div><div className="productGrid">{products.slice(0,4).map(p=><Card key={p.id} p={p} fav={favorites.includes(p.id)} onFav={toggleFav} onOpen={setSelected} onAdd={add}/>)}</div></section>
   <section className="cta"><Pencil/><div><h3>¿Quieres un dibujo personalizado?</h3><p>Cuéntame tu idea y lo hacemos realidad.</p></div><button className="primary" onClick={()=>go("Encargos")}>Solicitar ahora <ArrowRight size={18}/></button></section>
  </main>}
  {page==="Catálogo"&&<main className="page"><div className="pageTitleRow"><div><span className="eyebrow">DESCUBRE</span><h2>Catálogo</h2></div><button className="searchBtn" onClick={()=>setSearch(!search)}><Search/></button></div>{search&&<div className="searchBox"><Search/><input autoFocus placeholder="Buscar un dibujo..." value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button onClick={()=>setQuery("")}><X/></button>}</div>}<div className="chips">{["Todos",...cats.map(c=>c.name)].map(c=><button className={category===c?"active":""} key={c} onClick={()=>setCategory(c)}>{c}</button>)}</div><div className="catalogGrid">{filtered.map(p=><Card key={p.id} p={p} fav={favorites.includes(p.id)} onFav={toggleFav} onOpen={setSelected} onAdd={add}/>)}</div></main>}
  {page==="Encargos"&&<main className="page"><span className="eyebrow">HECHO PARA TI</span><h2>Solicita tu dibujo personalizado</h2><form className="orderForm" onSubmit={submitOrder}><label>Tu nombre<input name="name" required/></label><label>WhatsApp<input name="phone" required/></label><label>Tipo de dibujo<select name="type"><option>Retrato</option><option>Animal</option><option>Paisaje</option><option>Otro</option></select></label><label>Cuéntame tu idea<textarea name="idea" required placeholder="Describe el dibujo que imaginas..."/></label><button className="primary">Enviar solicitud <ArrowRight/></button></form>{!user&&<div className="infoBox"><User/> Inicia sesión o crea tu cuenta para enviar la solicitud.</div>}</main>}
  {page==="Carrito"&&<main className="page"><div className="pageTitleRow"><button className="back" onClick={()=>go("Catálogo")}><ChevronLeft/> Catálogo</button><h2>Carrito</h2></div>{!cart.length?<div className="empty"><ShoppingBag/><p>Tu carrito está vacío.</p><button className="primary" onClick={()=>go("Catálogo")}>Explorar catálogo</button></div>:<><div className="cartList">{cart.map((p,i)=><div className="cartItem" key={i}><img src={p.image}/><div><h3>{p.name}</h3><p>{money(p.price)}</p></div><button onClick={()=>setCart(c=>c.filter((_,n)=>n!==i))}><Trash2/></button></div>)}</div><div className="total"><span>Total</span><strong>{money(total)}</strong></div><div className="payActions"><button className="primary" onClick={checkout}><CreditCard/> Pagar con tarjeta</button><button className="secondary" onClick={requestTransfer}>🏦 Pagar por transferencia</button><button className="secondary" onClick={()=>whatsapp(`Hola Lucero Art, quiero pedir: ${cart.map(p=>p.name).join(", ")}. Total: ${money(total)}.`)}><MessageCircle/> Pedir por WhatsApp</button></div><div className="shipping"><Truck/> Envíos y entrega se coordinan después del pago.</div></>}</main>}
  {page==="Mensajes"&&<main className="page simple"><MessageCircle/><h2>Mensajes</h2><p>Habla directamente con Lucero Art.</p><button className="primary" onClick={()=>whatsapp("Hola Lucero Art, tengo una consulta.")}>Abrir WhatsApp <MessageCircle/></button></main>}
  {page==="Mi perfil"&&<main className="page">{!user?<div className="simple"><UserRound/><h2>Mi cuenta</h2><p>Crea una cuenta para guardar tus pedidos y encargos.</p><button className="primary" onClick={()=>setAuth("login")}>Iniciar sesión</button><button className="secondary" onClick={()=>setAuth("register")}>Crear cuenta</button></div>:<><span className="eyebrow">MI CUENTA</span><h2>Hola, {user.name}</h2><div className="profileCard"><UserRound/><div><b>{user.email}</b><p>{orders.length} pedidos/solicitudes</p></div></div><h3>Mis pedidos</h3>{orders.length?<div className="orders">{orders.map(o=><div className="order" key={o.id}><CheckCircle/><div><b>{o.kind==="custom"?"Encargo personalizado":"Pedido"}</b><p>Estado: {o.status}</p><small>{o.created_at}</small></div></div>)}</div>:<p>Aún no tienes pedidos.</p>}<button className="secondary" onClick={()=>{localStorage.removeItem("la-user");setUser(null);setAdmin(false);notify("Sesión cerrada")}}><LogOut/> Cerrar sesión</button></>}</main>}
  {page==="Admin"&&user?.role==="admin"&&<Admin token={user.token} products={products} setProducts={setProducts} notify={notify}/>}
  <nav className="bottomNav">{[[Home,"Inicio"],[Palette,"Catálogo"],[Pencil,"Encargos"],[MessageCircle,"Mensajes"],[UserRound,"Mi perfil"]].map(([I,l])=><button key={l} className={page===l?"navItem active":"navItem"} onClick={()=>go(l)}><I/><span>{l}</span></button>)}</nav>
  {selected&&<div className="modalBackdrop" onClick={()=>setSelected(null)}><div className="modal" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setSelected(null)}><X/></button><img src={selected.image}/><div className="modalBody"><span className="eyebrow">{selected.category}</span><h2>{selected.name}</h2><p>{selected.desc}</p><strong>{money(selected.price)}</strong><button className="primary" onClick={()=>add(selected)}>Agregar al carrito <ShoppingBag/></button></div></div></div>}
  {auth&&<Auth mode={auth} onClose={()=>setAuth(null)} onLogin={login} onRegister={register} onAdmin={adminLogin}/>}
  {transfer&&<TransferModal data={transfer} onClose={()=>{setTransfer(null);setCart([]);notify("Pedido por transferencia registrado")}} whatsapp={whatsapp}/>}
  {toast&&<div className="toast">{toast}</div>}
 </div>
}
function Card({p,fav,onFav,onOpen,onAdd}){return <article className="productCard" onClick={()=>onOpen(p)}><div className="productImage"><img src={p.image} alt={p.name}/></div><div className="productInfo"><div><h3>{p.name}</h3><strong>{money(p.price)}</strong></div><button className={fav?"fav selected":"fav"} onClick={e=>{e.stopPropagation();onFav(p.id)}}><Heart fill={fav?"currentColor":"none"}/></button></div></article>}

function TransferModal({data,onClose,whatsapp}){return <div className="modalBackdrop"><div className="auth transferModal"><button className="close" onClick={onClose}><X/></button><CheckCircle className="successIcon"/><h2>Transferencia bancaria</h2><p>Tu pedido <b>#{data.orderId}</b> quedó registrado. Realiza la transferencia y envía tu comprobante por WhatsApp.</p><div className="bankBox"><div><span>Banco</span><b>{data.bank}</b></div><div><span>Titular</span><b>{data.holder}</b></div><div><span>Cuenta</span><b>{data.account}</b></div><div><span>CLABE</span><b>{data.clabe}</b></div><div><span>Total</span><b>{money(data.total)}</b></div></div><button className="primary" onClick={()=>whatsapp(`Hola Lucero Art. Soy ${data.customer}. Mi pedido #${data.orderId} por ${money(data.total)} fue pagado por transferencia. Adjunto mi comprobante.`)}><MessageCircle/> Enviar comprobante</button><button className="secondary" onClick={onClose}>Cerrar</button></div></div>}
function Auth({mode,onClose,onLogin,onRegister,onAdmin}){
 const[error,setError]=useState("");
 const submit=async e=>{e.preventDefault();const d=new FormData(e.currentTarget);try{if(mode==="login")await onLogin(d.get("email"),d.get("password"));else if(mode==="register")await onRegister(d.get("name"),d.get("email"),d.get("password"));else await onAdmin(d.get("email"),d.get("password"))}catch(x){setError(x.message)}};
 return <div className="modalBackdrop"><div className="auth"><button className="close" onClick={onClose}><X/></button><Lock/><h2>{mode==="register"?"Crear cuenta":mode==="admin"?"Administración":"Iniciar sesión"}</h2><form onSubmit={submit}>{mode==="register"&&<input name="name" placeholder="Nombre" required/>}<input name="email" type="email" placeholder="Correo electrónico" required/><input name="password" type="password" placeholder="Contraseña" required minLength="6"/>{error&&<p className="error">{error}</p>}<button className="primary">Continuar <ArrowRight/></button></form></div></div>
}
function Admin({token,products,setProducts,notify}){
 const[orders,setOrders]=useState([]),[form,setForm]=useState({name:"",price:"",category:"Dibujos disponibles",image:"/assets/lirio.jpg",desc:""});
 const load=()=>api("/api/admin/orders",{headers:{Authorization:`Bearer ${token}`}}).then(d=>setOrders(d.orders));
 useEffect(()=>{load()},[]);
 const add=async e=>{e.preventDefault();try{const d=await api("/api/admin/products",{method:"POST",headers:{Authorization:`Bearer ${token}`},body:JSON.stringify({...form,price:Number(form.price)})});setProducts(p=>[...p,d.product]);setForm({name:"",price:"",category:"Dibujos disponibles",image:"/assets/lirio.jpg",desc:""});notify("Producto agregado")}catch(x){notify(x.message)}};
 const del=async id=>{try{await api(`/api/admin/products/${id}`,{method:"DELETE",headers:{Authorization:`Bearer ${token}`}});setProducts(p=>p.filter(x=>x.id!==id));notify("Producto eliminado")}catch(x){notify(x.message)}};
 const status=async(id,value)=>{try{await api(`/api/admin/orders/${id}`,{method:"PATCH",headers:{Authorization:`Bearer ${token}`},body:JSON.stringify({status:value})});load();notify("Estado actualizado")}catch(x){notify(x.message)}};
 return <main className="page admin"><div className="adminHead"><div><span className="eyebrow">GESTIÓN</span><h2>Panel de administración</h2></div></div>
 <div className="adminStats"><div><Package/><b>{products.length}</b><span>Productos</span></div><div><Pencil/><b>{orders.length}</b><span>Pedidos</span></div><div><Truck/><b>{orders.filter(o=>o.status==="Recibido").length}</b><span>Nuevos</span></div></div>
 <section className="adminPanel"><h3><Plus/> Agregar dibujo</h3><form className="adminForm" onSubmit={add}><input required placeholder="Nombre" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><input required type="number" placeholder="Precio MXN" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option>Dibujos disponibles</option><option>Animales</option><option>Paisajes</option><option>Retratos</option></select><input placeholder="Descripción" value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})}/><button className="primary">Agregar</button></form></section>
 <section className="adminPanel"><h3><Palette/> Productos</h3>{products.map(p=><div className="adminRow" key={p.id}><img src={p.image}/><div><b>{p.name}</b><span>{money(p.price)} · {p.category}</span></div><button onClick={()=>del(p.id)}><Trash2/></button></div>)}</section>
 <section className="adminPanel"><h3><Pencil/> Pedidos</h3>{orders.length===0?<p>No hay pedidos todavía.</p>:orders.map(o=><div className="adminOrder" key={o.id}><div><b>{o.customer_name}</b><span>{o.kind} · {o.created_at}</span><p>{o.details}</p></div><select value={o.status} onChange={e=>status(o.id,e.target.value)}><option>Recibido</option><option>En proceso</option><option>Listo</option><option>Enviado</option><option>Entregado</option></select></div>)}</section>
 </main>
}
createRoot(document.getElementById("root")).render(<App/>);
