import type {Fragment} from '@jahia/data-helper';
import {graphql} from 'gql';

/**
 * Adds existing translation languages to the node data to pick the best possible source
 * language in the translation panel.
 */
export const editContentTranslationLanguagesFragment: Fragment = {
    applyFor: 'node',
    gql: graphql(`
        fragment EditContentTranslationLanguages on JCRNode {
            translationLanguages
        }
    `)
};
