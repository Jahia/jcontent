import {graphql} from 'gql';

const EditContentTranslationLanguages = graphql(`
    fragment EditContentTranslationLanguages on JCRNode {
        translationLanguages
    }
`);

/**
 * Adds the node's existing translations to the useNodeChecks query of the edit actions.
 * The right-click "Translate to" action (sbsTranslate) uses this to pick a target language
 * that has not been translated yet (#2484). Applied only where the action registration
 * declares it, so the plain edit actions do not pay for the extra field.
 */
export const editContentTranslationLanguagesFragment = {
    applyFor: 'node',
    gql: EditContentTranslationLanguages
};
