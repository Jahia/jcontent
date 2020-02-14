import React from 'react';
import Loadable from 'react-loadable';
import AppRoute from './AppRoute';
import ContentRoute from './ContentRoute';
import {ProgressPaper} from '@jahia/design-system-kit';

// eslint-disable-next-line
const ImageEditor = Loadable({
    loader: () => import(/* webpackChunkName: "imageEditor" */ './ImageEditor'),
    loading: ProgressPaper
});

export const jContentRoutes = registry => {
    registry.add('route', 'app-route', {
        targets: ['jcontent:50'],
        path: '/jcontent/:siteKey/:lang/apps/:menu/:entry',
        render: (props, {dxContext}) => (
            <AppRoute dxContext={dxContext} {...props}/>
        )
    });

    registry.add('route', 'image-edit-route', {
        targets: ['jcontent:60'],
        path: '/jcontent/:siteKey/:lang/image-edit',
        render: props => (
            <ImageEditor {...props}/>
        )
    });

    registry.add('route', 'jcontent-default-route', {
        targets: ['jcontent:99'],
        path: '/jcontent/:siteKey/:lang/:mode',
        render: props => (
            <ContentRoute {...props}/>
        )
    });
};

