
/*
连线答案的数据结构：
const values = [
  ['L1', 'R4'],
  ['L2', 'R3'],
  ['L3', 'R2'],
  ['L4', 'R1'],
];*/


// 第1步：获取Canvas & 配置画笔
const canvas = document.getElementById("canvas");
const backCanvas = document.getElementById("backCanvas");
canvas.width = backCanvas.width = 400;
canvas.height = backCanvas.height = 250;

/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");
const backCtx = backCanvas.getContext("2d");

ctx.strokeStyle = backCtx.strokeStyle = 'blue';
ctx.lineWidth = backCtx.lineWidth = 2;


// 第2步：获取列表元素，挂载后续操作所需的数据
const listItems = document.querySelectorAll('.list .item');
// 记录canvas距离屏幕左上角的位置，用于计算移动时鼠标在画布中的位置
let canvasTop = 0;
let canvasLeft = 0;
calcRect();
// 缩放窗口时，实时更新数据
window.onresize = calcRect;
function calcRect() {
  // TODO: 节流优化
  // 更新canvas距离屏幕左上角的位置
  const rect = canvas.getBoundingClientRect()
  canvasTop = rect.top;
  canvasLeft = rect.left;

  // 记录节点信息
  listItems.forEach(item => {
    // 获取元素在屏幕上的信息
    const { left, top, width, height } = item.getBoundingClientRect();
    // 获取元素归属：左侧还是右侧·用于计算元素锚点坐标
    const ownership = item.dataset.ownership;
    // 记录元素锚点坐标
    const anchorX = ownership === 'L' ? item.offsetLeft + width : item.offsetLeft;
    const anchorY = item.offsetTop + height / 2;
    item.dataset.anchorX = anchorX;
    item.dataset.anchorY = anchorY;

    // 标识当前元素是否连线
    item.dataset.checked = '0';

    // 绘制锚点，查看锚点位置是否准确（临时代码）
    // ctx.beginPath();
    // ctx.arc(anchorX, anchorY, 4, 0, Math.PI * 2);
    // ctx.stroke();
    // ctx.closePath();
  });
}



// 第3步：绑定事件
listItems.forEach((item) => (item.onmousedown = onMousedown));
document.onmousemove = onMousemove;
document.onmouseup = onMouseup;


// 第4步：连线相关（核心逻辑）
let trigger = false; // 标识是否触发连线
let startPoint = { x: 0, y: 0 }; // 记录每一次连线开始点
let endPoint = { x: 0, y: 0 }; // 记录每一次连线结束点
let startElement = null; // 记录每一次连线开始元素
let endElement = null; // 记录每一次连线结束元素
let backLines = []; // 记录已经连接好的线·数据结构 → { anwser: [左侧元素ID, 右侧元素ID], point: {x1, y1, x2, y2}}[]

function onMousedown(event) {
  // 高亮显示按下的元素
  if (!this.classList.contains('active')) {
    this.classList.add('active');
  }
  // 记录每一次连线的开始元素
  startElement = this;

  // 更新每一次连线开始点信息
  startPoint.x = +this.dataset.anchorX;
  startPoint.y = +this.dataset.anchorY;

  // 标识触发连线，用于在mousemove中判断是否需要处理后续的逻辑
  trigger = true;
  // 阻止时间冒泡/默认行为
  event.stopPropagation();
  event.preventDefault();
}


function onMousemove(event) {
  if (trigger) {
    /****************
     * 处理连线
     ****************/
    // 获取鼠标在屏幕上的位置
    const { clientX, clientY } = event;
    // 计算鼠标在画板中的位置
    const endPoint = {
      x: clientX - canvasLeft,
      y: clientY - canvasTop
    }
    // 连线：实际画板
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(endPoint.x, endPoint.y);
    ctx.closePath();
    ctx.stroke();

    /****************
     * 处理后续逻辑
     ****************/

    // 获取鼠标经过的元素
    const overElement = document.elementFromPoint(clientX, clientY);
    // 获取开始元素归属：左侧还是右侧
    const ownership = startElement.dataset.ownership;
    // 如果鼠标经过的元素等于目标元素，不作任何处理
    if (overElement === endElement) return;
    // 判断是否命中目标元素，条件如下（同时满足）
    // ① 鼠标经过的元素必须包含类名 item
    // ② 鼠标经过的元素和开始元素不在同一侧
    // ③ 鼠标经过的元素未被连线
    const condition1 = overElement.classList.contains('item');
    const condition2 = overElement.dataset.ownership !== ownership;
    const condition3 = overElement.dataset.checked !== '1';
    if (condition1 && condition2 && condition3) {
      // 记录目标元素
      endElement = overElement;
      // 更新目标元素状态（高亮显示）
      endElement.classList.add('active');
      // 将开始元素和目标元素表示为已连线
      endElement.dataset.checked = '1';
      startElement.dataset.checked = '1';
    }
    // 如果没有命中目标元素，但是目标元素又存在，则移除相关状态
    else if (endElement) {
      endElement.classList.remove('active');
      endElement.dataset.checked = startElement.dataset.checked = '0';
      endElement = null;
    }
  }
  // 阻止时间冒泡/默认行为
  event.stopPropagation();
  event.preventDefault();
}

