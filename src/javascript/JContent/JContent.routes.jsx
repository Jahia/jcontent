import React from 'react';
import Loadable from 'react-loadable';
import {Trans} from 'react-i18next';
import AppRoute from './AppRoute';
import ContentRoute from './ContentRoute';
import {ProgressPaper} from '@jahia/design-system-kit';

// eslint-disable-next-line
const ImageEditor = Loadable({
    loader: () => import(/* webpackChunkName: "imageEditor" */ './ImageEditor'),
    loading: ProgressPaper
});

function JContentRoutes(registry) {
    const help = (
        <Trans i18nKey="jcontent:label.contentManager.link.academy"
               components={[
                   <a key="academyLink"
                      href=""
                      target="_blank"
                      rel="noopener noreferrer"
                   >.
                   </a>
               ]}/>
    );

    registry.add('app-route', {
        type: 'route',
        target: ['jcontent:50'],
        path: '/:siteKey/:lang/apps/:menu/:entry',
        render: (props, {dxContext}) => (
            <AppRoute dxContext={dxContext} help={help} {...props}/>
        )
    });

    registry.add('image-edit-route', {
        target: ['jcontent:60'],
        type: 'route',
        path: '/:siteKey/:lang/image-edit',
        render: props => (
            <ImageEditor {...props}/>
        )
    });

    registry.add('jcontent-default-route', {
        type: 'route',
        target: ['jcontent:99'],
        path: '/:siteKey/:lang/:mode',
        render: (props, {t}) => (
            <ContentRoute t={t} help={help} {...props}/>
        )
    });
}

export default JContentRoutes;
