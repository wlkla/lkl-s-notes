// 实现markdown文件的渲染与显示

export function openMarkdownFile(topic, fileName) {
    const fileUrl = `https://raw.githubusercontent.com/wlkla/lkl-s-notes/main/doc/${topic}/${fileName}`;
    console.log(fileUrl);
    const pageUrl = `https://lkl.us.kg/${topic}/${fileName}`;

    const newWindow = window.open(pageUrl, '_blank');

    fetch(fileUrl)
        .then(response => response.text())
        .then(content => {
            newWindow.document.write(`
                <html lang="zh">
                    <head>
                        <title>${fileName}</title>
                        <script src="https://cdnjs.cloudflare.com/ajax/libs/marked/2.0.3/marked.min.js"></script>
                        <script src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.13.11/katex.min.js"></script>
                        <script src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.13.11/contrib/auto-render.min.js"></script>
                        <script src="https://cdnjs.cloudflare.com/ajax/libs/mermaid/8.9.2/mermaid.min.js"></script>
                        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.13.11/katex.min.css">
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
                            pre { background-color: #f4f4f4; padding: 10px; border-radius: 5px; }
                        </style>
                    </head>
                    <body>
                        <div id="content"></div>
                        <script>
                            const content = ${JSON.stringify(content)};
                            mermaid.initialize({ startOnLoad: true });
                            document.getElementById('content').innerHTML = marked(content);
                            renderMathInElement(document.body, {
                                delimiters: [
                                    {left: "$$", right: "$$", display: true},
                                    {left: "$", right: "$", display: false}
                                ]
                            });
                            
                            // Render Mermaid diagrams after Markdown is processed
                            mermaid.init(undefined, document.querySelectorAll('.language-mermaid'));
                        </script>
                    </body>
                </html>
            `);
            newWindow.document.close();
        })
        .catch(error => {
            console.error('Error fetching the markdown file:', error);
            newWindow.document.write(`<html lang="zh"><body><h1>Error loading file</h1><p>${error.message}</p></body></html>`);
            newWindow.document.close();
        });
}