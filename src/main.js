import markdownitTaskLists from './assets/markdown-it-task-lists.js'

let markdownRenderer
let codeMirror
let previewer = {}
let editorScrolling = false
let previewerScrolling = false
window.openSyncScroll = true

const initMarkdownRenderer = () => {
  previewer.el = document.getElementById('previewer')
  previewer.el.addEventListener('scroll', () => syncEditorScroll())
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

  function injectLineNumbers(tokens, idx, options, env, slf) {
    var line;
    if (tokens[idx].map) {
      line = tokens[idx].map[0];
      tokens[idx].attrJoin('class', 'line');
      tokens[idx].attrSet('data-line', String(line));
    }
    return slf.renderToken(tokens, idx, options, env, slf);
  }

  md.renderer.rules.paragraph_open = md.renderer.rules.heading_open = injectLineNumbers

  return md
}

const syncViewerScroll = _.debounce(() => {
  if (editorScrolling || !openSyncScroll) return
  previewerScrolling = true
  console.log('editor scroll')
  const line = codeMirror.lineAtHeight(0)
  const els = previewer.scrollMap.filter(el => el.dataLine >= line)
  if (els.length === 0) return
  const el = els.shift()
  console.log('viewer scroll to', el.offsetTop)
  $(previewer.el).stop().animate({ scrollTop: +el.offsetTop }, 500, 'swing', () => {
    previewerScrolling = false
  })
}, 50, { maxWait: 50 })

const syncEditorScroll = _.debounce(() => {
  if (previewerScrolling || !openSyncScroll) return
  editorScrolling = true
  console.log('viewer scroll')
  const scrollTop = previewer.el.scrollTop
  console.log('current scrolltop', scrollTop)
  console.log('elements offsetTop')
  previewer.scrollMap.map(el => {
    console.log(el.dataLine, el.offsetTop)
  })
  const els = previewer.scrollMap.filter(el => scrollTop <= +el.offsetTop)
  if (els.length === 0) return
  const el = els.shift()
  const offsetY = codeMirror.heightAtLine(el.dataLine) + codeMirror.getScrollInfo().top
  console.log('editor scroll', offsetY)
  $(codeMirror.getScrollerElement()).stop().animate({ scrollTop: offsetY }, 500, 'swing', () => {
    editorScrolling = false
  })
}, 50, { maxWait: 50 })

const initEditor = () => {
  const codeMirror = CodeMirror.fromTextArea(editor, {
    lineNumbers: true,
    theme: 'material',
    mode: 'markdown',
  })
  codeMirror.on('scroll', () => {
    syncViewerScroll()
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
    previewer.render()
  })
  return codeMirror
}

previewer.render = _.debounce(function () {
  previewer.el.innerHTML = ''
  const markdown = codeMirror.getValue()
  let html = markdownRenderer.render(markdown)
  const content = document.createElement('div')
  content.classList.add('content')
  content.innerHTML = html
  previewer.el.appendChild(content)
  Prism.highlightAll()
  previewer.scrollMap = []
  $('[class=line]').map((i, el) => {
    el.dataLine = +$(el).attr('data-line')
    previewer.scrollMap.push(el)
  })
}, 50)

const main = () => {
  codeMirror = initEditor()
  markdownRenderer = initMarkdownRenderer()
  previewer.render()
  if (true) {
    window.markdownRenderer = markdownRenderer
    window.codeMirror = codeMirror
    window.previewer = previewer
  }
}

main()