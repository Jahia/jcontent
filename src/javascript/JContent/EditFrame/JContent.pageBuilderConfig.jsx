import React from 'react';
import {LabelBar} from '~/JContent/EditFrame/DefaultBar';

export const pageBuilderConfig = (registry) => {
    registry.add('pageBuilderBoxConfig', 'jnt:contentList', {
        targets: [{id: 'jnt:contentList', priority: 0}],
        isBarAlwaysDisplayed: true,
        isSticky: false,
        Bar: LabelBar
    });
};
