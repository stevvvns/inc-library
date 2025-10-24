import { comp, html, ref, computed, unsafeHTML } from '@stevvvns/incomponent';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.use({
  pedantic: false,
  gfm: true,
  breaks: true
});

DOMPurify.addHook('afterSanitizeElements', el => {
  if (el.nodeName === 'A') {
    el.setAttribute('rel', 'nofollow noopener noreferrer');
  }
});

comp(function MarkdownRenderer() {
  const markdown = ref('');
  const rendered = ref('');
  computed(() => {
    console.log('markdown change', markdown.value);
    const parsed = marked.parse(markdown.value);
    rendered.value = DOMPurify.sanitize(parsed);
  });
  return { markdown, rendered };
}, ['markdown']).template(el => html`${unsafeHTML(el.rendered)}`)
.style(`
:host {
  --primary-color: #666;
}
h1, h2, h3, h4, h5, h6 {
  font-family: sans-serif;
  color: var(--primary-color);
  margin-bottom: 0;
  padding-bottom: 0;
}
a {
  color: var(--primary-color);
}
`);

export async function render(markdown) {
  const parsed = await marked.parse(markdown);
  return DOMPurify.sanitize(parsed);
}
