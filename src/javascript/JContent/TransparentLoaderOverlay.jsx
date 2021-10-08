import React from 'react';
import {Loader} from '@jahia/moonstone';

export const TransparentLoaderOverlay = () => {
    return (
        <div style={{position: 'absolute', width: '100%', height: '100%', zIndex: 9999, backgroundColor: 'rgba(0,0,0,.05)'}}
             className="flexCol_center alignCenter"
        >
            <Loader size="big"/>
        </div>
    );
};
