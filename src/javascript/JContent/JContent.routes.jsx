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

function JContentRoutes(registry) {
    registry.add('route', 'app-route', {
        targets: ['jcontent:50'],
        path: '/:siteKey/:lang/apps/:menu/:entry',
        render: (props, {dxContext}) => (
            <AppRoute dxContext={dxContext} {...props}/>
        )
    });

    registry.add('route', 'image-edit-route', {
        targets: ['jcontent:60'],
        path: '/:siteKey/:lang/image-edit',
        render: props => (
            <ImageEditor {...props}/>
        )
    });

    registry.add('route', 'jcontent-default-route', {
        targets: ['jcontent:99'],
        path: '/:siteKey/:lang/:mode',
        render: (props, {t}) => (
            <ContentRoute t={t} {...props}/>
        )
    });
}

export default JContentRoutes;
