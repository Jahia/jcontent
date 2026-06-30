import React, {useCallback} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {Button} from '@jahia/moonstone';
import {Paper} from '@material-ui/core';
import {Formik} from 'formik';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {NewRule} from './NewRule';
import {SaveEditedRuleButton} from './SaveEditedRuleButton';
import {buildUpdatedCondition, jmixConditionalVisibility} from './utils';
import styles from './DateTime.scss';

export const EditRule = ({rule, isMatchingAllConditions, saveConditions, onCancel}) => {
    const {t} = useTranslation('jcontent');

    // Rules are always persisted in the backend, so an edited rule always exposes its
    // properties array coming from the server. Keep only the condition's own editable properties
    // (dayOfWeek, start, end, ...). System/protected properties in the jcr: and j: namespaces — e.g.
    // jcr:lastModified, j:lastPublished from the mix:lastModified / jmix:lastPublished mixins — must be
    // excluded, otherwise they would be sent back on save and rejected as protected properties.
    const initialValues = rule.properties
        .filter(prop => !prop.name.startsWith('jcr:') && !prop.name.startsWith('j:'))
        .reduce((acc, prop) => {
            acc[prop.name] = prop.values === null ? prop.value : prop.values;
            return acc;
        }, {});

    const handleSubmit = useCallback(values => {
        console.debug('Submitting edited rule with values', values, 'for rule', rule);
        const updatedRule = Object.keys(values).reduce((acc, key) => {
            if (key !== Constants.wip.fieldName && key !== 'jmix:i18n_j:invalidLanguages' && key !== jmixConditionalVisibility && !key.startsWith('RULES::')) {
                acc[key] = values[key];
            }

            return acc;
        }, {});

        updatedRule.type = rule.primaryNodeType.name;
        updatedRule.uuid = rule.uuid;

        // Real backend save of the updated condition.
        // onCancel (closing the edit panel) only runs on success; the error is notified
        // inside saveConditions so the panel stays open for the user to retry.
        saveConditions({
            updatedConditions: [buildUpdatedCondition(updatedRule)],
            isMatchingAllConditions
        }).then(() => {
            onCancel();
        }).catch(() => {});
    }, [rule, saveConditions, isMatchingAllConditions, onCancel]);

    return (
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
            <Paper elevation={4}>
                <div className={styles.column}>
                    <NewRule type={rule.primaryNodeType.name} node={rule}/>
                    <div className={styles.rowEnd}>
                        <Button
                            size="big"
                            label={t('jcontent:label.cancel')}
                            onClick={() => {
                                onCancel();
                            }}/>
                        <SaveEditedRuleButton/>
                    </div>
                </div>
            </Paper>
        </Formik>
    );
};

EditRule.propTypes = {
    rule: PropTypes.any,
    isMatchingAllConditions: PropTypes.bool,
    saveConditions: PropTypes.func.isRequired,
    onCancel: PropTypes.any
};
