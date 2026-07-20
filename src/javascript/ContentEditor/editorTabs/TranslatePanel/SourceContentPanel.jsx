import React from 'react';
import {SideBySideSourceProvider} from '~/ContentEditor/contexts';
import {SourceContentFormBuilder} from './SourceContentFormBuilder';

/**
 * Displays the source content in a translation workflow: a read-only side-by-side source column next
 * to the live edit form. The side-by-side wiring lives in the shared {@link SideBySideSourceProvider}
 * (issue #2579), whose defaults reproduce this tab's behaviour — source language from the existing
 * side-by-side language (falling back to the editable one), which is also the language a restored
 * value is copied into.
 */
export const SourceContentPanel = () => (
    <SideBySideSourceProvider>
        <SourceContentFormBuilder/>
    </SideBySideSourceProvider>
);
