// 实现一些组件的美化设置

export const weatherStyles = `
    .raindrop {
        position: absolute;
        top: -10px;
        width: 2px;
        height: 10px;
        background-color: #93dfd5;
        animation: fall linear infinite;
    }

    .snowflake {
        position: absolute;
        width: 5px;
        height: 5px;
        background-color: transparent;
        border-radius: 50%;
        animation: fall linear infinite;
    }

    .cloud {
        position: absolute;
        width: 30vh;
        height: auto;
        animation: moveClouds linear infinite;
    }
    
    @keyframes fall {
        to {
            transform: translateY(100vh);
        }
    }

    @keyframes moveClouds {
        from {
            transform: translateX(100%);
        }
        to {
            transform: translateX(-100%);
        }
    }
`;

export const markdownViewerStyles = `
    body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 20px;
        background-color: #f0f0f0;
    }
    #content {
        background-color: white;
        padding: 20px;
        border-radius: 15px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .toggle-container {
        position: fixed;
        top: 20px;
        right: 20px;
    }
    .toggle-track {
        width: 50px;
        height: 20px;
        background-color: #ddd;
        border-radius: 10px;
        padding: 3px;
        transition: all 0.3s ease;
    }
    .toggle-thumb {
        width: 20px;
        height: 20px;
        background-color: white;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    .toggle-track.rendered .toggle-thumb {
        transform: translateX(30px);
    }
    .icon {
        font-size: 10px;
        display: none;
    }
    .toggle-track.rendered .rendered-icon,
    .toggle-track:not(.rendered) .source-icon {
        display: block;
    }
`;