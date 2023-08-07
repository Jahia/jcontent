import React from 'react';
import {registry} from '@jahia/ui-extender';
import {registerActions} from './registerActions';
import {ContentEditorApi, ContentPickerApi} from './ContentEditorApi';
import {registerSelectorTypes} from '~/ContentEditor/SelectorTypes';
import {registerReducer} from './registerReducer';
import {ContentEditorApiContextProvider} from '~/ContentEditor/contexts/ContentEditorApi/ContentEditorApi.context';
import hashes from './localesHash!.';
import {ContentEditorError} from '~/ContentEditor/ContentEditorApi/ContentEditorError';
import {ErrorBoundary} from '@jahia/jahia-ui-root';
import {registerLegacyGwt} from './registerLegacyGwt';

window.jahia.localeFiles = window.jahia.localeFiles || {};
window.jahia.localeFiles['content-editor'] = hashes;

export function register() {
    registry.add('app', 'content-editor-api', {
        targets: ['root:16.5'],
        render: next => (
            <ContentEditorApiContextProvider>
                <ErrorBoundary fallback={<ContentEditorError/>}>
                    <ContentEditorApi/>
                </ErrorBoundary>
                <ContentPickerApi/>
                {next}
            </ContentEditorApiContextProvider>
        )
    });

    registerActions(registry);
    registerSelectorTypes(registry);
    registerReducer(registry);
    registerLegacyGwt(registry);

    if (window?.Anthracite?.nav) {
        window.Anthracite.nav.pushState = () => {};
        window.Anthracite.nav.pullState = () => {};
        window.Anthracite.nav.onPopState = () => {};
    }

    console.debug('%c Content Editor is activated', 'color: #3c8cba');
}
