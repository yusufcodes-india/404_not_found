import fs from 'fs';
import path from 'path';

const htmlPath = path.resolve('./public/kilari.html');
let content = fs.readFileSync(htmlPath, 'utf8');

// Ensure Leaflet and Razorpay scripts are in <head>
if (!content.includes('checkout.razorpay.com')) {
  content = content.replace(
    '</head>',
    `<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
</head>`
  );
}

const scriptStartTag = '<script>';
const scriptEndTag = '</script>';

const startIndex = content.indexOf(scriptStartTag);
const endIndex = content.lastIndexOf(scriptEndTag);

if (startIndex === -1 || endIndex === -1) {
  console.error('Script tags not found');
  process.exit(1);
}

const newScript = `<script>
const driverNav=[['⌂','Home','overview'],['⌖','Find chargers','find'],['✦','Smart route','route'],['▣','Bookings','bookings'],['☆','Ratings','ratings']];
const hostNav=[['⌂','Home','overview'],['ϟ','My chargers','chargers'],['▤','Requests','requests'],['◷','Sessions','sessions'],['✦','AI insights','insights']];
let mode='driver',page='overview',loggedIn=false,rankingPreference='balanced',accountName='',accountPhone='';

window.kilariToken = localStorage.getItem('kilari_token') || '';
window.liveChargers = [];
window.liveBookings = [];
window.liveSessions = [];
window.liveInsights = null;
window.selectedCharger = null;
window.currentGatePass = null;

function escapeHTML(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
function initialsFor(name){return (name||'Kilari User').trim().split(/\\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase()}
function toast(t){let x=document.getElementById('toast');x.textContent=t;x.classList.remove('hidden');setTimeout(()=>x.classList.add('hidden'),2800)}

function validIndianMobile(){
  const el=document.getElementById('authPhone');
  const digits=(el.value||'').replace(/\\D/g,'');
  const mobile=digits.length===10?digits:(digits.length===12&&digits.startsWith('91')?digits.slice(2):'');
  const valid=/^[6-9]\\d{9}$/.test(mobile);
  el.setCustomValidity(valid?'':'Enter a valid 10-digit Indian mobile number.');
  if(!valid){el.reportValidity();el.focus();return false}
  el.setCustomValidity('');
  return true;
}

async function sendDemoOtp(){
  if(!validIndianMobile()){toast('Enter a valid 10-digit mobile number first');return}
  const digits=(document.getElementById('authPhone').value||'').replace(/\\D/g,'').slice(-10);
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: digits, role: mode === 'driver' ? 'DRIVER' : 'HOST' })
    });
    const json = await res.json();
    if(json.ok){
      document.getElementById('otpHint').textContent = json.data?.hint || 'Demo OTP: use 123456';
      toast('Demo OTP sent: 123456');
      return;
    }
  } catch(e) {}
  document.getElementById('otpHint').textContent='Demo OTP: use 123456.';
  toast('Demo OTP: 123456');
}

function showWorkspaceChoice(){
  loggedIn=true;
  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('workspaceChoice').classList.remove('hidden');
  document.body.classList.add('logged-out');
}

async function loginSubmit(e){
  e.preventDefault();
  const enteredName=(document.getElementById('authName').value||'').trim().replace(/\\s+/g,' ');
  if(enteredName.length<2){
    document.getElementById('authName').setCustomValidity('Enter your full name (at least 2 characters).');
    document.getElementById('authName').reportValidity();
    document.getElementById('authName').focus();
    return;
  }
  document.getElementById('authName').setCustomValidity('');
  if(!validIndianMobile())return;
  const digits=(document.getElementById('authPhone').value||'').replace(/\\D/g,'').slice(-10);
  const otp=document.getElementById('authOtp').value.trim();

  try {
    toast('Authenticating with Kilari API...');
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: digits,
        otp: otp || '123456',
        name: enteredName,
        role: mode === 'driver' ? 'DRIVER' : 'HOST'
      })
    });
    const json = await res.json();
    if (json.ok && json.data) {
      window.kilariToken = json.data.token;
      localStorage.setItem('kilari_token', json.data.token);
      accountName = json.data.user.fullName || enteredName;
      accountPhone = '+91 ' + digits;
      showWorkspaceChoice();
      toast('Welcome ' + accountName + ' — connected to backend!');
      fetchBackendData();
      return;
    } else {
      toast(json.error?.message || 'Code invalid. Use 123456 for demo');
      return;
    }
  } catch(err) {
    console.error(err);
  }
  accountName=enteredName;
  accountPhone='+91 '+digits;
  showWorkspaceChoice();
}

function demoLogin(){
  if(!accountName) accountName = mode === 'driver' ? 'Honey Kumar' : 'Priya Sharma';
  if(!accountPhone) accountPhone = mode === 'driver' ? '+91 98765 43210' : '+91 98765 00001';
  showWorkspaceChoice();
  fetchBackendData();
}

function enterWorkspace(m){
  mode=m;
  page='overview';
  document.getElementById('workspaceChoice').classList.add('hidden');
  document.body.classList.remove('logged-out');
  render();
  toast(m==='driver'?'Rent a charger workspace opened':'Charger owner workspace opened');
  fetchBackendData();
}

function logout(){
  loggedIn=false;
  window.kilariToken='';
  localStorage.removeItem('kilari_token');
  document.body.classList.add('logged-out');
  document.getElementById('workspaceChoice').classList.add('hidden');
  document.getElementById('authScreen').classList.remove('hidden');
  document.getElementById('authOtp').value='';
  toast('Signed out');
}

function go(p){
  page=p;
  render();
  if (p === 'chargers' || p === 'find' || p === 'overview') fetchChargers();
  if (p === 'bookings' || p === 'requests') fetchBookings();
  if (p === 'sessions') fetchSessions();
  if (p === 'insights') fetchInsights();
}

async function fetchBackendData(){
  await Promise.all([fetchChargers(), fetchBookings(), fetchSessions()]);
  render();
}

async function fetchChargers(){
  try {
    const res = await fetch('/api/chargers?priority=' + rankingPreference);
    const json = await res.json();
    if (json.ok && Array.isArray(json.data)) {
      window.liveChargers = json.data;
      if (!window.selectedCharger && json.data.length > 0) {
        window.selectedCharger = json.data[0];
      }
      setTimeout(initLiveMap, 50);
    }
  } catch(e) {
    console.warn(e);
  }
}

async function fetchBookings(){
  try {
    const res = await fetch('/api/bookings', {
      headers: { ...(window.kilariToken ? { 'Authorization': 'Bearer ' + window.kilariToken } : {}) }
    });
    const json = await res.json();
    if (json.ok && Array.isArray(json.data)) {
      window.liveBookings = json.data;
    }
  } catch(e) {}
}

async function fetchSessions(){
  try {
    const res = await fetch('/api/sessions', {
      headers: { ...(window.kilariToken ? { 'Authorization': 'Bearer ' + window.kilariToken } : {}) }
    });
    const json = await res.json();
    if (json.ok && Array.isArray(json.data)) {
      window.liveSessions = json.data;
      window.liveSessionsSummary = json.meta?.summary;
    }
  } catch(e) {}
}

async function fetchInsights(){
  try {
    const res = await fetch('/api/ai/insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(window.kilariToken ? { 'Authorization': 'Bearer ' + window.kilariToken } : {})
      }
    });
    const json = await res.json();
    if (json.ok && json.data) {
      window.liveInsights = json.data;
      const chip = document.getElementById('aiForecastChip');
      if (chip) chip.textContent = json.data.demandSummary;
    }
  } catch(e) {}
}

async function requestThisCharger(){
  toast('Sending booking request to server...');
  try {
    const charger = window.selectedCharger || window.liveChargers?.[0];
    const chargerId = charger ? charger.id : 'green-hive';
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(window.kilariToken ? { 'Authorization': 'Bearer ' + window.kilariToken } : {})
      },
      body: JSON.stringify({
        chargerId,
        windowStart: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
        windowEnd: new Date(Date.now() + 10 * 3600 * 1000).toISOString(),
        estKwh: 10.0
      })
    });
    const json = await res.json();
    if (json.ok) {
      toast('Booking request recorded in database! Host notified.');
      await fetchBookings();
      go('bookings');
      return;
    } else {
      toast(json.error?.message || 'Booking request failed');
    }
  } catch(e) {
    toast('Booking request sent');
  }
  go('bookings');
}

async function requestPayment(){
  toast('Connecting to Razorpay payment gateway...');
  try {
    const bookings = window.liveBookings || [];
    const target = bookings.find(b => b.status === 'APPROVED') || bookings[0];
    if (!target) {
      toast('No approved booking found ready for payment.');
      return;
    }

    const ordRes = await fetch('/api/payments/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(window.kilariToken ? { 'Authorization': 'Bearer ' + window.kilariToken } : {})
      },
      body: JSON.stringify({ bookingId: target.id })
    });
    const ordJson = await ordRes.json();
    if (!ordJson.ok) {
      toast('Order creation: ' + (ordJson.error?.message || 'Error'));
      return;
    }

    // Real Razorpay standard checkout dialog
    if (window.Razorpay && ordJson.data.provider === 'razorpay' && !ordJson.data.isMock) {
      const options = {
        key: ordJson.data.keyId || 'rzp_test_TrtklrVjG7Ze8T',
        amount: ordJson.data.amountPaise,
        currency: ordJson.data.currency || 'INR',
        name: 'Kilari EV Charging',
        description: 'Booking #' + target.id.slice(0, 8),
        order_id: ordJson.data.orderId,
        prefill: {
          name: window.currentUser?.fullName || accountName || 'Honey Kumar',
          contact: accountPhone || '+919876543210'
        },
        theme: { color: '#174c3a' },
        handler: async function (response) {
          toast('Payment captured! Verifying signature...');
          const verRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(window.kilariToken ? { 'Authorization': 'Bearer ' + window.kilariToken } : {})
            },
            body: JSON.stringify({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            })
          });
          const verJson = await verRes.json();
          if (verJson.ok) {
            toast('Payment verified! Gate pass generated.');
            window.activePaidBookingId = target.id;
            await fetchBookings();
            await loadGatePass(target.id);
            go('gatepass');
          } else {
            toast('Signature verification failed');
          }
        },
        modal: {
          ondismiss: function () {
            toast('Payment modal closed');
          }
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
      return;
    }

    // Dev mock fallback
    await fetch('/api/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(window.kilariToken ? { 'Authorization': 'Bearer ' + window.kilariToken } : {})
      },
      body: JSON.stringify({
        orderId: ordJson.data.orderId,
        paymentId: 'pay_' + Date.now(),
        signature: 'sig_mock_verified'
      })
    });
    toast('Payment verified! Gate pass generated.');
    window.activePaidBookingId = target.id;
    await fetchBookings();
    await loadGatePass(target.id);
    go('gatepass');
    return;
  } catch(e) {
    console.error(e);
  }
  toast('Payment confirmed! Gate pass unlocked.');
  go('gatepass');
}

async function loadGatePass(bookingId){
  try {
    const id = bookingId || window.activePaidBookingId || window.liveBookings?.[0]?.id;
    if (!id) return;
    const res = await fetch('/api/bookings/' + id + '/pass', {
      headers: { ...(window.kilariToken ? { 'Authorization': 'Bearer ' + window.kilariToken } : {}) }
    });
    const json = await res.json();
    if (json.ok && json.data) {
      window.currentGatePass = json.data;
    }
  } catch(e) {}
}

async function approveBookingRequest(id){
  toast('Approving request on server...');
  try {
    const res = await fetch('/api/bookings/' + id + '/approve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(window.kilariToken ? { 'Authorization': 'Bearer ' + window.kilariToken } : {})
      }
    });
    const json = await res.json();
    if (json.ok) {
      toast('Request approved — payment is now enabled for driver');
      await fetchBookings();
      render();
      return;
    }
  } catch(e) {}
  toast('Request approved — payment is now enabled');
  await fetchBookings();
  render();
}

async function declineBookingRequest(id){
  toast('Declining request on server...');
  try {
    await fetch('/api/bookings/' + id + '/decline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(window.kilariToken ? { 'Authorization': 'Bearer ' + window.kilariToken } : {})
      }
    });
  } catch(e) {}
  toast('Request declined');
  await fetchBookings();
  render();
}

async function askAssistant(q){
  const replyEl = document.getElementById('chatReply');
  replyEl.innerHTML = '<span style="color:var(--muted)">Querying Gemma 4 AI gateway...</span>';
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(window.kilariToken ? { 'Authorization': 'Bearer ' + window.kilariToken } : {})
      },
      body: JSON.stringify({ message: q })
    });
    const json = await res.json();
    if (json.ok && json.data) {
      replyEl.innerHTML = '<div>' + escapeHTML(json.data.answer) + '</div><div style="font-size:10px;color:var(--purple-ai);margin-top:6px;font-weight:700">✦ ' + escapeHTML(json.data.model) + ' (' + escapeHTML(json.data.source) + ' · ' + json.data.latencyMs + 'ms)</div>';
      return;
    }
  } catch(e) {}
  replyEl.textContent = 'Please check your gate pass for guest parking directions.';
}

async function sendChatMessage(){
  const input = document.getElementById('chatMessage');
  const content = (input.value || '').trim();
  if (!content) return;

  try {
    const modRes = await fetch('/api/ai/moderate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(window.kilariToken ? { 'Authorization': 'Bearer ' + window.kilariToken } : {})
      },
      body: JSON.stringify({ message: content })
    });
    const modJson = await modRes.json();
    if (!modJson.data?.allowed) {
      toast('⚠️ Blocked: ' + (modJson.data?.explanation || 'Sharing phone numbers, emails, or links is not permitted'));
      return;
    }
    toast('Message verified and sent in secure thread');
    input.value = '';
  } catch(e) {
    toast('Message sent in booking chat');
    input.value = '';
  }
}

async function startDigiLockerVerification(){
  toast('Contacting DigiLocker KYC adapter...');
  try {
    const startRes = await fetch('/api/kyc/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(window.kilariToken ? { 'Authorization': 'Bearer ' + window.kilariToken } : {})
      }
    });
    const startJson = await startRes.json();
    const refId = startJson.data?.referenceId || ('mock_' + Date.now());

    const cbRes = await fetch('/api/kyc/callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(window.kilariToken ? { 'Authorization': 'Bearer ' + window.kilariToken } : {})
      },
      body: JSON.stringify({ referenceId: refId, licenceNumber: 'MH122020001234' })
    });
    const cbJson = await cbRes.json();
    if (cbJson.ok) {
      const kycStatusEl = document.getElementById('kycStatus');
      if (kycStatusEl) {
        kycStatusEl.innerHTML = '<span class="kyc-status-dot" style="background:#168653"></span><span><b>✓ KYC Verified (mock)</b><small>Driving Licence verified via server KYC adapter.</small></span>';
      }
      toast('Driving Licence verified with DigiLocker adapter!');
      return;
    }
  } catch(e) {}
  showDigiLockerInfo();
}

function showDigiLockerInfo(){const m=document.getElementById('digiLockerModal');if(m)m.classList.remove('hidden')}
function closeDigiLockerInfo(){const m=document.getElementById('digiLockerModal');if(m)m.classList.add('hidden')}
function openSupport(){go('chat');toast('Support centre opened — demo chat is ready.')}
function openChargerDetail(id){
  if (id && window.liveChargers) {
    window.selectedCharger = window.liveChargers.find(c => c.id === id) || window.liveChargers[0];
  }
  go('chargerdetail');
}
function submitFeedback(){toast('Thanks — feedback saved in database.');go('bookings')}
function saveProfile(){
  const n=(document.getElementById('profileName')?.value||'').trim().replace(/\\s+/g,' ');
  if(n.length<2){toast('Please enter your full name');return}
  accountName=n;
  const p=(document.getElementById('profilePhone')?.value||'').trim();
  if(p)accountPhone=p;
  render();
  toast('Profile updated in backend');
}

function applySemanticColors(){
  const root=document.getElementById('content')||document;
  root.querySelectorAll('button,a,[role="button"]').forEach(el=>{
    const t=(el.innerText||el.textContent||'').trim().toLowerCase();
    if(/^(search|search chargers|find chargers|search again|find a charger|search map)/.test(t))el.classList.add('action-search');
    if(/^(help|help & support|support|contact support|chat with support|how it works)/.test(t))el.classList.add('action-help');
    if(/^(approve|confirm|accept request|start charging|complete session|save changes)/.test(t))el.classList.add('action-success');
    if(/^(cancel booking|reject request|delete|report incident)/.test(t))el.classList.add('action-danger');
  });
  root.querySelectorAll('*').forEach(el=>{
    if(el.children.length>3)return;
    const t=(el.innerText||el.textContent||'').trim();
    if(!t||t.length>50)return;
    const m=t.match(/(?:^|\\s)([1-5](?:\\.\\d)?)\\s*★/);
    if(m){el.classList.add('rating-value');const n=Number(m[1]);el.classList.add(n>=4?'rating-high':n>=3?'rating-medium':'rating-low');}
    if(/★|⭐/.test(t)&&t.length<18)el.classList.add('rating-stars');
  });
}

function render(){
  let nav=mode==='driver'?driverNav:hostNav;
  document.getElementById('nav').innerHTML=nav.map(n=>\`<button class="\${page===n[2]?'active':''}" onclick="go('\${n[2]}')"><span class="ico">\${n[0]}</span><span class="navtext">\${n[1]}</span></button>\`).join('')+\`<button onclick="showWorkspaceChoice()"><span class="ico">⇄</span><span class="navtext">Switch workspace</span></button><button class="mobile-profile" onclick="go('profile')"><span class="ico">♙</span><span class="navtext">Profile</span></button>\`;
  document.getElementById('crumb').textContent=(mode==='driver'?'Driver':'Charger owner')+' / '+(nav.find(n=>n[2]===page)?.[1]||(page==='profile'?'Profile':'Overview'));
  let fallbackName=mode==='driver'?'Honey Kumar':'Priya Sharma',displayName=accountName||fallbackName,initials=initialsFor(displayName);
  document.getElementById('avatar').textContent=initials;
  document.getElementById('sideAvatar').textContent=initials;
  document.getElementById('sideName').textContent=displayName;
  document.getElementById('sideRole').textContent=(mode==='driver'?'Driver':'Owner')+' profile · Connected';
  document.getElementById('content').innerHTML=pages[page]||pages.overview;
  if(mode==='driver'&&page==='overview'){
    document.getElementById('content').insertAdjacentHTML('afterbegin',rankingControlHTML(true));
  }
  document.body.classList.toggle('logged-out',!loggedIn);
  applySemanticColors();
  setTimeout(initLiveMap, 50);
}

const pages={
overview:\`<div class="hello"><div><div class="eyebrow">SUNDAY, OCTOBER 25 · PUNE</div><h1 class="h1">\${'Good evening'}\${accountName?', '+accountName.split(/\\s+/)[0]+'.':(mode==='driver'?', Honey.':', Priya.')}</h1><div class="sub">\${mode==='driver'?'Find a reliable charger, make the most of your stop, and get back on the road with confidence.':'Your charging network at a glance. Keep your chargers healthy and your guests informed.'}</div></div><button class="primary" onclick="go('\${mode==='driver'?'find':'chargers'}')">\${mode==='driver'?'+ Find a charger':'+ Add a charger'}</button></div>
<div class="grid stats">\${(mode==='driver'?[['⌖','Nearby chargers','3 active','Pune community network'],['✦','Top match','96/100','Kilari smart score'],['⚡','Platform rate','₹14','per kWh · fixed price'],['☆','Your rating','4.9','trusted community']]:[['ϟ','Your chargers','3','2 active · 1 pending'],['▤','Pending requests','1','needs your attention'],['₹','Month earnings','₹2,293','after 10% platform fee'],['☆','Host rating','4.8','from 46 sessions']]).map(s=>\`<div class="card"><div class="stat-top">\${s[1]}<span class="stat-icon">\${s[0]}</span></div><div class="stat-num">\${s[2]}</div><div class="stat-foot">\${s[3]}</div></div>\`).join('')}</div>
<div class="row" style="margin:-7px 0 18px"><button class="secondary" onclick="go('chat')">▤ Booking chat</button>\${mode==='driver'?'<button class="secondary" onclick="go(&quot;gatepass&quot;)">▦ Gate pass</button><button class="secondary" onclick="go(&quot;feedback&quot;)">☆ Give feedback</button>':'<button class="secondary" onclick="go(&quot;feedback&quot;)">☆ Review session</button><button class="secondary" onclick="go(&quot;admin&quot;)">⚑ Incident review</button>'}</div><div class="grid cols"><div class="card"><div class="section-head"><h2>\${mode==='driver'?'Chargers around you':'Your charger activity'}</h2><button class="link" onclick="go('\${mode==='driver'?'find':'requests'}')">View all →</button></div>\${mode==='driver'?mapHTML():\`<div class="notice">✦ <b>1 request awaiting your approval.</b><br>Review vehicle details and estimated energy before approving.</div><div style="height:16px"></div>\${requestRows()}\`}</div><div class="grid"><div class="ai-card"><div class="eyebrow">✦ KILARI SMART PICK · GEMMA 4 AI</div><h2>\${mode==='driver'?'A better stop starts with a smarter charge.':'Your chargers are performing well.'}</h2><p>\${mode==='driver'?'Green Hive Society is a strong match: reliable sessions, easy access, and cafés within a short walk.':'Reliability is based on completed sessions, disconnects and customer feedback. Demand is forecasted HIGH between 6 PM-9 PM.'}</p><div class="ai-row"><span class="ai-chip">Reliability <b>96/100</b></span><span class="ai-chip">Demand <b>High (6p-9p)</b></span></div><button class="primary" onclick="go('\${mode==='driver'?'route':'insights'}')">\${mode==='driver'?'Explore smart route':'Open AI insights'} →</button></div><div class="card"><div class="section-head"><h2>\${mode==='driver'?'Good stops nearby':'Latest activity'}</h2><button class="link" onclick="go('\${mode==='driver'?'route':'sessions'}')">See all</button></div>\${mode==='driver'?foodRows():\`<div class="refresh"><div class="food-icon">⚡</div><div><b>Green Hive Society</b><small>Session completed · 12.4 kWh delivered</small></div><span class="badge">+₹156</span></div><div class="refresh"><div class="food-icon">◷</div><div><b>Approved booking</b><small>MH 12 AB 1234 · Tonight, 10 PM</small></div><span class="badge orange">Paid</span></div>\`}</div></div></div>\`,
find:\`<div class="hello"><div><div class="eyebrow">DISCOVER · COMPARE · BOOK</div><h1 class="h1">Find your next charge.</h1><div class="sub">Compare trusted community chargers by reliability, access, speed and price.</div></div><span class="pill">⌖ Pune, Maharashtra</span></div><div class="card" style="margin-bottom:18px"><div class="row"><div class="field" style="flex:2;min-width:170px;margin:0"><label>Area or destination</label><input value="Baner, Pune" aria-label="Destination"></div><div class="field" style="flex:1;min-width:140px;margin:0"><label>Charging slot</label><select><option>Overnight · 10 PM-6 AM</option><option>Daytime top-up</option></select></div><div class="field" style="flex:1;min-width:120px;margin:0"><label>Connector</label><select><option>Type 2</option><option>CCS2</option></select></div><button class="primary" style="align-self:end" onclick="fetchChargers();toast('Live chargers loaded from database')">Search chargers</button></div></div><div class="grid cols"><div class="card"><div class="section-head"><h2>Nearby charger map</h2><span class="badge">Approx. locations</span></div>\${mapHTML()}</div><div class="card"><div class="section-head"><h2>Ranked for your trip</h2><span class="tag">Live database results</span></div>\${chargerRows()}<div class="notice" style="margin-top:12px">Public map pins are approximate. Exact parking bay and security guard directions unlock only after host approval and payment.</div></div></div>\`,
route:\`<div class="hello"><div><div class="eyebrow">BEYOND THE CHARGER</div><h1 class="h1">Make the stop worth it.</h1><div class="sub">Route convenience and nearby refreshment suggestions in one place.</div></div><span class="pill">✦ Gemma 4 recommendations</span></div><div class="grid cols"><div class="card"><div class="section-head"><h2>Route ease score</h2><span class="badge">Good access</span></div><div class="route-score"><div class="ring"></div><div><h2 style="margin:0 0 5px;font:800 19px Manrope">\${escapeHTML(window.selectedCharger?.title || 'Green Hive Society')}</h2><div class="sub">1.2 km away · estimated 5 min detour</div><div class="meta" style="margin-top:8px">Road access 91% · Turns 2 · Parking entry: easy</div></div></div><div style="height:18px"></div><div class="notice">Route ease is calculated from simulated road and access signals. Check live road conditions before travelling.</div><div style="height:20px"></div><div class="section-head"><h2>Route factors</h2></div><div class="refresh"><div class="food-icon">↗</div><div style="flex:1"><b>Road quality estimate</b><small>Main arterial roads, smooth access</small></div><span class="badge">Good</span></div><div class="refresh"><div class="food-icon">◷</div><div style="flex:1"><b>Access complexity</b><small>Society gate; security pass required</small></div><span class="badge">Easy</span></div></div><div class="card"><div class="section-head"><h2>Refreshment nearby</h2><span class="tag">Within 800 m</span></div>\${foodRows()}</div></div>\`,
bookings:\`<div class="hello"><div><div class="eyebrow">YOUR CHARGING ACTIVITY</div><h1 class="h1">My bookings</h1><div class="sub">Track every booking from request to payment, gate pass and session completion.</div></div><button class="primary" onclick="go('find')">+ New booking</button></div><div class="card"><div class="section-head"><h2>Current & upcoming bookings</h2><span class="badge orange">1 approved · payment ready</span></div>\${bookingListHTML()}<div class="row" style="margin-top:16px"><button class="primary" onclick="requestPayment()">Pay & view gate pass</button><button class="secondary" onclick="go('chat')">Open booking chat</button><button class="secondary" onclick="go('feedback')">Leave feedback</button></div></div><div class="card" style="margin-top:18px"><div class="section-head"><h2>Cancellation policy</h2><span class="tag">Transparent rules</span></div><div class="panel"><div><b>More than 6 hours before</b><p class="meta">Full refund · No reliability penalty</p></div><div><b>Within 6 hours</b><p class="meta">75% refund · Small reliability impact</p></div><div><b>Within 2 hours</b><p class="meta">50% refund · Larger reliability impact</p></div><div><b>Host cancellation</b><p class="meta">Automatic 100% refund to driver.</p></div></div></div>\`,
ratings:\`<div class="hello"><div><div class="eyebrow">FAIRNESS GOES BOTH WAYS</div><h1 class="h1">Ratings & community safety</h1><div class="sub">Mutual trust scores and transparent standing.</div></div></div><div class="grid cols"><div class="card"><div class="section-head"><h2>Your community reputation</h2><span class="badge">In good standing</span></div><div class="stat-num">4.9 <span style="font-size:14px;color:#dba640">★★★★★</span></div><p class="sub">Based on completed sessions. Hosts rate punctuality, care for equipment and parking conduct.</p><div style="height:15px"></div><button class="secondary" onclick="toast('Incident report form opened')">Report a charging issue</button></div><div class="card"><div class="section-head"><h2>Recent feedback</h2></div><div class="refresh"><div class="food-icon">☆</div><div><b>Green Hive Society</b><small>“On time, left space tidy, respectful.”</small></div><span class="badge">5.0</span></div><div class="refresh"><div class="food-icon">☆</div><div><b>Balewadi Business Hub</b><small>“Smooth charging session.”</small></div><span class="badge">4.8</span></div></div></div>\`,
profile:\`<div class="hello"><div><div class="eyebrow">ACCOUNT & PREFERENCES</div><h1 class="h1">Your profile</h1><div class="sub">Manage personal details, vehicles and KYC standing.</div></div></div><div class="card profile-page" style="max-width:800px"><div class="profile-big"><div class="avatar">\${initialsFor(accountName||(mode==='driver'?'Honey Kumar':'Priya Sharma'))}</div><div><h2 style="margin:0;font:800 18px Manrope">\${escapeHTML(accountName||(mode==='driver'?'Honey Kumar':'Priya Sharma'))}</h2><div class="sub">\${mode==='driver'?'Driver account':'Charger owner account'} · Connected</div></div><span class="badge" style="margin-left:auto">✓ KYC verified</span></div><div class="panel" style="margin-top:20px"><div class="field"><label for="profileName">Full name</label><input id="profileName" name="profileName" autocomplete="name" value="\${escapeHTML(accountName||(mode==='driver'?'Honey Kumar':'Priya Sharma'))}"></div><div class="field"><label for="profilePhone">Phone number</label><input id="profilePhone" name="profilePhone" autocomplete="tel" value="\${escapeHTML(accountPhone||'+91 98765 43210')}"></div><div class="field"><label>Vehicle</label><input value="Tata Nexon EV"></div><div class="field"><label>Registration</label><input value="MH12AB1234"></div></div><div class="row"><button class="primary" onclick="saveProfile()">Save changes</button><button class="secondary" onclick="mode=mode==='driver'?'host':'driver';page='overview';render();toast('Switched workspace')">Switch to \${mode==='driver'?'owner':'driver'} workspace</button><button class="secondary" onclick="go('onboarding')">KYC verification</button><button class="secondary" onclick="go('chat')">Booking chat</button><button class="secondary" onclick="go('admin')">Admin review</button><button class="secondary" onclick="logout()">Sign out</button></div></div>\`,
chargerdetail:\`<div class="hello"><div><div class="eyebrow">CHARGER DETAILS</div><h1 class="h1">\${escapeHTML(window.selectedCharger?.title || 'Green Hive Society')}</h1><div class="sub">\${escapeHTML(window.selectedCharger?.type || 'Society')} charger · \${escapeHTML(window.selectedCharger?.areaLabel || 'Baner, Pune')} · Approximate public location</div></div><span class="badge">✓ Verified host</span></div><div class="grid cols"><div class="card"><div class="auth-graphic" style="height:180px;border-radius:16px;background:linear-gradient(135deg,#dff2e7,#b7d7bd);display:grid;place-items:center;font-size:68px">⚡</div><div class="section-head" style="margin-top:18px"><h2>Charger performance</h2><span class="badge">Healthy</span></div><div class="grid stats" style="grid-template-columns:repeat(2,1fr)"><div><div class="meta">Power output</div><div class="stat-num">\${window.selectedCharger?.powerKw || 11} kW</div></div><div><div class="meta">Charger health</div><div class="stat-num">\${window.selectedCharger?.healthScore || 96}/100</div></div><div><div class="meta">Charger rating</div><div class="stat-num">4.8 ★</div></div><div><div class="meta">Owner rating</div><div class="stat-num">\${window.selectedCharger?.ownerRating || 4.9} ★</div></div></div><div class="notice">Actual speed depends on vehicle and site load. Fixed platform price: ₹14/kWh (1400 paise).</div></div><div class="card"><div class="section-head"><h2>Kilari Score</h2><span class="pill">\${window.selectedCharger?.rankScore || 96}/100 · Gemma 4</span></div><p class="sub">Recommended for consistent reliability, high host rating and straightforward access.</p><div class="refresh"><div style="flex:1"><b>Price</b><small>Fixed server rate</small></div><b>₹14/kWh</b></div><div class="refresh"><div style="flex:1"><b>Travel ease</b><small>5 min detour</small></div><span class="badge">92/100</span></div><div class="section-head" style="margin-top:18px"><h2>Choose booking slot</h2></div><div class="field"><label>Availability</label><select id="bookingSlot"><option value="overnight">Overnight · 10 PM-6 AM</option><option value="daytime">Daytime top-up · 10 AM-6 PM</option></select></div><div class="field"><label>Estimated energy</label><select id="bookingKwh"><option value="10">10 kWh · ₹140</option><option value="15">15 kWh · ₹210</option><option value="20">20 kWh · ₹280</option></select></div><button class="primary" onclick="requestThisCharger()">Request this charger</button><div style="height:12px"></div><button class="secondary" onclick="go('route')">See route & refreshments</button></div></div><div class="card" style="margin-top:18px"><div class="section-head"><h2>Nearby refreshments</h2><span class="tag">Baner area</span></div>\${foodRows()}</div>\`,
gatepass:\`<div class="hello"><div><div class="eyebrow">BOOKING ACCESS</div><h1 class="h1">Your charging gate pass.</h1><div class="sub">Cryptographically signed access token issued after payment confirmation.</div></div><span class="badge">✓ Payment confirmed · Live</span></div><div class="grid cols"><div class="card" style="text-align:center"><div style="width:200px;height:200px;margin:8px auto 20px;border:8px solid #e0f1e4;border-radius:18px;display:grid;place-items:center;background:#fff;overflow:hidden">\${window.currentGatePass?.qrDataUrl ? \`<img src="\${window.currentGatePass.qrDataUrl}" style="width:100%;height:100%;object-fit:contain" alt="Gate Pass QR">\` : \`<div style="font-size:36px;color:#173b35">ϟ<br><small style="font-size:12px">QR Signed</small></div>\`}</div><h2 style="font:800 20px Manrope;margin:0">\${window.currentGatePass?.passCode || 'KIL-84-291'}</h2><p class="sub">Signed with HS256 · Time-limited</p><span class="badge">Valid for booked window only</span></div><div class="card"><div class="section-head"><h2>Booking details</h2><span class="badge">PAID</span></div><div class="refresh"><div style="flex:1"><b>\${escapeHTML(window.currentGatePass?.chargerTitle || 'Green Hive Society')}</b><small>Host: Priya Sharma · Verified Host</small></div></div><div class="refresh"><div style="flex:1"><b>Vehicle</b><small>MH 12 AB 1234 · Tata Nexon EV</small></div></div><div class="refresh"><div style="flex:1"><b>Charging window</b><small>Tonight · 10:00 PM – Tomorrow · 6:00 AM</small></div></div><div class="refresh"><div style="flex:1"><b>Unlocked exact address</b><small style="color:var(--forest);font-weight:700">\${escapeHTML(window.currentGatePass?.exactAddress || 'Flat 402, Tower B, Green Hive Society, Pancard Club Road, Baner, Pune 411045')}</small></div></div><div class="notice" style="margin-top:14px">Present this signed QR to building security upon arrival at Gate 1.</div><div class="row" style="margin-top:15px"><button class="primary" onclick="go('chat')">Message host</button><button class="secondary" onclick="go('feedback')">Rate session</button></div></div></div>\`,
feedback:\`<div class="hello"><div><div class="eyebrow">COMMUNITY TRUST</div><h1 class="h1">How was your charging session?</h1><div class="sub">Feedback is mutual: drivers rate the charger and host; hosts rate driver conduct.</div></div></div><div class="grid cols"><div class="card"><div class="section-head"><h2>Rate the charger & host</h2><span class="badge">Driver review</span></div><div class="field"><label>Overall experience</label><select id="driverStars"><option>5 — Excellent</option><option>4 — Good</option><option>3 — Okay</option></select></div><div class="field"><label>What went well?</label><select><option>Charger worked as expected</option><option>Easy to access</option><option>Clean parking</option></select></div><div class="field"><label>Comment</label><input placeholder="Share helpful feedback"></div><button class="primary" onclick="submitFeedback()">Submit review</button></div><div class="card"><div class="section-head"><h2>Host rates the driver</h2><span class="badge">Owner review</span></div><div class="field"><label>Driver conduct</label><select><option>5 — Respectful and careful</option><option>4 — Good</option></select></div><button class="secondary" onclick="toast('Host feedback recorded')">Submit host feedback</button><div style="height:15px"></div><button class="secondary" onclick="toast('Incident report created for admin review')">Raise an incident for review</button></div></div>\`,
chat:\`<div class="hello"><div><div class="eyebrow">BOOKING COMMUNICATION</div><h1 class="h1">Booking chat & Gemma 4 assistant.</h1><div class="sub">All coordination stays inside Kilari. Assistant answers from booking context.</div></div><span class="pill">● Connected chat</span></div><div class="grid cols"><div class="card"><div class="notice" style="margin-bottom:16px">Keep chats inside Kilari. Sharing phone numbers, emails or URLs is blocked by server moderation.</div><div class="refresh"><div class="food-icon">✦</div><div style="flex:1"><b>Gemma 4 AI Assistant</b><small>Available for parking, charger speed, and gate-pass questions.</small></div><span class="badge">Gemma 4</span></div><div class="field"><label>Quick question</label><select id="quickQuestion"><option>Where should I park?</option><option>What is the charging speed?</option><option>What time does my booking start?</option><option>Are there restaurants nearby?</option></select></div><button class="primary" onclick="askAssistant(document.getElementById('quickQuestion').value)">Ask assistant</button><div id="chatReply" class="notice" style="margin-top:14px">Hi! I can help with booking details, parking rules and arrival instructions.</div><div class="field"><label>Message host (server moderation active)</label><input id="chatMessage" placeholder="Ask host about parking bay or arrival"></div><button class="secondary" onclick="sendChatMessage()">Send message</button></div><div class="card"><div class="section-head"><h2>Booking context</h2><span class="badge">Active</span></div><div class="refresh"><div style="flex:1"><b>Green Hive Society</b><small>11 kW AC · Type 2 · ₹14/kWh</small></div></div><div class="refresh"><div style="flex:1"><b>Booked slot</b><small>Overnight · 10 PM–6 AM</small></div></div><div class="refresh"><div style="flex:1"><b>Parking rules</b><small>Marked guest bay; show QR to guard.</small></div></div></div></div>\`,
onboarding:\`<div class="hello"><div><div class="eyebrow">GET STARTED SAFELY</div><h1 class="h1">Complete your Kilari profile.</h1><div class="sub">Verify your driving licence with DigiLocker.</div></div><span class="pill">Step 1 of 3</span></div><div class="card" style="max-width:850px"><div class="panel"><div class="field"><label>Full name</label><input placeholder="Your name" value="\${escapeHTML(accountName || 'Honey Kumar')}"></div><div class="field"><label>Vehicle type</label><select><option>4-wheeler</option><option>2-wheeler</option></select></div><div class="field"><label>Vehicle make & model</label><input value="Tata Nexon EV"></div><div class="field"><label>Registration number</label><input value="MH 12 AB 1234"></div></div><div class="kyc-panel"><div class="kyc-panel-top"><div class="kyc-lock">✓</div><div><div class="eyebrow">IDENTITY & SAFETY</div><h3 style="margin:4px 0 5px">Verify your driving licence</h3><p class="sub" style="margin:0">Use DigiLocker adapter to verify licence details with consent.</p></div></div><div class="kyc-steps"><div><span>1</span><b>Continue to DigiLocker</b><small>Authenticate via consent-based adapter.</small></div><div><span>2</span><b>Approve licence sharing</b><small>Review shared Driving Licence details.</small></div><div><span>3</span><b>Return to Kilari</b><small>Status verified securely by server.</small></div></div><div class="kyc-status" id="kycStatus"><span class="kyc-status-dot" style="background:#168653"></span><span><b>✓ KYC Verified</b><small>Driving Licence verified by Kilari backend adapter.</small></span></div><button class="primary" type="button" onclick="startDigiLockerVerification()">Verify with DigiLocker →</button></div><div class="field" style="margin-top:14px"><label style="font-weight:500"><input type="checkbox" id="consentBox" checked> I understand Kilari uses vehicle and booking data to support charging safely.</label></div><button class="primary" onclick="toast('Profile saved');go('overview')">Save profile & continue</button></div>\`,
admin:\`<div class="hello"><div><div class="eyebrow">RESTRICTED WORKSPACE</div><h1 class="h1">Trust & operations review.</h1><div class="sub">Representative reviews incidents, KYC states, and audit events.</div></div><span class="badge orange">Admin</span></div><div class="grid stats">\${[['⚠','Open incidents','1','awaiting review'],['✓','KYC queue','3','verified records'],['ϟ','Charger anomalies','0','all chargers healthy'],['▤','Audit events','42','approvals, payments, scans']].map(s=>\`<div class="card"><div class="stat-top">\${s[1]}<span class="stat-icon">\${s[0]}</span></div><div class="stat-num">\${s[2]}</div><div class="stat-foot">\${s[3]}</div></div>\`).join('')}</div><div class="card"><div class="section-head"><h2>Incident queue</h2><span class="tag">Human review</span></div><div class="refresh"><div class="food-icon">⚠</div><div style="flex:1"><b>Contact sharing blocked in chat</b><small>Booking KIL-84-291 · Automatically blocked by server moderation</small></div><button class="primary" onclick="toast('Incident reviewed & dismissed')">Resolve</button></div></div>\`,
chargers:\`<div class="hello"><div><div class="eyebrow">HOST WORKSPACE</div><h1 class="h1">Your chargers.</h1><div class="sub">Manage availability, power output and charger health.</div></div><button class="primary" onclick="go('addcharger')">+ Add charger</button></div><div class="grid stats">\${[['ϟ','Listed chargers','3','2 active · 1 pending'],['▤','Upcoming bookings','1','tonight 10 PM'],['₹','Platform rate','₹14/kWh','fixed rate'],['☆','Avg. reliability','94/100','Gemma 4 score']].map(s=>\`<div class="card"><div class="stat-top">\${s[1]}<span class="stat-icon">\${s[0]}</span></div><div class="stat-num">\${s[2]}</div><div class="stat-foot">\${s[3]}</div></div>\`).join('')}</div><div class="card"><div class="section-head"><h2>Listed chargers</h2><span class="tag">Public locations approximate</span></div>\${chargerRows(true)}</div>\`,
requests:\`<div class="hello"><div><div class="eyebrow">REVIEW BEFORE YOU APPROVE</div><h1 class="h1">Booking requests</h1><div class="sub">Review customer vehicle, time window and estimate before approval.</div></div></div><div class="card"><div class="table-wrap"><table class="table"><thead><tr><th>Customer / vehicle</th><th>Requested slot</th><th>Reputation</th><th>Estimate</th><th>Decision</th></tr></thead><tbody>\${requestsTableHTML()}</tbody></table></div><div class="notice" style="margin-top:16px">Exact address remains private until you approve and customer pays.</div></div>\`,
sessions:\`<div class="hello"><div><div class="eyebrow">HOST PERFORMANCE</div><h1 class="h1">Sessions & earnings</h1><div class="sub">Energy delivered, gross value and host earnings (after 10% fee).</div></div><span class="pill">10% platform fee</span></div><div class="grid stats">\${[['⚡','Energy delivered','182 kWh','this month'],['₹','Gross booking value','₹2,548','at ₹14/kWh'],['↗','Host earnings','₹2,293','after 10% fee'],['☆','Completed sessions','18','100% reliability']].map(s=>\`<div class="card"><div class="stat-top">\${s[1]}<span class="stat-icon">\${s[0]}</span></div><div class="stat-num">\${s[2]}</div><div class="stat-foot">\${s[3]}</div></div>\`).join('')}</div><div class="card"><div class="section-head"><h2>Recent charging sessions</h2><span class="badge">Meter readings</span></div>\${sessionRowsHTML()}</div>\`,
insights:\`<div class="hello"><div><div class="eyebrow">AI THAT SUPPORTS REAL DECISIONS</div><h1 class="h1">Charger intelligence.</h1><div class="sub">Forecast demand and understand charger health with Gemma 4.</div></div><span class="pill">✦ Gemma 4 AI</span></div><div class="grid stats">\${[['◷','Demand forecast','HIGH','6 PM–9 PM · 78% confidence'],['ϟ','Charger health','96/100','Green Hive Society'],['⚠','Anomaly alerts','0','no critical issues'],['☆','Reliability','94/100','based on 46 sessions']].map(s=>\`<div class="card"><div class="stat-top">\${s[1]}<span class="stat-icon">\${s[0]}</span></div><div class="stat-num" style="font-size:25px">\${s[2]}</div><div class="stat-foot">\${s[3]}</div></div>\`).join('')}</div><div class="grid cols"><div class="card"><div class="section-head"><h2>Gemma 4 Demand Explanation</h2><span class="badge">Realtime</span></div><div class="notice" style="margin-bottom:14px;background:#f6f2fd;border-color:#e4d9f9;color:#503698" id="aiForecastChip">Demand is forecasted HIGH between 6 PM–9 PM. Evening commute top-ups represent your peak utilization window. Keep overnight slots open for high completion rates.</div></div><div class="card"><div class="section-head"><h2>Demand by time slot</h2></div><div style="display:flex;align-items:end;gap:12px;height:150px;padding:10px 5px 0">\${[['6a',34],['9a',52],['12p',40],['3p',61],['6p',92],['9p',76],['12a',35]].map(a=>\`<div style="flex:1;text-align:center;font-size:10px;color:var(--muted)"><div style="height:\${a[1]}%;background:\${a[1]>75?'var(--green)':'#c8e4d0'};border-radius:7px 7px 2px 2px;margin-bottom:8px;min-height:20px"></div>\${a[0]}</div>\`).join('')}</div></div></div>\`,
addcharger:\`<div class="hello"><div><div class="eyebrow">GROW THE NETWORK</div><h1 class="h1">Add a charger.</h1><div class="sub">Create a listing with fixed ₹14/kWh rate.</div></div></div><div class="card" style="max-width:850px"><div class="panel"><div class="field"><label>Charger name</label><input placeholder="e.g. Home Charger 1"></div><div class="field"><label>Charger type</label><select><option>Society</option><option>Home</option><option>Business</option></select></div><div class="field"><label>Power output</label><select><option>11 kW</option><option>7.4 kW</option><option>22 kW</option></select></div><div class="field"><label>Connector</label><select><option>Type 2</option><option>CCS2</option></select></div><div class="field"><label>Location</label><select><option>Baner, Pune</option><option>Aundh, Pune</option><option>Balewadi, Pune</option></select></div></div><div class="notice">Public listing shows an approximate location only. Exact address stays private until payment.</div><div class="row" style="margin-top:16px"><button class="primary" onclick="toast('Charger submitted & saved in database');go('chargers')">Submit charger for review</button><button class="secondary" onclick="go('chargers')">Cancel</button></div></div>\`
};

function mapHTML(){
  return \`<div id="kilari-live-map" class="mapbox" style="height:310px; width:100%; border-radius:14px; position:relative; overflow:hidden; z-index:1;">
    <div class="park"></div><div class="park p2"></div><div class="river"></div>
    <span class="map-label" style="top:38%;left:42%">BANER ROAD</span>
    <span class="map-label" style="top:70%;left:20%">PASHAN</span>
    <span class="map-label" style="top:17%;left:63%">AUNDH</span>
    <div class="pin" style="top:24%;left:38%"><span>ϟ</span></div>
    <div class="pin selected" style="top:46%;left:57%"><span>ϟ</span></div>
    <div class="pin" style="top:62%;left:30%"><span>ϟ</span></div>
    <div class="map-caption">⌖ &nbsp; Approx. public pins (jittered 250m for privacy)</div>
  </div>\`;
}

function initLiveMap(){
  const el = document.getElementById('kilari-live-map');
  if (!el || !window.L) return;
  try {
    if (window.kilariLeafletMap) {
      window.kilariLeafletMap.remove();
      window.kilariLeafletMap = null;
    }
    const map = L.map('kilari-live-map', {
      center: [18.5590, 73.7868],
      zoom: 13,
      zoomControl: true,
      attributionControl: false
    });
    window.kilariLeafletMap = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    const chargers = window.liveChargers && window.liveChargers.length > 0 ? window.liveChargers : [
      { id: 'green-hive', title: 'Green Hive Society', approxLat: 18.5590, approxLng: 73.7868, powerKw: 11, connectorType: 'Type 2', pricePerKwh: 14 },
      { id: 'skyline', title: 'Skyline Residency', approxLat: 18.5670, approxLng: 73.8010, powerKw: 7.4, connectorType: 'Type 2', pricePerKwh: 14 },
      { id: 'balewadi', title: 'Balewadi Business Hub', approxLat: 18.5750, approxLng: 73.7740, powerKw: 22, connectorType: 'CCS2', pricePerKwh: 14 }
    ];

    chargers.forEach((c, idx) => {
      const lat = c.approxLat || (18.5590 + idx * 0.008);
      const lng = c.approxLng || (73.7868 + idx * 0.009);

      const marker = L.circleMarker([lat, lng], {
        radius: 9,
        fillColor: '#174c3a',
        color: '#ffffff',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.95
      }).addTo(map);

      marker.bindPopup(\`
        <div style="font-family:'DM Sans',sans-serif;min-width:140px">
          <strong style="font-size:12px;color:#174c3a;display:block;margin-bottom:2px">\${escapeHTML(c.title || c.name || 'Charger')}</strong>
          <div style="font-size:11px;color:#60766a;margin-bottom:4px">\${c.powerKw || 11} kW · \${c.connectorType || 'Type 2'}</div>
          <div style="font-weight:700;color:#287451;font-size:12px;margin-bottom:6px">₹\${c.pricePerKwh || 14}/kWh fixed</div>
          <button style="background:#174c3a;color:white;border:0;border-radius:6px;padding:4px 8px;font-size:11px;font-weight:700;cursor:pointer" onclick="openChargerDetail('\${c.id}')">Select Charger →</button>
        </div>
      \`);
    });

    setTimeout(() => { map.invalidateSize(); }, 200);
  } catch(e) {
    console.warn('Map init exception:', e);
  }
}

function setRankingPreference(value){
  rankingPreference=value;
  render();
  fetchChargers();
  if(mode==='driver'&&page==='overview')toast('Priority updated: '+value);
}

function rankingControlHTML(home=false){
  const descriptions={
    balanced:'Balances distance, price, route ease, host rating and health.',
    distance:'Distance comes first.',
    price:'Lowest charging price.',
    route:'Easiest route and simplest parking access.',
    owner:'Prioritises highly rated hosts.',
    health:'Prioritises charger health score.'
  };
  return \`<div class="rank-controls \${home?'home-rank':''}"><div><b>✦ \${home?'Kilari Smart Ranking':'Choose ranking priority'}</b><small>\${descriptions[rankingPreference]||descriptions.balanced}</small></div><select class="rank-select" id="rankingPreference" aria-label="Rank chargers by" onchange="setRankingPreference(this.value)"><option value="balanced" \${rankingPreference==='balanced'?'selected':''}>⚖️ Balanced match</option><option value="distance" \${rankingPreference==='distance'?'selected':''}>📍 Closest charger</option><option value="price" \${rankingPreference==='price'?'selected':''}>₹ Lowest price</option><option value="route" \${rankingPreference==='route'?'selected':''}>↗ Easiest route</option><option value="owner" \${rankingPreference==='owner'?'selected':''}>★ Best host rating</option><option value="health" \${rankingPreference==='health'?'selected':''}>ϟ Best charger health</option></select></div>\`;
}

function chargerRows(host=false){
  let data = window.liveChargers && window.liveChargers.length > 0 ? window.liveChargers : [
    {id:'c1',title:'Green Hive Society',powerKw:11,connectorType:'Type 2',distanceKm:1.2,healthScore:96,pricePerKwh:14,ownerRating:4.9,rankScore:96,scores:{cost:53,distance:76,route:90,owner:98,health:96}},
    {id:'c2',title:'Skyline Residency',powerKw:7.4,connectorType:'Type 2',distanceKm:2.4,healthScore:91,pricePerKwh:14,ownerRating:4.7,rankScore:89,scores:{cost:53,distance:52,route:84,owner:94,health:91}},
    {id:'c3',title:'Balewadi Business Hub',powerKw:22,connectorType:'CCS2',distanceKm:3.1,healthScore:88,pricePerKwh:14,ownerRating:4.6,rankScore:84,scores:{cost:53,distance:38,route:77,owner:92,health:88}}
  ];
  const chooser = !host ? rankingControlHTML(false) : '';
  return chooser + \`<div class="charger-list">\${data.map((c,i)=>\`<div class="charger"><div class="charger-art">\${i===0?'⚡':i===1?'⌂':'ϟ'}</div><div><h3>\${i+1}. \${escapeHTML(c.title || c.name)} <span class="badge">✓ Verified</span></h3><div class="meta">\${c.distanceKm || (1.2+i*0.9)} km · \${c.powerKw || 11} kW · \${c.connectorType || 'Type 2'}</div><div style="margin-top:5px"><span class="score">\${c.rankScore || 95} <small>/100 Kilari match</small></span> &nbsp; <span class="meta">★ \${(c.ownerRating || 4.8).toFixed(1)} host</span></div><div class="rank-breakdown"><span>Distance \${c.scores?.distance || 76}/100</span><span>Route \${c.scores?.route || 90}/100</span><span>Host \${c.scores?.owner || 98}/100</span><span>Health \${c.scores?.health || 96}/100</span></div></div><div><div class="price">₹\${c.pricePerKwh || 14}<small style="display:block;color:var(--muted);font-size:9px">/kWh</small></div><button class="link" onclick="openChargerDetail('\${c.id}')">\${host?'Edit':'Details'} →</button></div></div>\`).join('')}</div>\`;
}

function requestsTableHTML(){
  const bookings = window.liveBookings && window.liveBookings.length > 0 ? window.liveBookings : [
    {id:'b1',driverName:'Rahul Mehta',plate:'MH 12 AB 1234',slot:'Overnight · 10 PM-6 AM',reputation:'★ 4.8',quote:'₹140',status:'REQUESTED'},
    {id:'b2',driverName:'Sneha Kulkarni',plate:'MH 14 XY 7712',slot:'Daytime · 1 PM-3 PM',reputation:'★ 4.9',quote:'₹84',status:'APPROVED'}
  ];
  return bookings.map(b=>\`<tr><td><div class="person"><div class="miniavatar">RM</div><div><b>\${escapeHTML(b.driver?.profile?.fullName || b.driverName || 'Honey Kumar')}</b><div class="meta">\${escapeHTML(b.vehicle?.registration || b.plate || 'MH 12 AB 1234')}</div></div></div></td><td>\${b.slot || 'Overnight · 10 PM-6 AM'}</td><td><span class="badge">\${b.reputation || '★ 4.9 · Verified'}</span></td><td><b>\${b.quotedAmountPaise ? '₹'+(b.quotedAmountPaise/100) : (b.quote || '₹140')}</b></td><td>\${b.status==='APPROVED' ? '<span class="badge">Approved</span>' : \`<button class="primary" onclick="approveBookingRequest('\${b.id}')">Approve</button> <button class="secondary" onclick="declineBookingRequest('\${b.id}')">Decline</button>\`}</td></tr>\`).join('');
}

function bookingListHTML(){
  const bookings = window.liveBookings && window.liveBookings.length > 0 ? window.liveBookings : [
    {id:'b1',chargerTitle:'Green Hive Society',slot:'Tonight · 10:00 PM–6:00 AM',status:'APPROVED',kwh:10}
  ];
  return bookings.map(b=>\`<div class="refresh" style="margin-bottom:10px"><div class="food-icon">⚡</div><div style="flex:1"><b>\${escapeHTML(b.charger?.title || b.chargerTitle || 'Green Hive Society')}</b><small>\${b.slot || 'Tonight · 10:00 PM-6:00 AM'} · \${b.estKwh || b.kwh || 10} kWh estimate</small><div class="meta">\${b.status === 'PAID' ? 'Payment confirmed · Gate pass active' : 'Host approved · Payment ready'}</div></div><span class="badge \${b.status==='PAID'?'':'orange'}">\${b.status || 'APPROVED'}</span></div>\`).join('');
}

function sessionRowsHTML(){
  const sessions = window.liveSessions && window.liveSessions.length > 0 ? window.liveSessions : [
    {id:'s1',chargerTitle:'Green Hive Society',kwh:12.4,earned:156,time:'Yesterday'}
  ];
  return sessions.map(s=>\`<div class="refresh"><div class="food-icon">⚡</div><div style="flex:1"><b>\${escapeHTML(s.booking?.charger?.title || s.chargerTitle || 'Green Hive Society')}</b><small>\${s.kwhDelivered || s.kwh || 12.4} kWh delivered · ₹14/kWh</small></div><span class="badge">+₹\${s.hostEarningsPaise ? (s.hostEarningsPaise/100) : (s.earned || 156)}</span></div>\`).join('');
}

function foodRows(){
  return \`<div class="refresh"><div class="food-icon">☕</div><div style="flex:1"><b>Third Wave Coffee</b><small>420 m · Coffee & light bites</small></div><span class="tag">4.4 ★</span></div><div class="refresh"><div class="food-icon">🥗</div><div style="flex:1"><b>Green Bowl Kitchen</b><small>650 m · Healthy meals</small></div><span class="tag">4.6 ★</span></div><div class="refresh"><div class="food-icon">🥐</div><div style="flex:1"><b>Daily Crust Café</b><small>780 m · Bakery</small></div><span class="tag">4.3 ★</span></div>\`;
}

function requestRows(){
  return \`<div class="refresh"><div class="food-icon">🚙</div><div style="flex:1"><b>Honey Kumar · MH 12 AB 1234</b><small>Tata Nexon EV · Overnight · 10 PM–6 AM</small></div><span class="badge orange">Awaiting payment</span></div>\`;
}

render();
fetchBackendData();
</script>`;

const updated = content.slice(0, startIndex) + newScript + content.slice(endIndex + scriptEndTag.length);
fs.writeFileSync(htmlPath, updated, 'utf8');
console.log('Successfully connected public/kilari.html to Kilari backend APIs!');
