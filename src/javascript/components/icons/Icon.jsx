import React from "react";

const renderPath = (name, fill) => {
    switch(name) {
        case 'content':
            return <g id={name}>
                <rect x="272.62" y="58" width="178.62" height="126" fill={fill}/>
                <polygon points="60.77 294.77 239.38 294.77 239.38 217.23 239.38 184 239.38 58 60.77 58 60.77 294.77" fill={fill}/>
                <rect x="272.62" y="217.23" width="178.62" height="236.77" fill={fill}/>
                <rect x="60.77" y="328" width="178.62" height="126" fill={fill}/>
            </g>;
        case 'folder':
            return <g id={name}>
                <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" fill={fill}/>
                <path d="M0 0h24v24H0z" fill="none"/>
            </g>;
        case 'manage':
            return <g id={name}>
                <path d="M0 0h24v24H0z" fill="none"/>
                <path fill={fill} d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm7-7H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-1.75 9c0 .23-.02.46-.05.68l1.48 1.16c.13.11.17.3.08.45l-1.4 2.42c-.09.15-.27.21-.43.15l-1.74-.7c-.36.28-.76.51-1.18.69l-.26 1.85c-.03.17-.18.3-.35.3h-2.8c-.17 0-.32-.13-.35-.29l-.26-1.85c-.43-.18-.82-.41-1.18-.69l-1.74.7c-.16.06-.34 0-.43-.15l-1.4-2.42c-.09-.15-.05-.34.08-.45l1.48-1.16c-.03-.23-.05-.46-.05-.69 0-.23.02-.46.05-.68l-1.48-1.16c-.13-.11-.17-.3-.08-.45l1.4-2.42c.09-.15.27-.21.43-.15l1.74.7c.36-.28.76-.51 1.18-.69l.26-1.85c.03-.17.18-.3.35-.3h2.8c.17 0 .32.13.35.29l.26 1.85c.43.18.82.41 1.18.69l1.74-.7c.16-.06.34 0 .43.15l1.4 2.42c.09.15.05.34-.08.45l-1.48 1.16c.03.23.05.46.05.69z"/>
            </g>;
        case 'media':
            return <g id={name}>
                <path fill={fill} d="M388.67,421.83V388.67H90.17V156.5H57v82.92h.17L57,421.83ZM123.33,355.5H455V123.33H289.17L256,90.17H123.5Zm49.75-49.75,74.63-99.5,58,74.79,41.46-49.92,58,74.63Z"/>
            </g>;
        case 'refresh':
            return <g id={name}>
                <path color={fill}  fontSize={'20'} fill={fill} d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                <path d="M0 0h24v24H0z" fill="none"/>
            </g>;
        case 'workflow':
            return <g id={name}>
                <circle cx="147.4" cy="310.3" r="72.4" fill={fill}/>
                <circle cx="319.35" cy="391.75" r="45.25" transform="translate(-118.5 644.22) rotate(-80.78)" fill={fill}/>
                <circle cx="328.4" cy="183.6" r="108.6" fill={fill}/>
            </g>;
        default:
            return '';
    }
};

const Icon = ({
    name,
    fill = '#fff',
    size = 24,
    viewBox = '0 0 24 24'
}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox} width={size} height={size}>
        {renderPath(name, fill)}
    </svg>
);

export default Icon;