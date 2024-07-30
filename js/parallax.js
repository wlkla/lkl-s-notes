// 实现主页面的滚动视差

export function setupParallaxEffect() {
    let text = document.getElementById('text');
    let leaf = document.getElementById('leaf');
    let hill1 = document.getElementById('hill1');
    let hill2 = document.getElementById('hill2');
    let hill3 = document.getElementById('hill3');
    let hill4 = document.getElementById('hill4');
    let hill5 = document.getElementById('hill5');

    window.addEventListener('scroll', () => {
        let value = window.scrollY;

        text.style.marginTop = value * 1.5 + 'px';
        leaf.style.top = value * -1.5 + 'px';
        leaf.style.left = value * 1.5 + 'px';
        hill5.style.left = value * 1.5 + 'px';
        hill4.style.left = value * -1.5 + 'px';
        hill3.style.left = value * 0.1 + 'px';
        hill2.style.left = value * -0.1 + 'px';
        hill3.style.bottom = value * 0.05 + 'px';
        hill2.style.bottom = value * 0.05 + 'px';
        hill1.style.bottom = value * 0.2 + 'px';
        let sizeFactorHill1 = 1 + value / 1000;
        let sizeFactorHill2 = 1 + value / 1500;
        let sizeFactorHill3 = 1 + value / 2000;

        hill1.style.transform = `scale(${sizeFactorHill1})`;
        hill2.style.transform = `scale(${sizeFactorHill2})`;
        hill3.style.transform = `scale(${sizeFactorHill3})`;
    });
}