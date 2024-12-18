import {LabelBar} from '~/JContent/EditFrame/DefaultBar';

export const pageBuilderConfig = registry => {
    registry.add('pageBuilderBoxConfig', 'areaList', {
        targets: [{id: 'jnt:contentList', priority: 0}],
        isBarAlwaysDisplayed: true,
        isSticky: false,
        Bar: LabelBar
    });
};
