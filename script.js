const $=(selector,root=document)=>root.querySelector(selector);const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];

const header=$('#siteHeader');
window.addEventListener('scroll',()=>header.classList.toggle('scrolled',window.scrollY>20),{passive:true});

function setupDisclosure(button,panel){if(!button||!panel)return;button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')==='true';button.setAttribute('aria-expanded',String(!open));panel.hidden=open;});}
const shopTrigger=$('#shopTrigger'),shopMenu=$('#shopMenu');setupDisclosure(shopTrigger,shopMenu);
document.addEventListener('click',event=>{if(shopMenu&&!event.target.closest('.dropdown')){shopMenu.hidden=true;shopTrigger?.setAttribute('aria-expanded','false')}});

const menuButton=$('#menuButton'),mobileMenu=$('#mobileMenu'),mobileShopButton=$('#mobileShopButton'),mobileShop=$('#mobileShop');
function closeMobileMenu(){if(!mobileMenu)return;mobileMenu.hidden=true;menuButton?.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open')}
menuButton?.addEventListener('click',()=>{const open=!mobileMenu.hidden;mobileMenu.hidden=open;menuButton.setAttribute('aria-expanded',String(!open));document.body.classList.toggle('menu-open',!open)});
setupDisclosure(mobileShopButton,mobileShop);$$('#mobileMenu a').forEach(link=>link.addEventListener('click',closeMobileMenu));
window.addEventListener('resize',()=>{if(innerWidth>=900)closeMobileMenu()});

const filters=$$('.filter'),cards=$$('.product-card');
function applyFilter(filter){filters.forEach(button=>button.classList.toggle('active',button.dataset.filter===filter));cards.forEach(card=>{card.hidden=filter!=='all'&&card.dataset.category!==filter})}
filters.forEach(button=>button.addEventListener('click',()=>applyFilter(button.dataset.filter)));
$$('[data-filter]').filter(link=>!link.classList.contains('filter')).forEach(link=>link.addEventListener('click',()=>{applyFilter(link.dataset.filter);closeMobileMenu()}));

const reviewTrack=$('#reviewTrack');$('#previousReview')?.addEventListener('click',()=>reviewTrack.scrollBy({left:-340,behavior:'smooth'}));$('#nextReview')?.addEventListener('click',()=>reviewTrack.scrollBy({left:340,behavior:'smooth'}));

const CART_KEY='naskin-cart';let cart=readCart();function readCart(){try{const value=JSON.parse(localStorage.getItem(CART_KEY));return Array.isArray(value)?value:[]}catch{return []}}function saveCart(){localStorage.setItem(CART_KEY,JSON.stringify(cart))}function money(inr,usd){return `₹${inr.toLocaleString('en-IN')} / $${usd}`}
const cartButton=$('#cartButton'),cartPopover=$('#cartPopover'),cartBadge=$('#cartBadge'),cartItems=$('#cartItems'),cartEmpty=$('#cartEmpty'),cartTotal=$('#cartTotal'),cartTotalValue=$('#cartTotalValue'),checkoutButton=$('#checkoutButton');
function renderCart(){saveCart();const count=cart.reduce((sum,item)=>sum+item.qty,0);cartBadge.textContent=count;cartBadge.style.display=count?'grid':'none';cartEmpty.hidden=Boolean(count);cartTotal.hidden=!count;checkoutButton.hidden=!count;cartItems.replaceChildren();let inr=0,usd=0;cart.forEach((item,index)=>{inr+=item.inr*item.qty;usd+=item.usd*item.qty;const row=document.createElement('div');row.className='cart-item';row.innerHTML=`<span>${item.name} × ${item.qty}<br><small>${money(item.inr*item.qty,item.usd*item.qty)}</small></span><button class="remove-item" type="button" data-index="${index}" aria-label="Remove ${item.name}">×</button>`;cartItems.append(row)});cartTotalValue.textContent=money(inr,usd);$$('.remove-item',cartItems).forEach(button=>button.addEventListener('click',()=>{cart.splice(Number(button.dataset.index),1);renderCart()}))}
cartButton?.addEventListener('click',()=>{const open=cartPopover.hidden;cartPopover.hidden=!open;cartButton.setAttribute('aria-expanded',String(open))});document.addEventListener('click',event=>{if(cartPopover&&!event.target.closest('.cart-wrap')){cartPopover.hidden=true;cartButton?.setAttribute('aria-expanded','false')}});
function toast(message){const element=$('#toast');element.textContent=message;element.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>element.classList.remove('show'),2400)}
$$('.add-button').forEach(button=>button.addEventListener('click',()=>{const item={id:button.dataset.id,name:button.dataset.name,inr:Number(button.dataset.inr),usd:Number(button.dataset.usd),qty:1};const existing=cart.find(product=>product.id===item.id);if(existing)existing.qty++;else cart.push(item);renderCart();toast(`${item.name} added to your bag`)}));checkoutButton?.addEventListener('click',()=>toast('Checkout is ready to connect to your payment provider'));
renderCart();

$('#contactForm')?.addEventListener('submit',event=>{event.preventDefault();const form=event.currentTarget;$('#contactSuccess').hidden=false;form.reset();setTimeout(()=>$('#contactSuccess').hidden=true,5000)});
$('#newsletterForm')?.addEventListener('submit',event=>{event.preventDefault();const form=event.currentTarget;$('#newsletterSuccess').hidden=false;form.reset();setTimeout(()=>$('#newsletterSuccess').hidden=true,5000)});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeMobileMenu();if(shopMenu){shopMenu.hidden=true;shopTrigger?.setAttribute('aria-expanded','false')}if(cartPopover){cartPopover.hidden=true;cartButton?.setAttribute('aria-expanded','false')}}});
