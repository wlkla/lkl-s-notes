// 实现卡片容器内部卡片的拖动放置

export function setupCardDragAndDrop() {
    const cardContainer = document.getElementById('cardContainer');

    if (cardContainer) {
        new Sortable(cardContainer, {
            animation: 150,
            handle: '.drag-handle-card',
            onEnd: function (evt) {
                console.log('Card moved:', evt.item);
            }
        });
    }
}