function onMouseup() {
  // 如果开始元素存在且未被连线，则恢复开始元素的状态
  if (startElement && startElement.dataset.checked !== '1') {
    startElement.classList.remove('active');
  }
  // 完成连线：开始元素和目标元素同时存在，并且被标识选中
  if (startElement && endElement && startElement.dataset.checked === '1' && endElement.dataset.checked === '1') {
    // 获取连线始末坐标点
    const { anchorX: x1, anchorY: y1 } = startElement.dataset;
    const { anchorX: x2, anchorY: y2 } = endElement.dataset;
    // 获取开始元素归属：左侧还是右侧
    const ownership = startElement.dataset.ownership;
    // 获取开始元素的id
    const startId = startElement.id;
    // 判断开始元素是否已经完成连线·遍历backLines，判断存储答案的集合中是否包含开始元素的id，存在则更新index
    let index = -1;
    for (let i = 0; i < backLines.length; i++) {
      const item = backLines[i];
      if (item.anwser.includes(startId)) {
        index = i;
        break;
      }
    }
    // 如果元素已经完成连线，则需将连线的目标元素恢复成未连线状态，具体步骤
    // ① 获取目标元素的ID
    // ② 根据ID获取目标元素
    // ③ 恢复目标元素的状态（标识+高亮状态）
    // ④ 将对应的数据从记录中移出（因为后面会重新插入数据）
    if (index !== -1) {
      const tarElementId = backLines[index].anwser[ownership === 'L' ? 1 : 0];
      const tarElement = document.getElementById(tarElementId);
      tarElement.dataset.checked = '0';
      tarElement.classList.remove('active');
      backLines.splice(index, 1);
    }

    // 组装数据，存入记录
    backLines.push({
      anwser: ownership === 'L' ? [startElement.id, endElement.id] : [endElement.id, startElement.id],
      point: { x1, y1, x2, y2 }
    });
    // 绘制连线结果
    drawLines();
  }

  // 恢复元素状态
  trigger = false;
  startElement = null;
  endElement = null;
  // 清空实际连线画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
// -- 模拟连线
function drawLines() {
  backCtx.clearRect(0, 0, backCanvas.width, backCanvas.height);
  backLines.map(({ point: { x1, x2, y1, y2 } }) => {
    backCtx.beginPath();
    backCtx.moveTo(x1, y1);
    backCtx.lineTo(x2, y2);
    backCtx.closePath();
    backCtx.stroke();
  });
}


// 第5步：重置
// ① 清空模拟连线画布
// ② 恢复元素初始状态
// ③ 置空连线记录
const btnReset = document.querySelector('.reset');
btnReset.onclick = function () {
  backCtx.clearRect(0, 0, backCanvas.width, backCanvas.height);
  listItems.forEach(item => {
    item.classList.remove('active');
    item.dataset.checked = '0';
  });
  backLines = [];
}

// 第6步：回退
// ① 将最后一次连线的数据从连线记录中移除
// ② 获取连线元素并恢复其初始状态
// ③ 重新绘制模拟连线
const btnBack = document.querySelector('.back');
btnBack.onclick = function () {
  const { anwser: [startId, endId] } = backLines.pop();
  const startElement = document.getElementById(startId);
  const endElement = document.getElementById(endId);
  startElement.dataset.checked = endElement.dataset.checked = '0';
  startElement.classList.remove('active');
  endElement.classList.remove('active');
  drawLines();
}

// 第7步：保存答案
// ① 从连线记录中组装答案结构列表：[[id1, id2], [id3, id4]...]
// ② 将答案存储至本地
const getAnwsers = () => {
  const anwsers = [];
  backLines.forEach(({ anwser }) => anwsers.push([...anwser]));
  return anwsers;
}
const saveAnwsers = () => {
  const anwsers = getAnwsers();
  if (anwsers.length > 0) {
    localStorage.setItem('ANWSERS', JSON.stringify(anwsers));
    console.log('保存成功');
  } else {
    console.log('没有可保存的数据');
  }
}
const btnSave = document.querySelector('.save');
btnSave.onclick = saveAnwsers;

// 第8步：删除答案
const btnDelete = document.querySelector('.delete');
btnDelete.onclick = () => {
  localStorage.removeItem('ANWSERS');
  console.log('删除成功');
};


// 第9步：读取(回显）答案
// ① 从本地读取数据
// ② 判断数据是否存在，如果存在，则遍历数据做后续处理
// ③ 获取每一条线路的开始元素和目标元素
// ④ 更新开始元素和目标元素的状态：选中状态/高亮显示
// ⑤ 计算连线坐标
// ⑥ 拼装数据并绘制到模拟连线画板上
const showAnwsers = () => {
  const localAnwsers = localStorage.getItem('ANWSERS');
  if (localAnwsers) {
    const anwsers = JSON.parse(localAnwsers);
    anwsers.forEach(([startId, endId]) => {
      // 获取开始元素和目标元素
      const startElement = document.getElementById(startId);
      const endElement = document.getElementById(endId);
      // 更新选中状态
      startElement.dataset.checked = endElement.dataset.checked = '1';
      // 高亮显示元素
      startElement.classList.add('active');
      endElement.classList.add('active');
      // 计算坐标
      const { anchorX: x1, anchorY: y1 } = startElement.dataset;
      const { anchorX: x2, anchorY: y2 } = endElement.dataset;
      // 拼装数据
      backLines.push({
        anwser: [startId, endId],
        point: { x1, y1, x2, y2 }
      });
      drawLines();
    });
  } else {
    console.log("没有可回显的数据")
  }
}
const btnShow = document.querySelector('.read');
btnShow.onclick = showAnwsers;

// 第10步：纠错
// ① 从本地读取数据
// ② 判断数据是否存在，如果存在，则遍历数据做后续处理
// ③ 获取每一条线路的开始元素和目标元素
// ④ 更新开始元素和目标元素的状态：选中状态/高亮显示
// ⑤ 计算连线坐标
// ⑥ 拼装数据并绘制到模拟连线画板上
const standardAnwsers = [
  ['L1', 'R4'],
  ['L2', 'R3'],
  ['L3', 'R2'],
  ['L4', 'R1'],
];
const checkAnwsers = () => {
  const localAnwsers = localStorage.getItem('ANWSERS');
  if (localAnwsers) {
    const anwsers = JSON.parse(localAnwsers);
    const lines = [];
    anwsers.forEach(([startId, endId]) => {
      /****************
      * 找到用户连线的数据
      ****************/
      // 获取开始元素和目标元素
      const startElement = document.getElementById(startId);
      const endElement = document.getElementById(endId);
      // 更新选中状态
      startElement.dataset.checked = endElement.dataset.checked = '1';
      // 高亮显示元素
      startElement.classList.add('active');
      endElement.classList.add('active');
      // 计算坐标
      const { anchorX: x1, anchorY: y1 } = startElement.dataset;
      const { anchorX: x2, anchorY: y2 } = endElement.dataset;
      /****************
      * 处理纠错逻辑
      ****************/
      // 找到当前连线数据对应的标准答案
      const standardAnwser = standardAnwsers.find(item => item[0] === startId);
      // 拼装数据
      lines.push({
        point: { x1, y1, x2, y2 },
        isOk: endId === standardAnwser[1]
      });
    });
    // 绘制模拟连线画板
    backCtx.clearRect(0, 0, backCanvas.width, backCanvas.height);
    lines.forEach(({ isOk, point: { x1, y1, x2, y2 } }) => {
      backCtx.strokeStyle = isOk ? 'blue' : 'red';
      backCtx.beginPath();
      backCtx.moveTo(x1, y1);
      backCtx.lineTo(x2, y2);
      backCtx.stroke();
    });
    backCtx.strokeStyle = 'blue';
  } else {
    console.log("没有可纠错的数据")
  }
}
const btnCheck = document.querySelector('.check');
btnCheck.onclick = checkAnwsers;








