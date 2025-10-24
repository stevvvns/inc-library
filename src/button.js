import { comp, html } from '@stevvvns/incomponent';

comp(function LibButton() {
  return { disabled: false };
}, ['type', 'disabled']).template(
  el => html`<button class=${el.type === 'primary' ? 'primary' : 'secondary'} ?disabled=${el.disabled}><span><slot></slot></span></button>`
).style(`
:host {
  --primary-color: #666;
}
button {
  border: 1px solid var(--primary-color);
  border-radius: 2px;
  color: var(--primary-color);
  background: white;
  padding: 6px 12px;
  transition: filter 100ms ease;
  font-weight: bold;
}
button span {
 filter: saturate(80%);
}
button:hover {
  cursor: pointer;
  filter: brightness(110%) drop-shadow(0 0 2px rgba(0, 0, 0, 0.2));
}
button.primary {
  background: var(--primary-color);
  color: #f3f3f3;
}
button:active {
  filter: brightness(90%) !important;
}
button[disabled] {
  cursor: not-allowed;
  border-color: #aaa;
  color: #aaa;
}
button.primary[disabled] {
  background: #aaa;
  color: #f3f3f3;
}
button[disabled]:hover {
  background: white;
  filter: none;
}
button.primary[disabled]:hover {
  background: #aaa;
  filter: none;
}
@media (prefers-color-scheme: dark) {
  button {
    background: transparent;
  }
  button:hover {
    filter: brightness(110%) drop-shadow(0 0 2px rgba(255, 255, 255, 0.3));
  }
  button[disabled] {
    border-color: #555;
    color: #555;
  }
  button[disabled]:hover {
    background: transparent;
    filter: none;
  }
  button[disabled].primary, button[disabled].primary:hover {
    background: #555;
    border-color: #555;
    color: #aaa;
  }
}
`);
