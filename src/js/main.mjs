import { showSkeleton, hideSkeleton } from './skeleton.mjs';

 // [APP]
let userDefault = 'Anonymous User';
const API="http://localhost:8080";
let ws;
let wsConnectionId = null; // ID de conexión WebSocket
let sortDefault = 'Title-desc'
let loadInitFinish = false
let notificationDocumentsAdded = 0

let documentsArray = []
let documents = new Proxy(documentsArray, {
  set(target, property, value) {
    target[property] = value;
    if (property !== 'length') {
      onDocumentsChange(target, property, value);
    }
    return true;
  }
});
function onDocumentsChange(array, property, value) {
  addItemToList(value)
  addItemToGrid(value)
  
  if (loadInitFinish && property !== 'length' && typeof property === 'string' && !isNaN(property)) {
    notificationDocumentsAdded++
    showNotification();
  }
}

function showNotification() {
  const notificationAdvise = document.getElementById('Notification');
  const newDocs = document.getElementById('notification-count');
  newDocs.textContent = notificationDocumentsAdded
  if(notificationAdvise.hidden){
    notificationAdvise.hidden = false
    setTimeout(() => {  
      notificationAdvise.hidden = true
    }, 5000)
  }
}
 
function connectWS(){
  ws = new WebSocket("ws://localhost:8080/notifications");
  ws.addEventListener("open", wsOpenMethod)
  ws.addEventListener("message", receiveMessage)
  ws.addEventListener("close", wsCloseMethod)
  ws.addEventListener("error", wsErrorMethod)
}
function wsOpenMethod () { 
  console.log(`[WS] connected`)
  wsConnectionId = null; // Reset ID al conectar
}
function wsCloseMethod () {
  console.log(`[WS] disconnected. Reconnecting in 3s...`)
  wsConnectionId = null; // Clear ID al desconectar
  setTimeout(connectWS, 3000)
}
function wsErrorMethod (err) {
  console.error("[WS] error:", err) 
  wsConnectionId = null; // Clear ID en error
  ws.close()
}
function receiveMessage(evt) {
  console.log(`[ws] receive message: `, evt)
  if (evt.isTrusted && evt.type === "message") {
    const message = JSON.parse(evt.data);
    
    // Verificar si es un mensaje de conexión con ID
    if (message.type === "connection" && message.connectionId) {
      wsConnectionId = message.connectionId;
      console.log(`[WS] Connection ID received: ${wsConnectionId}`);
      return;
    }
    
    // Si es un nuevo documento, agregarlo
    if (message.type === "document.created" || !message.type) {
      const newItem = message.payload || message;
      documents.push(newItem);
    }
  }
}

function processItem(item) {
  // console.log("Normalize item: ", item)
  return {
    title: item.Title || item.DocumentTitle || "not title",
    contributors: item.Contributors ?? [item.UserName] ?? [],
    attachments: item.Attachments ?? [],
    version: item.Version ?? "--"
  }
}
function renderItem(item) {
  const row = document.createElement('div');
  row.className = 'tr';
  row.setAttribute('role', 'row');

  // title
  const c1 = document.createElement('div');
  c1.className = 'td td--name';
  c1.setAttribute('role', 'cell');
  const c1sub1 = document.createElement('div')
  c1sub1.title = item.title
  c1sub1.textContent = item.title
  const c1sub2 = document.createElement('div')
  c1sub2.className = 'td--description';
  c1sub2.textContent = `Version ${item.version}`
  c1.append(c1sub1, c1sub2)

  // contributors
  const c2 = document.createElement('div');
  c2.className = 'td td--contributors';
  c2.setAttribute('role', 'cell');

  item.contributors?.forEach(cntrb => {
    const contributor = document.createElement('div');
    contributor.textContent = `${cntrb.Name}`;
    c2.append(contributor);
  })

  // attachments
  const c3 = document.createElement('div');
  c3.className = 'td td--attachments';
  c3.setAttribute('role', 'cell');
  item.attachments.forEach(attch => {
    const attachment = document.createElement('div');
    attachment.textContent = `${attch}`
    c3.append(attachment);
  })
 
 row.append(c1, c2, c3);
 return row
}

