const canvas = document.getElementById('canvas');
const addNodeBtn = document.getElementById('addNodeBtn');
const connectBtn = document.getElementById('connectBtn');
const saveBtn = document.getElementById('saveBtn');
const loadBtn = document.getElementById('loadBtn');
const clearBtn = document.getElementById('clearBtn');

let nodes = [];
let connections = [];
let selectedNode = null;
let connectMode = false;

addNodeBtn.onclick = () => {
  const node = document.createElement('div');
  node.className = 'node';
  node.style.top = '100px';
  node.style.left = '100px';

  const textarea = document.createElement('textarea');
  textarea.placeholder = "Your idea...";
  node.appendChild(textarea);

  makeDraggable(node);

  node.oncontextmenu = (e) => {
    e.preventDefault();
    canvas.removeChild(node);
    nodes = nodes.filter(n => n !== node);
    connections = connections.filter(conn => conn.from !== node && conn.to !== node);
    drawConnections();
  };

  node.onclick = () => {
    if (!connectMode) return;
    if (!selectedNode) {
      selectedNode = node;
      node.style.border = "2px dashed #00ffe0";
    } else {
      if (selectedNode !== node) {
        connections.push({ from: selectedNode, to: node });
        drawConnections();
      }
      selectedNode.style.border = "none";
      selectedNode = null;
    }
  };

  canvas.appendChild(node);
  nodes.push(node);
};

function makeDraggable(elm) {
  let offsetX = 0, offsetY = 0, isDown = false;

  elm.onmousedown = function(e) {
    if (e.target.tagName === "TEXTAREA") return;
    isDown = true;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
    document.onmousemove = function(e) {
      if (!isDown) return;
      elm.style.left = (e.pageX - offsetX) + 'px';
      elm.style.top = (e.pageY - offsetY) + 'px';
      drawConnections();
    };
    document.onmouseup = function() {
      isDown = false;
      document.onmousemove = null;
    };
  };
}

function drawConnections() {
  document.querySelectorAll(".line").forEach(line => line.remove());
  connections.forEach(conn => {
    const rect1 = conn.from.getBoundingClientRect();
    const rect2 = conn.to.getBoundingClientRect();
    const x1 = rect1.left + rect1.width / 2;
    const y1 = rect1.top + rect1.height / 2;
    const x2 = rect2.left + rect2.width / 2;
    const y2 = rect2.top + rect2.height / 2;
    const length = Math.hypot(x2 - x1, y2 - y1);
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    const line = document.createElement("div");
    line.className = "line";
    line.style.width = length + "px";
    line.style.left = x1 + "px";
    line.style.top = y1 + "px";
    line.style.transform = `rotate(${angle}deg)`;
    canvas.appendChild(line);
  });
}

connectBtn.onclick = () => {
  connectMode = !connectMode;
  selectedNode = null;
  connectBtn.textContent = connectMode ? "🛑 Stop Connecting" : "🔗 Connect";
  nodes.forEach(n => n.style.border = "none");
};

saveBtn.onclick = () => {
  const data = nodes.map(node => ({
    top: node.style.top,
    left: node.style.left,
    text: node.querySelector("textarea").value
  }));
  const conns = connections.map(conn => ({
    from: nodes.indexOf(conn.from),
    to: nodes.indexOf(conn.to)
  }));
  localStorage.setItem("mindmap-nodes", JSON.stringify(data));
  localStorage.setItem("mindmap-connections", JSON.stringify(conns));
  alert("Mind map saved!");
};

loadBtn.onclick = () => {
  canvas.innerHTML = "";
  nodes = [];
  connections = [];

  const data = JSON.parse(localStorage.getItem("mindmap-nodes") || "[]");
  const conns = JSON.parse(localStorage.getItem("mindmap-connections") || "[]");

  data.forEach(n => {
    const node = document.createElement("div");
    node.className = "node";
    node.style.top = n.top;
    node.style.left = n.left;
    const textarea = document.createElement("textarea");
    textarea.value = n.text;
    node.appendChild(textarea);
    makeDraggable(node);

    node.oncontextmenu = (e) => {
      e.preventDefault();
      canvas.removeChild(node);
      nodes = nodes.filter(x => x !== node);
      connections = connections.filter(conn => conn.from !== node && conn.to !== node);
      drawConnections();
    };

    node.onclick = () => {
      if (!connectMode) return;
      if (!selectedNode) {
        selectedNode = node;
        node.style.border = "2px dashed #00ffe0";
      } else {
        if (selectedNode !== node) {
          connections.push({ from: selectedNode, to: node });
          drawConnections();
        }
        selectedNode.style.border = "none";
        selectedNode = null;
      }
    };

    canvas.appendChild(node);
    nodes.push(node);
  });

  conns.forEach(c => {
    if (nodes[c.from] && nodes[c.to]) {
      connections.push({ from: nodes[c.from], to: nodes[c.to] });
    }
  });

  drawConnections();
};

clearBtn.onclick = () => {
  canvas.innerHTML = "";
  nodes = [];
  connections = [];
  localStorage.removeItem("mindmap-nodes");
  localStorage.removeItem("mindmap-connections");
  alert("Cleared!");
};
