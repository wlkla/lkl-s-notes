import {initializeCards} from "./initCards.js";

function getDeviceType() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/android/i.test(userAgent)) {
        return 'Android';
    }
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return 'iOS';
    }
    if (/Win/.test(navigator.platform)) {
        return 'Windows';
    }
    if (/Mac/.test(navigator.platform)) {
        return 'Mac';
    }
    return 'Unknown';
}

function saveGitHubInfo(githubInfo) {
    const deviceType = getDeviceType();
    let storageKey = `${deviceType.toLowerCase()}_githubInfo`;

    try {
        localStorage.setItem(storageKey, JSON.stringify(githubInfo));
        console.log(`GitHub info saved for ${deviceType}`);
        return {success: true};
    } catch (error) {
        console.error('Error saving GitHub info:', error);
        return {success: false, error: error.message};
    }
}

function getGitHubInfoFromDevice() {
    const deviceType = getDeviceType();
    let storageKey = `${deviceType.toLowerCase()}_githubInfo`;

    try {
        const savedInfo = localStorage.getItem(storageKey);
        return savedInfo ? JSON.parse(savedInfo) : null;
    } catch (error) {
        console.error('Error getting GitHub info:', error);
        return null;
    }
}

function prefillGitHubForm() {
    const savedInfo = getGitHubInfoFromDevice();
    if (savedInfo) {
        document.getElementById('userToken').value = savedInfo.userToken || '';
        document.getElementById('username').value = savedInfo.username || '';
        document.getElementById('repoName').value = savedInfo.repoName || '';
        document.getElementById('filePath').value = savedInfo.filePath || '';
    }
}

export function initGitHubBinding() {
    const githubBindBtn = document.getElementById('githubBindBtn');
    const githubBindModal = document.getElementById('githubBindModal');
    const closeBtn = githubBindModal.querySelector('.close');
    const githubBindForm = document.getElementById('githubBindForm');

    githubBindBtn.onclick = function () {
        githubBindModal.style.display = "block";
        prefillGitHubForm();
    }

    closeBtn.onclick = function () {
        githubBindModal.style.display = "none";
    }

    window.onclick = function (event) {
        if (event.target === githubBindModal) {
            githubBindModal.style.display = "none";
        }
    }

    githubBindForm.onsubmit = function (e) {
        e.preventDefault();

        const githubInfo = {
            userToken: document.getElementById('userToken').value,
            username: document.getElementById('username').value,
            repoName: document.getElementById('repoName').value,
            filePath: document.getElementById('filePath').value
        };

        const saveResult = saveGitHubInfo(githubInfo);

        githubBindModal.style.display = "none";

        if (saveResult.success) {
            alert("登录成功！");
            initializeCards();
        } else {
            alert(`保存GitHub信息时出错：${saveResult.error}`);
        }
    }

    prefillGitHubForm();
}

export function getGitHubInfo() {
    return getGitHubInfoFromDevice();
}