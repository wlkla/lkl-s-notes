import {getGitHubInfo} from './github.js';

export function openFile(topic, fileName) {
    const githubInfo = getGitHubInfo();
    const fileUrl = `https://raw.githubusercontent.com/${githubInfo.username}/${githubInfo.repoName}/main/${githubInfo.filePath}/${topic}/${fileName}`;
    console.log(fileUrl);

    const newWindow = window.open('', '_blank');

    fetch(fileUrl)
        .then(response => response.text())
        .then(content => {
            newWindow.document.write(`
                <html lang="zh">
                    <head>
                        <title>${fileName}</title>
                        <link rel="stylesheet" href="/dist/index.css"/>
                        <script src="/dist/index.min.js"></script>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
                            .vditor { margin-top: 30px; }
                        </style>
                    </head>
                    <body>
                        <div id="vditor" class="vditor"></div>
                        <script>
                            const content = ${JSON.stringify(content)};

                            const initVditor = (language, content) => {
                                window.vditor = new Vditor("vditor", {
                                    cdn: "", // CDN 路径
                                    lang: language,
                                    height: window.innerHeight - 40,
                                    preview: {
                                        theme: {
                                            path: "/dist/css/content-theme", // 预览主题路径
                                        },
                                    },
                                    hint: {
                                        emojiPath: "/dist/images/emoji", // 表情路径
                                    },
                                    cache: {
                                        enable: false,
                                    },
                                    after: () => {
                                        // 在 Vditor 初始化完成后设置内容
                                        window.vditor.setValue(content);
                                    },
                                });
                            };

                            // 使用简体中文初始化 Vditor 并设置内容
                            initVditor("zh_CN", content);
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