function addItemToList(itemData) {
  const item = processItem(itemData)
  const row = renderItem(item)
  const tbody = document.getElementById('tbody-items');
  if (tbody.firstChild) tbody.insertBefore(row, tbody.firstChild);
  else tbody.appendChild(row);
}
function addItemToGrid (itemData) {
  const item = processItem(itemData)
  const tbody = document.getElementById('grid');
  const card = renderCard(item)
  tbody.prepend(card)
}

// GRID
function renderCard(item) {
  const card=document.createElement('div'); card.className='card';

  // Title
  const containerTop=document.createElement('div');
  const title=document.createElement('div'); 
  title.className='card-title';
  title.textContent=item.title;

  const version = document.createElement('div')
  version.className='card-version';
  version.title = item.version
  version.textContent=`Version ${item.version}`

  containerTop.append(title, version)

  // Contributors
  const contributors = document.createElement('div')
  item.contributors?.forEach(cntrb => {
    const contributor = document.createElement('div');
    contributor.textContent = `${cntrb.Name}`;
    contributors.append(contributor);
  })
  contributors.className='card-contributors';

  // Attachments
  const attachments = document.createElement('div');
  item.attachments.forEach(attch => {
    const attachment = document.createElement('div');
    attachment.textContent = `${attch}`
    attachments.append(attachment);
  })
  attachments.className='card-attachments';
  card.append(containerTop,contributors,attachments);
  return card;
}

// Initial Load
async function loadInit() {
  showSkeleton(5)
  try {
    const data = await fetch(`${API}/documents`)
    const documentList = await data.json()
    document.getElementById("tbody-items").innerHTML=""
    document.getElementById('grid').innerHTML=""
    documents.length = 0;
    documentList.forEach(item => documents.push(item));
  } catch (err) { 
    console.error("Error loading initial data:", err)
  } finally {
    hideSkeleton();
  }
}
async function createItem() {
  try {
    const title = `userDefault's document ${new Date().toISOString()}`
    const response = await fetch(`${API}/documents`,{
      method: 'POST',
      headers: {"Content-type": "application/json"},
      body: JSON.stringify({Title: title})
    })
    if(!response.ok) {
      const errorT = await response.text()
      throw new Error(errorT)
    }
  } catch(err) {
    console.error(`Error al crear el item: `, err)
  }
}

function filterItems(title) {
  // [TODO]
  console.log(`Filtering items with title: ${title}`)
}

function setView(mode = 'List'){
  const viewList = document.getElementById('view-list')
  const viewGrid = document.getElementById('view-grid')
  const isList = mode==='list';
  viewList.hidden = !isList;
  viewGrid.hidden = isList;
}

function sortChange(sortValue = sortDefault) {
  loadInitFinish = false
  document.getElementById("tbody-items").innerHTML=""
  document.getElementById('grid').innerHTML=""
  documents.sort((a, b) => {
    let vA, vB;
    switch (sortValue.split('-')[0]) {
      case 'Title':
        vA = a.Title.toLowerCase();
        vB = b.Title.toLowerCase();
        break;
      case 'Version':
        vA = a.Version;
        vB = b.Version;
        break;
      case 'Creation':
        vA = new Date(a.CreatedAt);
        vB = new Date(b.CreatedAt);
        break;
      default:
        return 0;
    }
    if (vA < vB) return sortValue.endsWith('asc') ? -1 : 1;
    if (vA > vB) return sortValue.endsWith('asc') ? 1 : -1;
    return 0;
  });
  loadInitFinish = true
} 


document.addEventListener("DOMContentLoaded", async () => {
  const btnList = document.getElementById('btnList')
  const btnGrid = document.getElementById('btnGrid')

  btnList.addEventListener('click',()=>setView('list'));
  btnGrid.addEventListener('click',()=>setView('grid'));

  const sortSelect = document.getElementById('sortSelect')
  sortSelect.addEventListener('change', (e) => {
    sortChange(e.target.value)
  })

  await loadInit()
  loadInitFinish = true
  connectWS()
})