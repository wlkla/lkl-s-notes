import {initWeather, fetchWeather} from './weather.js';
import {setupParallaxEffect} from './parallax.js';
import {setupFileUpload} from './fileUpload.js';
import {setupCardDragAndDrop} from './carddrag.js';
import {initializeCards} from './initCards.js';
import {initGitHubBinding, getGitHubInfo} from './github.js';

document.addEventListener('DOMContentLoaded', async function () {
    setupParallaxEffect();
    setupFileUpload();
    setupCardDragAndDrop();
    initWeather();
    fetchWeather();
    await initializeCards();

    // 初始化GitHub绑定功能
    initGitHubBinding();

    // 检查GitHub绑定信息
    const githubInfo = getGitHubInfo();
    if (githubInfo) {
        console.log('GitHub account is bound:', githubInfo);
    } else {
        console.log('GitHub account is not bound');
    }
});