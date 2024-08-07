import {openFile} from './openfile.js';
import {Octokit} from 'https://cdn.skypack.dev/@octokit/core';
import {getGitHubInfo} from './github.js';

export function createCard(topic) {
    const githubInfo = getGitHubInfo();
    const octokit = new Octokit({
        auth: githubInfo.userToken
    });
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-topic', topic);
    card.innerHTML = `
            <div class="card-title">
                <span class="drag-handle-card">⋮⋮</span>
                <span class="topic-name">${topic}</span>
                <div class="card-options">
                    <div class="card-color-picker-container">
                        <input type="color" width="20px" height="20px" style="padding: 0" class="card-color-picker-odd" value="#fbfdeb" title="设置奇数行颜色">
                        <input type="color" width="20px" height="20px" style="padding: 0" class="card-color-picker-even" value="#93dfd5" title="设置偶数行颜色">
                    </div>
                    <button class="card-more-options">⋮</button>
                    <div class="card-menu" style="display: none;">
                        <button class="edit-topic-name">修改主题名称</button>
                        <button class="delete-topic">删除主题</button>
                        <button class="merge-topic">合并主题</button>
                        <div class="merge-submenu" style="display: none;"></div>
                    </div>
                </div>
                <button class="card-toggle">
                    <i class="fas fa-expand"></i>
                </button>
            </div>
            <div class="card-content"></div>
        `;

    const toggleButton = card.querySelector('.card-toggle');
    toggleButton.addEventListener('click', function () {
        toggleCardSize(card);
    });

    const moreOptionsButton = card.querySelector('.card-more-options');
    const cardMenu = card.querySelector('.card-menu');
    const deleteTopicButton = card.querySelector('.delete-topic');
    const editTopicNameButton = card.querySelector('.edit-topic-name');
    const mergeTopicButton = card.querySelector('.merge-topic');
    const mergeSubmenu = card.querySelector('.merge-submenu');
    const topicName = card.querySelector('.topic-name');

    moreOptionsButton.addEventListener('click', function (e) {
        e.stopPropagation();
        cardMenu.style.display = cardMenu.style.display === 'none' ? 'block' : 'none';
        updateMergeSubmenu();
    });

    deleteTopicButton.addEventListener('click', async function () {
        if (confirm('确定要删除这个主题吗？')) {
            try {
                card.remove();
                await deleteTopicFolderInGitHub(topic);
            } catch (error) {
                alert(`删除主题失败：${error.message}`);
            }
        }
        cardMenu.style.display = 'none';
    });

    editTopicNameButton.addEventListener('click', function () {
        topicName.contentEditable = true;
        topicName.focus();
        cardMenu.style.display = 'none';
    });

    mergeTopicButton.addEventListener('click', function (e) {
        e.stopPropagation();
        mergeSubmenu.style.display = mergeSubmenu.style.display === 'none' ? 'block' : 'none';
    });

    // Close menu when clicking outside
    document.addEventListener('click', function () {
        cardMenu.style.display = 'none';
        mergeSubmenu.style.display = 'none';
    });

    topicName.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.blur();
        }
    });

    topicName.addEventListener('blur', async function () {
        const newTopic = this.textContent.trim();
        const oldTopic = card.getAttribute('data-topic');
        if (newTopic !== '' && newTopic !== oldTopic && !isTopicNameDuplicate(newTopic, card)) {
            try {
                await renameTopicFolderInGitHub(oldTopic, newTopic);
                card.setAttribute('data-topic', newTopic);
            } catch (error) {
                alert(`重命名主题失败：${error.message}`);
                this.textContent = oldTopic;
            }
        } else {
            this.textContent = oldTopic;
            if (newTopic === '') {
                alert('主题名称不能为空！');
            } else if (newTopic === oldTopic) {
                // Do nothing, name hasn't changed
            } else {
                alert('主题名称已存在，请使用其他名称！');
            }
        }
    });

    const colorPickerOdd = card.querySelector('.card-color-picker-odd');
    const colorPickerEven = card.querySelector('.card-color-picker-even');

    colorPickerOdd.addEventListener('input', function (e) {
        const color = e.target.value;
        applyColor(card, color, 'odd');
    });

    colorPickerEven.addEventListener('input', function (e) {
        const color = e.target.value;
        applyColor(card, color, 'even');
    });

    applyColor(card, colorPickerOdd.value, 'odd');
    applyColor(card, colorPickerEven.value, 'even');
    setupDragAndDropCard(card);

    return card;
}

