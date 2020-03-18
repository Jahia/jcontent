import React from 'react';
import ContentRoute from './ContentRoute';

const ImageEditor = React.lazy(() => import(/* webpackChunkName: "imageEditor" */ './ImageEditor'));

export const jContentRoutes = registry => {
    registry.add('route', 'image-edit-route', {
        targets: ['jcontent:60'],
        path: '/jcontent/:siteKey/:lang/image-edit',
        component: ImageEditor
    });

    registry.add('route', 'jcontent-search-route', {
        targets: ['jcontent:99'],
        path: '/jcontent/:siteKey/:lang/search',
        component: ContentRoute
    });

    registry.add('route', 'jcontent-sql2Search-route', {
        targets: ['jcontent:99'],
        path: '/jcontent/:siteKey/:lang/sql2Search',
        component: ContentRoute
    });
};

