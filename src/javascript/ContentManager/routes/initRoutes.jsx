import React from 'react';
import ImageEditor from '../ImageEditor';
import {Trans} from 'react-i18next';
import AppRoute from './AppRoute';
import DefaultRoute from './DefaultRoute';

function initRoutes(registry) {
    const help = (
        <Trans i18nKey="label.contentManager.link.academy"
               components={[
                   <a key="academyLink"
                      href={contextJsParameters.config.academyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                   >.
                   </a>
               ]}/>
    );

    registry.add('app-route', {
        type: 'route',
        target: ['cmm:50'],
        path: '/:siteKey/:lang/apps/:menu/:entry',
        render: (props, {dxContext, t}) => (
            <AppRoute dxContext={dxContext} t={t} help={help} {...props}/>
        )
    });

    registry.add('image-edit-route', {
        target: ['cmm:60'],
        type: 'route',
        path: '/:siteKey/:lang/image-edit',
        render: props => (
            <ImageEditor {...props}/>
        )
    });

    registry.add('cmm-default-route', {
        type: 'route',
        target: ['cmm:99'],
        path: '/:siteKey/:lang/:mode',
        render: (props, {t}) => (
            <DefaultRoute t={t} help={help} {...props}/>
        )
    });
}

export default initRoutes;