function toggleCardSize(card) {
    card.classList.toggle('card-fullscreen');
    const icon = card.querySelector('.card-toggle i');
    if (card.classList.contains('card-fullscreen')) {
        card.style.width = '80%';
        card.style.height = '90%';
        card.style.position = 'fixed';
        card.style.top = '50%';
        card.style.left = '50%';
        card.style.transform = 'translate(-50%, -50%)';
        card.querySelector('.drag-handle-card').style.display = 'none';
        icon.classList.remove('fa-expand');
        icon.classList.add('fa-compress');
    } else {
        card.style.width = '';
        card.style.height = '';
        card.style.position = '';
        card.style.top = '';
        card.style.left = '';
        card.style.transform = '';
        card.querySelector('.drag-handle-card').style.display = 'block';
        icon.classList.remove('fa-compress');
        icon.classList.add('fa-expand');
    }
}

export function addFileToCard(card, topic, fileName) {
    const content = card.querySelector('.card-content');
    if (isFileNameDuplicate(fileName, card)) {
        alert(`文件 "${fileName}" 已存在于此主题中。`);
        return;
    }
    const item = document.createElement('div');
    item.className = 'card-item';
    item.innerHTML = `
            <span class="file-name">${fileName}</span>
            <span class="drag-handle">⋮⋮</span>
        `;
    content.appendChild(item);

    // 为文件名元素添加点击事件处理程序
    setFileNameClickHandler(item.querySelector('.file-name'), topic, fileName);

    updateCardItemColors(card);
}

function setFileNameClickHandler(element, topic, fileName) {
    // 移除所有旧的点击事件处理程序
    const oldHandler = element._clickHandler;
    if (oldHandler) {
        element.removeEventListener('click', oldHandler);
    }

    // 创建新的点击事件处理程序
    const newHandler = function () {
        openFile(topic, fileName);
    };

    // 设置并添加新的点击事件处理程序
    element._clickHandler = newHandler;
    element.addEventListener('click', newHandler);
}

function setupDragAndDropCard(card) {
    const content = card.querySelector('.card-content');
    new Sortable(content, {
        group: 'shared', // 允许在同一组之间的卡片元素拖动
        animation: 150,
        handle: '.drag-handle',
        ghostClass: 'blue-background-class',
        onEnd: async function (evt) {
            const oldCard = evt.from.closest('.card');
            const newCard = evt.to.closest('.card');
            const fileName = evt.item.querySelector('.file-name').textContent;

            if (oldCard !== newCard) {
                const oldTopic = oldCard.getAttribute('data-topic');
                const newTopic = newCard.getAttribute('data-topic');

                try {
                    await moveFileInGitHub(oldTopic, newTopic, fileName);
                    console.log(`File "${fileName}" moved from "${oldTopic}" to "${newTopic}".`);
                    updateCardItemColors(newCard);
                    updateCardItemColors(oldCard);

                    // 更新文件项的点击事件处理程序
                    setFileNameClickHandler(evt.item.querySelector('.file-name'), newTopic, fileName);
                } catch (error) {
                    console.error(`Failed to move file "${fileName}":`, error);

                    // GitHub 操作失败，回滚 UI 更改
                    oldCard.querySelector('.card-content').insertBefore(evt.item, oldCard.querySelector('.card-content').children[evt.oldIndex]);

                    // 显示错误信息给用户
                    alert('文件移动失败，请重试。');
                }
            } else {
                updateCardItemColors(oldCard);
            }
        }
    });
}

function isTopicNameDuplicate(newTopic, currentCard) {
    const cards = document.querySelectorAll('.card');
    for (let card of cards) {
        if (card !== currentCard && card.getAttribute('data-topic') === newTopic) {
            return true;
        }
    }
    return false;
}

function updateMergeSubmenu() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        const mergeSubmenu = card.querySelector('.merge-submenu');
        mergeSubmenu.innerHTML = '';
        cards.forEach(otherCard => {
            if (otherCard !== card) {
                const mergeOption = document.createElement('button');
                mergeOption.textContent = otherCard.getAttribute('data-topic');
                mergeOption.addEventListener('click', () => mergeTopics(card, otherCard));
                mergeSubmenu.appendChild(mergeOption);
            }
        });
    });
}

function applyColor(card, color, type) {
    updateCardItemColors(card);
}

export function isFileNameDuplicate(fileName, card) {
    const existingFiles = card.querySelectorAll('.file-name');
    return Array.from(existingFiles).some(file => file.textContent === fileName);
}

export function updateCardItemColors(card) {
    const items = Array.from(card.querySelectorAll('.card-item'));
    const colorPickerOdd = card.querySelector('.card-color-picker-odd');
    const colorPickerEven = card.querySelector('.card-color-picker-even');

    items.forEach((item, index) => {
        if (index % 2 === 0) {
            item.style.backgroundColor = colorPickerOdd.value;
        } else {
            item.style.backgroundColor = colorPickerEven.value;
        }
    });
}

