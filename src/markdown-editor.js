import { comp, html, ref, unsafeSVG } from '@stevvvns/incomponent';
import { EditorView, keymap, placeholder } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import {
  syntaxHighlighting,
  defaultHighlightStyle,
} from '@codemirror/language';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';

import imageIcon from './icons/image.svg';

async function sha256(data) {
  const hashed = await crypto.subtle.digest('SHA-256', data);
  return toB64(hashed);
}

function toB64(u8) {
  const bytes = u8 instanceof ArrayBuffer ? new Uint8Array(u8) : u8;
  return btoa(
    bytes.reduce((data, byte) => data + String.fromCharCode(byte), ''),
  );
}

function toDataUrl(format, data) {
  return `data:${format};base64,${toB64(data)}`;
}

function assertImageRenders(format, data) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = reject;
    img.onload = resolve;
    img.src = toDataUrl(format, data);
  });
}

comp(
  function LibMarkdownEditor() {
    const editor = ref();
    const text = ref('');
    const transferErrors = ref([]);
    return {
      editor,
      text,
      placeholder: 'Markdown',
      initialValue: '',
      transferErrors,
    };
  },
  ['placeholder', 'initialValue'],
)
  .init((el) => {
    const isTransferring = ref(false);
    el.text.value = el.initialValue;

    function processFiles(files, cm) {
      el.transferErrors.value = [];
      isTransferring.value = true;
      for (const file of [...files]) {
        if (!/^image[/]/.test(file.type)) {
          continue;
        }
        const pushError = (msg) => {
          el.transferErrors.mut((draft) => {
            draft.push(`${file.name}: ${msg}`);
          });
          isTransferring.value = false;
        };
        const reader = new FileReader();
        reader.onerror = () => pushError('Failed to read');
        reader.onload = async () => {
          if (reader.result) {
            try {
              await assertImageRenders(file.type, reader.result);
              const hash = await sha256(reader.result);
              const loc = await new Promise((resolve, reject) => {
                el.emit('upload', {
                  data: reader.result,
                  type: file.type,
                  name: file.name,
                  hash,
                  resolve,
                });
              });
              isTransferring.value = false;
              cm.dispatch(
                cm.state.replaceSelection(
                  `![Alt text](${loc} "Image title")\n`,
                ),
              );
            } catch (ex) {
              console.error(ex);
              pushError('Invalid format');
            }
          } else {
            pushError('Failed to read');
          }
        };
        reader.readAsArrayBuffer(file);
      }
    }
    const prnt = el.shadowRoot.querySelector('#prnt');
    const editor = new EditorView({
      doc: el.text.value,
      extensions: [
        placeholder(el.placeholder),
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        markdown({
          base: markdownLanguage,
        }),
        EditorView.updateListener.of((upd) => {
          if (upd.docChanged) {
            el.text.value = editor.state.doc.toString();
            el.emit('change', { value: el.text.value });
          }
        }),
        EditorState.transactionFilter.of((tr) => {
          if (isTransferring.value) {
            return [];
          }
          return [tr];
        }),
        EditorView.domEventHandlers({
          paste(evt, cm) {
            if (
              evt.clipboardData instanceof DataTransfer &&
              evt.clipboardData.files.length > 0
            ) {
              evt.preventDefault();
              processFiles(evt.clipboardData.files, cm);
            }
          },
        }),
      ],
      parent: prnt,
    });
    prnt.addEventListener('drop', (evt) => {
      if (evt.dataTransfer?.files.length > 0) {
        evt.preventDefault();
        processFiles(evt.dataTransfer.files, editor);
      }
    });
    prnt.querySelector('#upload-image').addEventListener('change', (evt) => {
      if (evt.target.files.length > 0) {
        processFiles(evt.target.files, editor);
      }
    });
    prnt.querySelector('inc-lib-icon-button').addEventListener('click', () => {
      prnt.querySelector('#upload-image').click();
    });
  })
  .template(
    (el) =>
      html` <div id="prnt">
          <label for="upload-image" style="{background: red}">
            <input id="upload-image" type="file" accept="image/*" multiple />
            <inc-lib-tooltip placement="right" text="Insert images">
              <inc-lib-icon-button class="image-button"
                >${unsafeSVG(imageIcon)}</inc-lib-icon-button
              >
            </inc-lib-tooltip>
          </label>
        </div>
        ${el.transferErrors.length > 0
          ? html`<ul class="errors">
              ${el.transferErrors.map((err) => html`<li>${err}</li>`)}
            </ul>`
          : ''}`,
  ).style(`
:host {
  --primary-color: #666;
}
.upload-icon {
  width: 15px;
}
.errors {
  color: #900;
  list-style: none;
  border-left: 8px solid #900;
  padding-left: 10px;
  width: 70ch;
  font-size: small;
}
#prnt {
   position: relative;
   width: 75ch;
}
label[for=upload-image] {
  position: absolute;
  right: 6px;
  bottom: 6px;
  z-index: 2;
}
#upload-image {
  display: none;
}
.image-button {
  opacity: 0;
  transition: opacity 300ms ease;
}
#prnt:hover .image-button {
  opacity: 0.9;
}
.image-button svg {
  width: 16px;
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
  .errors {
    color: #e99;
    border-color: #b00;
  }
  .ͼ4 {
    color: #777;
  }
}
`);
