import express from"express";
import cors from"cors";
import dotenv from"dotenv";
import bcrypt from"bcryptjs";
import jwt from"jsonwebtoken";
import Database from"better-sqlite3";
import Stripe from"stripe";
import path from"path";
import{fileURLToPath}from"url";

dotenv.config();
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const db=new Database(process.env.DB_FILE||path.join(__dirname,"../data/lucero.db"));
db.pragma("foreign_keys=ON");
db.exec(`
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'customer',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS products(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,price INTEGER NOT NULL,category TEXT NOT NULL,image TEXT NOT NULL,description TEXT DEFAULT '',stock INTEGER NOT NULL DEFAULT 1,active INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS orders(id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER,customer_name TEXT NOT NULL,phone TEXT,kind TEXT NOT NULL,details TEXT NOT NULL,total INTEGER NOT NULL DEFAULT 0,status TEXT NOT NULL DEFAULT 'Recibido',stripe_session_id TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(user_id) REFERENCES users(id));
`);
const count=db.prepare("SELECT COUNT(*) c FROM products").get().c;
if(!count){
 const ins=db.prepare("INSERT INTO products(name,price,category,image,description,stock) VALUES(?,?,?,?,?,?)");
 [["Lirio",250,"Dibujos disponibles","/assets/lirio.jpg","Ilustración floral delicada, lista para decorar o regalar.",5],["Gato",300,"Animales","/assets/gato.jpg","Retrato artístico de un compañero felino.",4],["Paisaje de Chiapas",350,"Paisajes","/assets/paisaje.jpg","Paisaje inspirado en la naturaleza de Chiapas.",3],["Caballo",300,"Animales","/assets/caballo.jpg","Ilustración detallada de caballo.",6]].forEach(x=>ins.run(...x));
}
const ADMIN_EMAIL=process.env.ADMIN_EMAIL||"admin@luceroart.local";
const ADMIN_PASSWORD=process.env.ADMIN_PASSWORD||"cambia-esta-clave";
if(!db.prepare("SELECT id FROM users WHERE email=?").get(ADMIN_EMAIL)){
 const hash=bcrypt.hashSync(ADMIN_PASSWORD,12);
 db.prepare("INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,'admin')").run("Lucero Art",ADMIN_EMAIL,hash);
}
const app=express();
app.use(cors());app.use(express.json({limit:"1mb"}));
const secret=process.env.JWT_SECRET||"cambia-este-secreto";
const sign=u=>jwt.sign({id:u.id,role:u.role,name:u.name,email:u.email},secret,{expiresIn:"7d"});
function auth(req,res,next){try{req.user=jwt.verify((req.headers.authorization||"").replace("Bearer ",""),secret);next()}catch{res.status(401).json({error:"Sesión requerida"})}}
function admin(req,res,next){auth(req,res,()=>req.user.role==="admin"?next():res.status(403).json({error:"Acceso de administrador requerido"}))}
app.get("/api/products",(req,res)=>res.json({products:db.prepare("SELECT id,name,price,category,image,description AS desc,stock FROM products WHERE active=1 ORDER BY id DESC").all()}));
app.post("/api/auth/register",(req,res)=>{
 const{name,email,password}=req.body||{};if(!name||!email||!password||password.length<6)return res.status(400).json({error:"Completa nombre, correo y una contraseña de 6+ caracteres."});
 try{const hash=bcrypt.hashSync(password,12);const x=db.prepare("INSERT INTO users(name,email,password_hash) VALUES(?,?,?)").run(name,email.toLowerCase(),hash);const u=db.prepare("SELECT id,name,email,role FROM users WHERE id=?").get(x.lastInsertRowid);res.json({user:{...u,token:sign(u)}})}catch{res.status(409).json({error:"Ese correo ya está registrado."})}
});
app.post("/api/auth/login",(req,res)=>{const{email,password}=req.body||{};const u=db.prepare("SELECT * FROM users WHERE email=?").get((email||"").toLowerCase());if(!u||!bcrypt.compareSync(password||"",u.password_hash))return res.status(401).json({error:"Correo o contraseña incorrectos."});res.json({user:{id:u.id,name:u.name,email:u.email,role:u.role,token:sign(u)}})});
app.post("/api/admin/login",(req,res)=>{const{email,password}=req.body||{};const u=db.prepare("SELECT * FROM users WHERE email=? AND role='admin'").get((email||"").toLowerCase());if(!u||!bcrypt.compareSync(password||"",u.password_hash))return res.status(401).json({error:"Acceso de administración incorrecto."});res.json({user:{id:u.id,name:u.name,email:u.email,role:u.role,token:sign(u)}})});
app.get("/api/orders",auth,(req,res)=>res.json({orders:db.prepare("SELECT id,kind,status,created_at,details FROM orders WHERE user_id=? ORDER BY id DESC").all(req.user.id)}));
app.post("/api/custom-orders",auth,(req,res)=>{const{name,phone,type,idea}=req.body||{};if(!name||!phone||!idea)return res.status(400).json({error:"Faltan datos del encargo."});const x=db.prepare("INSERT INTO orders(user_id,customer_name,phone,kind,details,total) VALUES(?,?,?,?,?,0)").run(req.user.id,name,phone,"custom",`${type}: ${idea}`);res.json({id:x.lastInsertRowid})});
app.post("/api/transfer-orders",auth,(req,res)=>{
 const ids=Array.isArray(req.body?.items)?req.body.items:[]; if(!ids.length)return res.status(400).json({error:"Carrito vacío."});
 const qs=ids.map(()=>"?").join(","); const items=db.prepare(`SELECT id,name,price FROM products WHERE active=1 AND id IN(${qs})`).all(...ids);
 if(!items.length)return res.status(400).json({error:"No hay productos disponibles."});
 const total=items.reduce((s,p)=>s+p.price,0);
 const u=db.prepare("SELECT name FROM users WHERE id=?").get(req.user.id);
 const details=items.map(p=>p.name).join(", ");
 const x=db.prepare("INSERT INTO orders(user_id,customer_name,kind,details,total,status) VALUES(?,?,?,?,?,'Recibido')").run(req.user.id,u.name,"transfer",details,total);
 res.json({orderId:x.lastInsertRowid,total,customer:u.name,bank:process.env.TRANSFER_BANK||"Banco por configurar",holder:process.env.TRANSFER_HOLDER||"Lucero Art",account:process.env.TRANSFER_ACCOUNT||"Por configurar",clabe:process.env.TRANSFER_CLABE||"Por configurar"});
});
app.post("/api/checkout",async(req,res)=>{
 const ids=Array.isArray(req.body?.items)?req.body.items:[];if(!ids.length)return res.status(400).json({error:"Carrito vacío."});
 const qs=ids.map(()=>"?").join(",");const items=db.prepare(`SELECT id,name,price,image,stock FROM products WHERE active=1 AND id IN(${qs})`).all(...ids);
 if(!items.length)return res.status(400).json({error:"No hay productos disponibles."});
 if(!process.env.STRIPE_SECRET_KEY)return res.json({url:null,checkoutConfigured:false});
 const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);
 const line_items=items.map(p=>({price_data:{currency:"mxn",product_data:{name:p.name},unit_amount:p.price*100},quantity:1}));
 const session=await stripe.checkout.sessions.create({mode:"payment",line_items,success_url:`${process.env.PUBLIC_URL||"http://localhost:5173"}/?paid=1`,cancel_url:`${process.env.PUBLIC_URL||"http://localhost:5173"}/?cancel=1`,locale:"es"});
 res.json({url:session.url,checkoutConfigured:true});
});
app.get("/api/admin/orders",admin,(req,res)=>res.json({orders:db.prepare("SELECT id,customer_name,phone,kind,details,total,status,created_at FROM orders ORDER BY id DESC").all()}));
app.patch("/api/admin/orders/:id",admin,(req,res)=>{const{status}=req.body||{};db.prepare("UPDATE orders SET status=? WHERE id=?").run(status,req.params.id);res.json({ok:true})});
app.post("/api/admin/products",admin,(req,res)=>{const{name,price,category,image,desc,stock=1}=req.body||{};if(!name||!price||!category||!image)return res.status(400).json({error:"Completa los datos del producto."});const x=db.prepare("INSERT INTO products(name,price,category,image,description,stock) VALUES(?,?,?,?,?,?)").run(name,Number(price),category,image,desc||"",Number(stock));res.json({product:{id:x.lastInsertRowid,name,price:Number(price),category,image,desc:desc||"",stock:Number(stock)}})});
app.delete("/api/admin/products/:id",admin,(req,res)=>{db.prepare("UPDATE products SET active=0 WHERE id=?").run(req.params.id);res.json({ok:true})});
app.get("/api/health",(req,res)=>res.json({ok:true}));
const dist=path.join(__dirname,"../dist");
if(process.env.NODE_ENV==="production")app.use(express.static(dist));
app.listen(process.env.PORT||3001,()=>console.log("Lucero Art API en puerto",process.env.PORT||3001));