async function mergeTopics(sourceCard, targetCard) {
    const sourceContent = sourceCard.querySelector('.card-content');
    const targetContent = targetCard.querySelector('.card-content');
    const sourceTopic = sourceCard.getAttribute('data-topic');
    const targetTopic = targetCard.getAttribute('data-topic');
    const items = Array.from(sourceContent.children);

    for (const item of items) {
        const fileName = item.querySelector('.file-name').textContent;
        if (!isFileNameDuplicate(fileName, targetCard)) {
            try {
                await moveFileInGitHub(sourceTopic, targetTopic, fileName);
                targetContent.appendChild(item);
            } catch (error) {
                console.error(`移动文件 "${fileName}" 失败：${error.message}`);
            }
        } else {
            console.warn(`文件 "${fileName}" 在目标主题中已存在，将被跳过。`);
        }
    }

    if (sourceContent.children.length === 0) {
        sourceCard.remove();
    }
    updateCardItemColors(sourceCard);
    updateCardItemColors(targetCard);
}

async function moveFileInGitHub(sourceTopic, targetTopic, fileName) {
    const githubInfo = getGitHubInfo();
    const sourcePath = `${githubInfo.filePath}/${sourceTopic}/${fileName}`;
    const targetPath = `${githubInfo.filePath}/${targetTopic}/${fileName}`;
    const octokit = new Octokit({
        auth: githubInfo.userToken
    });

    // 获取源文件内容
    const {data: sourceFile} = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: githubInfo.username,
        repo: githubInfo.repoName,
        path: sourcePath,
        headers: {'X-GitHub-Api-Version': '2022-11-28'}
    });

    // 在目标路径创建文件
    await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
        owner: githubInfo.username,
        repo: githubInfo.repoName,
        path: targetPath,
        message: `Move ${fileName} from ${sourceTopic} to ${targetTopic}`,
        content: sourceFile.content,
        headers: {'X-GitHub-Api-Version': '2022-11-28'}
    });

    // 删除源文件
    await octokit.request('DELETE /repos/{owner}/{repo}/contents/{path}', {
        owner: githubInfo.username,
        repo: githubInfo.repoName,
        path: sourcePath,
        message: `Remove ${fileName} from ${sourceTopic}`,
        sha: sourceFile.sha,
        headers: {'X-GitHub-Api-Version': '2022-11-28'}
    });
}

async function deleteTopicFolderInGitHub(topic) {
    const githubInfo = getGitHubInfo();
    const path = `${githubInfo.filePath}/${topic}`;
    const octokit = new Octokit({
        auth: githubInfo.userToken
    });

    // 获取文件夹内容
    const {data: contents} = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: githubInfo.username,
        repo: githubInfo.repoName,
        path: path,
        headers: {'X-GitHub-Api-Version': '2022-11-28'}
    });

    // 删除文件夹内的所有文件
    for (const file of contents) {
        await octokit.request('DELETE /repos/{owner}/{repo}/contents/{path}', {
            owner: githubInfo.username,
            repo: githubInfo.repoName,
            path: file.path,
            message: `Delete ${file.name} as part of removing ${topic}`,
            sha: file.sha,
            headers: {'X-GitHub-Api-Version': '2022-11-28'}
        });
    }
}

async function renameTopicFolderInGitHub(oldTopic, newTopic) {
    const githubInfo = getGitHubInfo();
    const oldPath = `${githubInfo.filePath}/${oldTopic}`;
    const newPath = `${githubInfo.filePath}/${newTopic}`;
    const octokit = new Octokit({
        auth: githubInfo.userToken
    });

    // 获取旧文件夹内容
    const {data: contents} = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: githubInfo.username,
        repo: githubInfo.repoName,
        path: oldPath,
        headers: {'X-GitHub-Api-Version': '2022-11-28'}
    });

    // 移动每个文件到新文件夹
    for (const file of contents) {
        const oldFilePath = file.path;
        const newFilePath = oldFilePath.replace(oldPath, newPath);

        // 获取文件内容
        const {data: fileContent} = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: githubInfo.username,
            repo: githubInfo.repoName,
            path: oldFilePath,
            headers: {'X-GitHub-Api-Version': '2022-11-28'}
        });

        // 在新位置创建文件
        await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
            owner: githubInfo.username,
            repo: githubInfo.repoName,
            path: newFilePath,
            message: `Move ${file.name} from ${oldTopic} to ${newTopic}`,
            content: fileContent.content,
            headers: {'X-GitHub-Api-Version': '2022-11-28'}
        });

        // 删除旧位置的文件
        await octokit.request('DELETE /repos/{owner}/{repo}/contents/{path}', {
            owner: githubInfo.username,
            repo: githubInfo.repoName,
            path: oldFilePath,
            message: `Remove ${file.name} from ${oldTopic}`,
            sha: file.sha,
            headers: {'X-GitHub-Api-Version': '2022-11-28'}
        });
    }
}
