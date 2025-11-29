
// Minimal JS for interactions (placeholders version)
const mobileToggle = document.getElementById('mobileToggle');
const nav = document.querySelector('.nav');
let menuOpen = false;
if (mobileToggle){
  mobileToggle.addEventListener('click', ()=>{
    menuOpen = !menuOpen;
    if (menuOpen){ nav.style.display='flex'; nav.style.flexDirection='column'; nav.style.position='absolute'; nav.style.right='18px'; nav.style.top='64px'; nav.style.background='rgba(255,255,255,0.98)'; nav.style.padding='12px'; nav.style.borderRadius='12px'; mobileToggle.textContent='✕'; }
    else { nav.style.display='none'; mobileToggle.textContent='☰'; }
  });
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a=> a.addEventListener('click', function(e){ const href=this.getAttribute('href'); if (href.length>1){ e.preventDefault(); const el=document.querySelector(href); if (el) el.scrollIntoView({behavior:'smooth', block:'start'}); if (window.innerWidth<980 && nav){ nav.style.display='none'; menuOpen=false; mobileToggle.textContent='☰'; } }}));

// Order system (keeps cart)
const orderItems=[]; const menuPrices={'Jollof Rice + Chicken':35,'Banku + Tilapia':40,'Fufu + Light Soup':38,'Grilled Chicken + Chips':45,'Plain Rice':30,'Boiled Yam + Kontomere + Eggs':32,'Konkonte + Groundnut Soup':36,'Fried Rice + Chicken':38};

function saveCart(){ try{ localStorage.setItem('mamasCart', JSON.stringify(orderItems)); }catch(e){} }
function loadCart(){ try{ const saved=JSON.parse(localStorage.getItem('mamasCart')||'[]'); if (Array.isArray(saved)&&saved.length){ orderItems.length=0; saved.forEach(i=>orderItems.push(i)); } }catch(e){} }
function updateOrderSummary(){ const orderItemsDiv=document.getElementById('orderItems'); const orderTotalSpan=document.getElementById('orderTotal'); if (!orderItemsDiv||!orderTotalSpan) return; let total=0; if(orderItems.length===0){ orderItemsDiv.innerHTML=`<div class="empty-cart-message"><i class="fas fa-utensils"></i><p>Your cart is empty</p><span>Add delicious items from our menu!</span></div>`; }else{ orderItemsDiv.innerHTML=''; orderItems.forEach((it,idx)=>{ total+=it.price*it.qty; const el=document.createElement('div'); el.className='order-item-card'; el.innerHTML=`<div class="order-item-info"><div class="order-item-name">${it.name}</div><div class="order-item-details"><span>Qty: ${it.qty}</span><span>× GHS ${it.price.toFixed(2)}</span></div></div><div style="display:flex;align-items:center;gap:12px;"><div class="order-item-price">GHS ${(it.price*it.qty).toFixed(2)}</div><button class="remove-order-btn" data-idx="${idx}" aria-label="Remove ${it.name} from order"><i class="fas fa-trash"></i></button></div>`; orderItemsDiv.appendChild(el); }); document.querySelectorAll('.remove-order-btn').forEach(btn=>btn.addEventListener('click', ()=>{ orderItems.splice(parseInt(btn.dataset.idx),1); saveCart(); updateOrderSummary(); })); } orderTotalSpan.textContent=`GHS ${total.toFixed(2)}`; saveCart(); }
function addToOrder(name){ const found=orderItems.find(i=>i.name===name); if (found) found.qty+=1; else orderItems.push({name, price: menuPrices[name]||0, qty:1}); updateOrderSummary(); showToast('Added to order'); }
function showToast(msg, time=1400){ const t=document.getElementById('toast'); if(!t) return; t.textContent=msg; t.style.display='block'; setTimeout(()=> t.style.display='none', time); }

