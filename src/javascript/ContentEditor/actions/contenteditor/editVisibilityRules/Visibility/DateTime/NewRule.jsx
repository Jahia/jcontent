import React from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {Typography} from '@jahia/moonstone';
import {useQuery} from '@apollo/client';
import {useSelector} from 'react-redux';
import {useContentEditorConfigContext} from '~/ContentEditor/contexts';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {CreateFormQuery} from '~/ContentEditor/ContentEditor/create.gql-queries';
import {FieldContainer} from '~/ContentEditor/editorTabs/EditPanelContent/FormBuilder/Field';
import styles from './DateTime.scss';

export const NewRule = ({type, node}) => {
    const {t} = useTranslation();
    const contentEditorConfigContext = useContentEditorConfigContext();
    const {lang, uuid} = contentEditorConfigContext;
    const uilang = useSelector(state => state.uilang);
    // Get Data
    const formQueryParams = {
        uuid,
        language: lang,
        uilang,
        primaryNodeType: type,
        writePermission: `jcr:modifyProperties_default_${lang}`,
        childrenFilterTypes: Constants.childrenFilterTypes
    };

    const {loading, error, data, refetch} = useQuery(CreateFormQuery, {
        variables: formQueryParams,
        fetchPolicy: 'network-only',
        errorPolicy: 'all'
    });
    console.debug('Create form definition for type', type, 'and node', node, 'is', data, 'and loading is', loading);
    if (loading) {
        return <Typography>{t('jcontent:label.contentEditor.visibilityTab.conditions.loading')}</Typography>;
    }
    const contentSection = data.forms.createForm?.sections.find(s => s.name === 'content');
    return (
        <div className={styles.row}>
            {contentSection.fieldSets[0].fields.map(field =>
                <FieldContainer key={field.name} field={field} inputContext={{displayActions: false}}/>)}
        </div>
    );
};

NewRule.propTypes = {
    type: PropTypes.string,
    node: PropTypes.object
};

