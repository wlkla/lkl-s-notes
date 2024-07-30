import {initWeather, fetchWeather} from './weather.js';
import {setupParallaxEffect} from './parallax.js';
import {setupFileUpload} from './fileUpload.js';
import {setupCardDragAndDrop} from './carddrag.js';
import {initializeCards} from './initCards.js';

document.addEventListener('DOMContentLoaded', async function () {
    setupParallaxEffect();
    setupFileUpload();
    setupCardDragAndDrop();
    initWeather();
    fetchWeather();
    await initializeCards();
});