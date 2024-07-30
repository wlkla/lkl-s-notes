// 获取天气并显示在主页

import {weatherStyles} from './styles.js';

let weatherCondition = '';
let weatherEffect;
let rainDrops = [];
let snowFlakes = [];
let rainInterval;
let snowInterval;

const cloudImages = [
    'https://telegraph-image-6b4.pages.dev/file/eeed64d5654dcc96f6725.png'
    // Add other cloud image URLs here
];

export function initWeather() {
    weatherEffect = document.getElementById('weatherEffect');
    applyWeatherStyles();
}

export function fetchWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const {latitude, longitude} = position.coords;
                fetchLocationData(latitude, longitude);
            },
            error => {
                console.error('Error getting geolocation:', error);
                fetchWeatherWithDefaultLocation();
            }
        );
    } else {
        console.error('Geolocation is not supported by this browser.');
        fetchWeatherWithDefaultLocation();
    }
}

function fetchLocationData(lat, lon) {
    const geocodingUrl = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=7b809c8c42e74ba49e5f6f708dc849a1`;
    fetch(geocodingUrl)
        .then(response => response.json())
        .then(data => {
            const city = data.results[0].components.state;
            city ? fetchWeatherByCity(city) : fetchWeatherWithDefaultLocation();
        })
        .catch(error => {
            console.error('Error fetching location data:', error);
            fetchWeatherWithDefaultLocation();
        });
}

function fetchWeatherByCity(city) {
    const url = `https://api.seniverse.com/v3/weather/now.json?key=SdhqqFPipu772-4EX&location=${city}&language=zh-Hans&unit=c`;
    fetchWeatherData(url);
}

function fetchWeatherWithDefaultLocation() {
    const url = `https://api.seniverse.com/v3/weather/now.json?key=SdhqqFPipu772-4EX&location=beijing&language=zh-Hans&unit=c`;
    fetchWeatherData(url);
}

function fetchWeatherData(url) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            weatherCondition = data.results[0].now.text;
            applyWeatherEffect();
        })
        .catch(error => console.error('Error fetching weather data:', error));
}

export function applyWeatherEffect() {
    clearWeatherEffects();
    if (weatherCondition.includes('雨')) {
        startRain();
        document.body.style.backgroundColor = '#dcd9de';
    } else if (weatherCondition.includes('雪')) {
        startSnow();
        document.body.style.backgroundColor = '#fff';
    } else if (weatherCondition.includes('阴')) {
        document.body.style.backgroundColor = '#dcd9de';
    } else if (weatherCondition.includes('多云')) {
        startCloud();
        document.body.style.background = 'linear-gradient(140deg, #fffde7, #ebfffc)';
    } else {
        document.body.style.background = 'linear-gradient(140deg, #fffde7, #ebfffc)';
    }
}

function startRain() {
    createRainDrops();
    rainInterval = setInterval(maintainRainDrops, 300);
}

function startSnow() {
    createSnowFlakes();
    snowInterval = setInterval(maintainSnowFlakes, 300);
}

function startCloud() {
    createClouds();
}

function clearWeatherEffects() {
    weatherEffect.innerHTML = '';
    clearInterval(rainInterval);
    clearInterval(snowInterval);
    rainDrops = [];
    snowFlakes = [];
}

function createRainDrops() {
    for (let i = 0; i < 300; i++) {
        let drop = createRainDrop();
        weatherEffect.appendChild(drop);
        rainDrops.push(drop);
    }
}

function createSnowFlakes() {
    for (let i = 0; i < 300; i++) {
        let flake = createSnowFlake();
        weatherEffect.appendChild(flake);
        snowFlakes.push(flake);
    }
}

function createRainDrop() {
    let drop = document.createElement('div');
    drop.classList.add('raindrop');
    drop.style.left = `${Math.random() * 100}vw`;
    drop.style.top = `${Math.random() * -10}px`;
    drop.style.animationDuration = `${Math.random() + 0.5}s`;
    return drop;
}

function createSnowFlake() {
    let flake = document.createElement('div');
    flake.classList.add('snowflake');
    flake.style.left = `${Math.random() * 100}vw`;
    flake.style.top = `${Math.random() * -10}px`;
    flake.style.opacity = Math.random();
    flake.style.fontSize = `${Math.random() * 10 + 10}px`;
    flake.innerHTML = '❅';
    const fallDuration = Math.random() * 3 + 2;
    const spinDuration = Math.random() * 3 + 2;
    flake.style.animation = `fall ${fallDuration}s linear infinite, spin ${spinDuration}s ease-in-out infinite`;
    return flake;
}

function createCloud(imageUrl) {
    let cloud = document.createElement('img');
    cloud.classList.add('cloud');
    cloud.src = imageUrl;
    cloud.style.position = 'absolute';
    cloud.style.width = `${Math.random() * 20 + 30}vh`;
    cloud.style.height = 'auto';
    cloud.style.top = `${Math.random() * 15}vh`;
    cloud.style.left = `${Math.random() * 100}vw`;
    cloud.style.animation = `moveClouds ${Math.random() * 50 + 30}s linear infinite`;
    return cloud;
}

function createClouds() {
    const selectedClouds = cloudImages.sort(() => 0.5 - Math.random()).slice(0, 6);
    selectedClouds.forEach(cloudImage => {
        let cloud = createCloud(cloudImage);
        weatherEffect.appendChild(cloud);
    });
}

function maintainRainDrops() {
    rainDrops = rainDrops.filter(drop => {
        if (drop.getBoundingClientRect().top > window.innerHeight) {
            weatherEffect.removeChild(drop);
            return false;
        }
        return true;
    });

    while (rainDrops.length < 300) {
        let newDrop = createRainDrop();
        weatherEffect.appendChild(newDrop);
        rainDrops.push(newDrop);
    }
}

function maintainSnowFlakes() {
    snowFlakes = snowFlakes.filter(flake => {
        if (flake.getBoundingClientRect().top > window.innerHeight) {
            weatherEffect.removeChild(flake);
            return false;
        }
        return true;
    });

    while (snowFlakes.length < 300) {
        let newFlake = createSnowFlake();
        weatherEffect.appendChild(newFlake);
        snowFlakes.push(newFlake);
    }
}

function applyWeatherStyles() {
    const style = document.createElement('style');
    style.textContent = weatherStyles;
    document.head.appendChild(style);
}