import React from 'react';
import {ImgWrapper} from '@jahia/moonstone';

export const extractAndFormatContentTypeData = data => {
    let contentTypeSelectData = data.jcr.nodeTypes.nodes.map(item => {
        return {
            label: item.displayName,
            value: item.name,
            iconStart: <ImgWrapper src={item.icon + '.png'}/>
        };
    });

    contentTypeSelectData.sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()));

    return contentTypeSelectData;
};

export const findSelectedContentType = (contentTypeData, searchContentType) => {
    return contentTypeData.find(item => {
        if (item.value === searchContentType) {
            return item;
        }

        return null;
    });
};
