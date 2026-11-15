export const drawing = document.querySelector('#lab-drawing');
export const modes = document.querySelector('#lab-modes');
export const tools = document.querySelector('#lab-tools');
export const result = document.querySelector('#lab-result');
export const green = '#a9d3b4';
export const gold = '#f5d783';
export const blue = '#acd4e5';
export const ink = '#38634f';

export function button(parent, label, action, pressed) {
  const element = document.createElement('button');
  element.type = 'button';
  element.textContent = label;
  if (pressed !== undefined) element.setAttribute('aria-pressed', pressed);
  element.addEventListener('click', action);
  parent.append(element);
  return element;
}

export function select(parent, label, options, value, action) {
  const field = document.createElement('label');
  const input = document.createElement('select');
  for (const [key, name] of options) input.add(new Option(name, key));
  input.value = value;
  input.addEventListener('change', () => action(input.value));
  field.append(label, input);
  parent.append(field);
  return input;
}

export function slider(parent, label, min, max, step, value, action) {
  const field = document.createElement('label');
  const input = document.createElement('input');
  Object.assign(input, {type:'range', min, max, step, value});
  input.addEventListener('input', () => action(Number(input.value)));
  field.append(label, input);
  parent.append(field);
  return input;
}

export function switches(parent, options, initial, change) {
  const buttons = options.map(([key, label]) => button(parent, label, () => {
    buttons.forEach((item, index) => item.setAttribute('aria-pressed', options[index][0] === key));
    change(key);
  }, key === initial));
  return buttons;
}

export function polygon(points, fill, stroke = ink, extra = '') {
  return `<polygon points="${points.map(point => point.join(',')).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="2" stroke-linejoin="round" ${extra}/>`;
}

export function line(x1, y1, x2, y2, extra = '') {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${ink}" stroke-width="2" ${extra}/>`;
}

export function rect(x, y, width, height, fill, extra = '') {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" stroke="${ink}" ${extra}/>`;
}

export function label(x, y, value, small = false) {
  return `<text x="${x}" y="${y}"${small ? ' class="lab-small"' : ''}>${value}</text>`;
}

export function circle(x, y, radius, fill, extra = '') {
  return `<circle cx="${x}" cy="${y}" r="${radius}" fill="${fill}" stroke="${ink}" stroke-width="2" ${extra}/>`;
}

export function explain(title, message, equation = '') {
  result.innerHTML = `<h2>${title}</h2><p>${message}</p>${equation ? `<p class="lab-equation">${equation}</p>` : ''}`;
}

export function dragView(surface, onMove, canStart = () => true) {
  let active = null;
  let lastX;
  let lastY;
  surface.addEventListener('pointerdown', event => {
    if (active !== null || event.button !== 0 || !canStart(event)) return;
    active = event.pointerId;
    lastX = event.clientX;
    lastY = event.clientY;
    surface.focus({preventScroll: true});
    surface.setPointerCapture(active);
    surface.classList.add('is-dragging');
  });
  surface.addEventListener('pointermove', event => {
    if (event.pointerId !== active) return;
    onMove(event.clientX - lastX, event.clientY - lastY);
    lastX = event.clientX;
    lastY = event.clientY;
  });
  function finish(event) {
    if (event.pointerId !== active) return;
    active = null;
    surface.classList.remove('is-dragging');
  }
  surface.addEventListener('pointerup', finish);
  surface.addEventListener('pointercancel', finish);
  surface.addEventListener('lostpointercapture', finish);
  surface.addEventListener('keydown', event => {
    const movement = {ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12]}[event.key];
    if (!movement) return;
    event.preventDefault();
    onMove(...movement);
  });
}
