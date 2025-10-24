import { comp, html, ref } from '@stevvvns/incomponent';
import { EditorView, keymap, placeholder } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';

comp(function MarkdownEditor() {
  const editor = ref();
  const text = ref('');
  return {
    editor,
    text,
    placeholder: 'Markdown',
    initialValue: ''
  }
}, ['placeholder', 'initialValue'])
.init(el => {
  el.text.value = el.initialValue;
  const editor = new EditorView({
    doc: el.text.value,
    extensions: [
      placeholder(el.placeholder),
      history(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      markdown({
        base: markdownLanguage
      }),
      EditorView.updateListener.of(upd => {
        if (upd.docChanged) {
          el.text.value = editor.state.doc.toString();
          el.emit('change', { value: el.text.value });
        }
      })
    ],
    parent: el.shadowRoot.querySelector('#prnt')
  });
})
.template(el => html`<div id="prnt"></div>`).style(`
:host {
  --primary-color: #666;
}
.cm-editor {
  padding: 6px;
  background: white;
  border: 1px solid var(--primary-color);
  border-radius: 2px;
  max-width: 80ch;
  min-height: 12ex;
}
.cm-scroller {
  padding-bottom: 16px;
}
.ͼb, .ͼ6 {
  color: var(--primary-color);
}
@media (prefers-color-scheme: dark) {
  .cm-editor {
    background: #2a2a2a;
  }
  .ͼ2 .cm-content {
    caret-color: #777;
  }
}
`);