// Menu filtering functionality
function initMenuFilter() {
  const buttons = document.querySelectorAll('.menu-categories .menu-category');
  const cards = document.querySelectorAll('.menu-grid .menu-card');
  if (!buttons.length || !cards.length) return;
  
  // Initialize all cards as visible with smooth transitions
  cards.forEach(card => {
    card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    card.style.opacity = '1';
    card.style.transform = 'translateY(0)';
  });
  
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button state
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const category = btn.dataset.category;
      
      // First, hide all cards that don't match
      cards.forEach((card) => {
        const shouldShow = category === 'all' || card.dataset.category === category;
        if (!shouldShow) {
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => {
            card.classList.add('hidden');
            card.style.display = 'none';
          }, 400);
        }
      });
      
      // Then, show matching cards with staggered animation
      let visibleIndex = 0;
      cards.forEach((card) => {
        const shouldShow = category === 'all' || card.dataset.category === category;
        if (shouldShow) {
          const wasHidden = card.classList.contains('hidden');
          card.classList.remove('hidden');
          card.style.display = '';
          
          if (wasHidden) {
            // If card was hidden, start from invisible and animate in
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            // Force reflow
            void card.offsetHeight;
          }
          
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, visibleIndex * 50);
          visibleIndex++;
        }
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  loadCart();
  updateOrderSummary();
  initMenuFilter();

  const scrollBtn=document.getElementById('scrollToTop');
  window.addEventListener('scroll', ()=>{ if (window.scrollY>400) scrollBtn.style.display='block'; else scrollBtn.style.display='none'; });
  scrollBtn.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));

  const newsletter=document.getElementById('newsletterForm');
  if(newsletter) newsletter.addEventListener('submit', e=>{ e.preventDefault(); showToast('Thanks for subscribing!'); newsletter.reset(); });

  const orderForm=document.getElementById('orderForm');
  if(orderForm){
    // Before submit: serialize cart to hidden fields; do not prevent default
    orderForm.addEventListener('submit', ()=>{
      const itemsField = document.getElementById('orderItemsField');
      const totalField = document.getElementById('orderTotalField');
      const messageField = document.getElementById('messageField');
      const redirectField = document.getElementById('redirectField');
      const itemsText = orderItems.map(i=>`${i.name} x ${i.qty} @ GHS ${i.price.toFixed(2)}`).join('; ');
      const total = orderItems.reduce((s,i)=>s+i.price*i.qty,0);
      if (itemsField) itemsField.value = itemsText || 'No items';
      if (totalField) totalField.value = `GHS ${total.toFixed(2)}`;

      // Build human-readable message body
      const name=document.getElementById('name')?.value.trim()||'';
      const phone=document.getElementById('phone')?.value.trim()||'';
      const address=document.getElementById('address')?.value.trim()||'';
      const notes=document.getElementById('notes')?.value.trim()||'';
      const payment=document.querySelector('input[name="payment"]:checked')?.value||'cash';
      const lines = [
        `New Order - Mama's Kitchen`,
        `--------------------------------`,
        `Name: ${name}`,
        `Phone: ${phone}`,
        `Address: ${address}`,
        `Payment: ${payment}`,
        ``,
        `Items:`,
        ...(orderItems.length? orderItems.map(i=>`- ${i.name} x ${i.qty} @ GHS ${i.price.toFixed(2)} = GHS ${(i.price*i.qty).toFixed(2)}`): ['- (no items)']),
        ``,
        `Total: GHS ${total.toFixed(2)}`,
        notes? `Notes: ${notes}`: ''
      ].filter(Boolean);
      if (messageField) messageField.value = lines.join('\n');

      // Redirect back with success flag so we can show a banner
      const url = new URL(window.location.href);
      url.searchParams.set('success','1');
      url.hash = 'order';
      if (redirectField) redirectField.value = url.toString();
    });
  }

  const contactForm = document.getElementById('contactForm');
  if (contactForm){
    const statusEl = document.getElementById('contactStatus');
    const submitBtn = contactForm.querySelector('.contact-form-submit');
    const defaultBtnContent = submitBtn ? submitBtn.innerHTML : '';

    contactForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      if (statusEl){
        statusEl.textContent = 'Sending your message...';
        statusEl.classList.remove('error','success');
      }
      if (submitBtn){
        submitBtn.disabled = true;
        submitBtn.classList.add('is-loading');
        const span = submitBtn.querySelector('span');
        if (span) span.textContent = 'Sending...';
      }

      try{
        const formData = new FormData(contactForm);
        formData.set('_subject','New Contact Message - Mama\'s Kitchen');
        formData.set('form_type','contact');
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok){
          let message = 'Something went wrong. Please try again soon.';
          try{
            const data = await response.json();
            if (data?.errors?.length){
              message = data.errors.map(err=>err.message).join(', ');
            }else if (data?.message){
              message = data.message;
            }
          }catch(err){}
          throw new Error(message);
        }

        if (statusEl){
          statusEl.textContent = 'Message sent! We\'ll get back to you shortly.';
          statusEl.classList.add('success');
        }
        contactForm.reset();
        showToast('Thanks for reaching out!');
        setTimeout(()=>{
          if (statusEl){
            statusEl.textContent = '';
            statusEl.classList.remove('success');
          }
        }, 6000);
      }catch(error){
        if (statusEl){
          statusEl.textContent = error.message || 'Unable to send message. Please try again.';
          statusEl.classList.add('error');
        }
      }finally{
        if (submitBtn){
          submitBtn.disabled = false;
          submitBtn.classList.remove('is-loading');
          submitBtn.innerHTML = defaultBtnContent;
        }
      }
    });
  }

  // WhatsApp order button logic
  const whatsappBtn = document.getElementById('whatsappOrderBtn');
  if (whatsappBtn){
    whatsappBtn.addEventListener('click', ()=>{
      const name=document.getElementById('name').value.trim();
      const phone=document.getElementById('phone').value.trim();
      if (phone.length<10){ document.getElementById('status').innerHTML='<span style="color:#c0392b">Please enter a valid phone</span>'; return; }
      if(orderItems.length===0){ document.getElementById('status').innerHTML='<span style="color:#c0392b">Please add items to your order</span>'; return; }
      const total=orderItems.reduce((s,i)=>s+i.price*i.qty,0);
      const address=document.getElementById('address').value.trim();
      const notes=document.getElementById('notes').value.trim();
      const payment=document.querySelector('input[name="payment"]:checked')?.value||'cash';
      const orderText = orderItems.map(i=>`${i.name} x ${i.qty}`).join('%0A');
      const message = `*NEW ORDER*%0AName: ${name}%0APhone: ${phone}%0AAddress: ${address}%0APayment: ${payment}%0AOrder:%0A${orderText}%0ATotal: GHS ${total.toFixed(2)}%0ANotes: ${notes}`;
      window.open(`https://wa.me/233594469283?text=${message}`, '_blank');
      showToast('Order sent via WhatsApp');
    });
  }

  // If redirected back with success=1, show success message and clean URL
  try{
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === '1'){
      const statusEl = document.getElementById('status');
      if (statusEl){
        statusEl.innerHTML = '<span style="color:#27ae60;font-weight:600">✓ Your order was submitted successfully</span>';
        setTimeout(()=>{ statusEl.innerHTML=''; }, 6000);
      }
      // Remove success param from URL
      const clean = new URL(window.location.href);
      clean.searchParams.delete('success');
      window.history.replaceState({}, document.title, clean.toString());
    }
  }catch(e){}
});
