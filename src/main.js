import markdownitTaskLists from './assets/markdown-it-task-lists.js'

let markdownRenderer
let codeMirror
let previewer

const initMarkdownRenderer = () => {
  previewer = document.getElementById('previewer')
  const md = markdownit(Object.assign({}, {
      html:         true,
      xhtmlOut:     false,
      breaks:       true,
      langPrefix:   'language-',
      linkify:      true,
      linkTarget:   '',
      typographer:  true,
    }))
    .use(markdownitFootnote)
    .use(markdownitTaskLists)

  return md
}

const initEditor = () => {
  const codeMirror = CodeMirror.fromTextArea(editor, {
    lineNumbers: true,
    theme: 'material',
    mode: 'markdown',
  })
codeMirror.setValue(`# title

### subtitle

**${new Date}**

  - [ ] a
  - [x] b

\`\`\`javascript
const render = () => {
  const markdown = codeMirror.getValue()
  const html = markdown
  Renderer.render(markdown)
  console.log(markdown)
  console.log(html)
  previewer.innerHTML = html
}
\`\`\`

### subtitle

  - a
  - b
  - c

### subtitle

  > asdasdasdasd
  > asdasdasd
  > asdasdasd
  > asdadasd`)
  codeMirror.setSize('100%', '100%')
  codeMirror.on('change', () => {
    render()
  })
  return codeMirror
}

const render = () => {
  const markdown = codeMirror.getValue()
  let html = markdownRenderer.render(markdown)
  previewer.innerHTML = html
  Array.prototype.slice.apply(document.querySelectorAll('pre code')).map(hljs.highlightBlock)
}

const main = () => {
  codeMirror = initEditor()
  markdownRenderer = initMarkdownRenderer()
  render()
}

main()