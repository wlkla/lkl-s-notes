import {createCard, addFileToCard} from './cardUtils.js';
import {Octokit} from 'https://cdn.skypack.dev/@octokit/core';

export function setupFileUpload() {
    const closeButton = document.getElementById('close');
    const fileInput = document.getElementById('fileInput');
    const uploadComponent = document.getElementById('uploadComponent');
    const uploadButton = document.getElementById('uploadButton');
    const uploadForm = document.getElementById('uploadForm');
    const popupForm = document.getElementById('popupForm');
    const cardContainer = document.getElementById('cardContainer');
    let selectedFile = null;

    closeButton.addEventListener("click", function () {
        popupForm.style.display = "none";
    });

    uploadButton.addEventListener('click', function () {
        fileInput.click();
    });

    uploadComponent.addEventListener('dragover', function (e) {
        e.preventDefault();
        uploadComponent.style.transform = 'scale(1.1)';
        uploadComponent.style.boxShadow = '0 0 10px 5px rgba(255, 255, 255, 0.5)';
        uploadComponent.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
    });

    uploadComponent.addEventListener('dragleave', function () {
        uploadComponent.style.transform = 'scale(1)';
        uploadComponent.style.boxShadow = '';
        uploadComponent.style.transition = '0.3s';
        uploadComponent.style.backgroundColor = '';
    });

    uploadComponent.addEventListener('drop', function (e) {
        e.preventDefault();
        uploadComponent.style.transform = 'scale(1)';
        uploadComponent.style.boxShadow = '';
        uploadComponent.style.transition = '0.3s';
        uploadComponent.style.backgroundColor = '';
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type === 'text/markdown' || file.name.endsWith('.md')) {
                document.getElementById('fileNameInput').value = file.name;

                // 创建一个元素来存储拖放的文件
                const droppedFile = document.createElement('div');
                droppedFile.className = 'dropped-file';
                droppedFile.file = file;
                uploadComponent.appendChild(droppedFile);

                popupForm.style.display = 'block';
            } else {
                alert('请上传Markdown文件！');
            }
        }
    });

    fileInput.addEventListener('change', function (e) {
        selectedFile = e.target.files[0];
        if (selectedFile) {
            document.getElementById('fileNameInput').value = selectedFile.name;
            popupForm.style.display = 'block';
        }
    });

    uploadForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const topic = document.getElementById('topicInput').value;
        const fileName = document.getElementById('fileNameInput').value;

        let file = selectedFile || (fileInput.files && fileInput.files[0]);

        if (!file) {
            // 检查是否有拖放的文件
            const droppedFiles = uploadComponent.querySelectorAll('.dropped-file');
            if (droppedFiles.length > 0) {
                file = droppedFiles[0].file;
            }
        }

        if (!file) {
            alert('请选择一个文件上传。');
            return;
        }

        try {
            // 尝试上传文件到GitHub
            const content = await readFileAsBase64(file);
            await uploadFileToGitHub(topic, fileName, content);

            // 如果上传成功，创建或更新卡片
            let card = document.querySelector(`.card[data-topic="${topic}"]`);
            if (!card) {
                card = createCard(topic);
                cardContainer.appendChild(card);
            }

            addFileToCard(card, topic, fileName);
            popupForm.style.display = 'none';
            uploadForm.reset();
            selectedFile = null; // 重置选中的文件
        } catch (error) {
            alert('上传失败：' + error.message);
        }
    });

    async function readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async function uploadFileToGitHub(topic, fileName, content) {
        const octokit = new Octokit({
            auth: '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'
        });

        const path = `doc/${topic}/${fileName}`;

        try {
            await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
                owner: 'wlkla',
                repo: 'lkl-s-notes',
                path: path,
                message: `Add ${fileName} to ${topic}`,
                content: content,
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });
        } catch (error) {
            throw new Error('GitHub上传失败：' + error.message);
        }
    }

}

const style = document.createElement('style');
style.textContent = `
    .card-fullscreen {
        z-index: 1000;
    }
`;
document.head.appendChild(style);