import React, {useCallback} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {Button} from '@jahia/moonstone';
import {Paper} from '@material-ui/core';
import {Formik, useFormikContext} from 'formik';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {NewRule} from './NewRule';
import {SaveEditedRuleButton} from './SaveEditedRuleButton';
import {jmixConditionalVisibility} from './utils';
import styles from './DateTime.scss';
import {dayjs} from 'date-formatter';

export const EditRule = ({rule, onCancel}) => {
    const {t} = useTranslation('jcontent');
    const formikContext = useFormikContext();
    console.debug('Editing rule', rule);

    // Determine if this is a new rule (from RULES::new) or an existing rule
    const isNewRule = !rule.properties;

    // Build initial values based on rule structure
    let initialValues;
    if (isNewRule) {
        // For new rules, extract all properties except metadata fields
        initialValues = Object.keys(rule).reduce((acc, key) => {
            if (key !== 'type' && key !== 'uuid' && key !== 'username' && key !== 'timestamp') {
                acc[key] = rule[key];
            }

            return acc;
        }, {});
    } else {
        // For existing rules, use the properties array
        initialValues = rule.properties.filter(prop => prop.name !== 'jcr:primaryType' && prop.name !== 'jcr:uuid').reduce((acc, prop) => {
            acc[prop.name] = prop.values === null ? prop.value : prop.values;
            // Check if we have an update rule with the same uuid if yes use this value instead
            const updatedRules = formikContext.values['RULES::updated'] || [];
            const updatedRule = updatedRules.find(r => r.uuid === rule.uuid);
            if (updatedRule) {
                acc[prop.name] = updatedRule[prop.name] === undefined ? acc[prop.name] : updatedRule[prop.name];
            }

            return acc;
        }, {});
    }

    const handleSubmit = useCallback(values => {
        console.debug('Submitting form with values', values, 'and initialValues', initialValues, ' for rule', rule);
        const updatedRule = Object.keys(values).reduce((acc, key) => {
            if (key !== Constants.wip.fieldName && key !== 'jmix:i18n_j:invalidLanguages' && key !== jmixConditionalVisibility && !key.startsWith('RULES::')) {
                acc[key] = values[key];
            }

            return acc;
        }, {});

        // Get the rule type from the appropriate source
        updatedRule.type = isNewRule ? rule.type : rule.primaryNodeType.name;
        updatedRule.uuid = rule.uuid;
        updatedRule.timestamp = dayjs().toISOString();
        updatedRule.username = window.contextJsParameters.user.fullname;

        if (isNewRule) {
            // For new rules, update RULES::new instead of RULES::updated
            const prevNewRules = formikContext.values['RULES::new'] || [];
            const existingRuleIndex = prevNewRules.findIndex(r => r.uuid === rule.uuid);
            const nextNewRules = existingRuleIndex === -1 ?
                prevNewRules :
                prevNewRules.map((r, i) => i === existingRuleIndex ? updatedRule : r);

            formikContext.setFieldValue('RULES::new', nextNewRules).then(() => {
                onCancel();
            });
        } else {
            // For existing rules, update RULES::updated
            const prevUpdatedRules = formikContext.values['RULES::updated'] || [];
            const existingRuleIndex = prevUpdatedRules.findIndex(r => r.uuid === rule.uuid);
            const nextUpdatedRules = existingRuleIndex === -1 ?
                [...prevUpdatedRules, updatedRule] :
                prevUpdatedRules.map((r, i) => i === existingRuleIndex ? updatedRule : r);

            formikContext.setFieldValue('RULES::updated', nextUpdatedRules).then(() => {
                onCancel();
            });
        }
    }, [formikContext, initialValues, isNewRule, onCancel, rule]);

    return (
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
            <Paper elevation={4}>
                <div className={styles.column}>
                    <NewRule type={isNewRule ? rule.type : rule.primaryNodeType.name} node={rule}/>
                    <div className={styles.rowEnd}>
                        <Button
                            size="big"
                            label={t('jcontent:label.cancel')}
                            onClick={() => {
                                onCancel();
                            }}/>
                        <SaveEditedRuleButton onCancel={onCancel}/>
                    </div>
                </div>
            </Paper>
        </Formik>
    );
};

EditRule.propTypes = {
    rule: PropTypes.any,
    onCancel: PropTypes.any
};
