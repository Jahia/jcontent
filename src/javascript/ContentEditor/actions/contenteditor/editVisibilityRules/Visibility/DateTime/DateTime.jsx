import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {Add, Dropdown, Typography} from '@jahia/moonstone';
import {Paper} from '@material-ui/core';
import {useFormikContext} from 'formik';
import stylesFieldset from '~/ContentEditor/editorTabs/EditPanelContent/FormBuilder/FieldSet/FieldSet.scss';
import {AddNewRule} from './AddNewRule';
import {EditRule} from './EditRule';
import {DatatableRules} from './DatatableRules';
import {ButtonRenderer} from './ButtonRenderers';
import {filterRegularFieldSets, jmixConditionalVisibility} from './utils';
import styles from './DateTime.scss';

export const DateTime = ({rules, refresh, node, isMatchingAllConditions, sections}) => {
    const {t} = useTranslation('jcontent');
    const section = sections.filter(s => s.name === 'visibility');
    const fieldSets = filterRegularFieldSets(section[0].fieldSets);
    const rulesCount = rules.pageInfo.totalCount;
    const [isAddingNewRule, setIsAddingNewRule] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [isMatchingAllConditionsUpdate, setIsMatchingAllConditionsUpdate] = useState(isMatchingAllConditions);
    const formikContext = useFormikContext();

    if (fieldSets.length === 0) {
        return null;
    }

    const handleChange = () => {
        setIsAddingNewRule(!isAddingNewRule);
    };

    const handleChangeEditingRule = () => {
        setEditingRule(null);
        refresh();
    };

    const handleSavingEditedRule = () => {
        setEditingRule(null);
        refresh();
    };

    const handleSetIsMachingAllConditionUpdate = value => {
        setIsMatchingAllConditionsUpdate(value);
        if (value !== isMatchingAllConditions) {
            formikContext.setFieldValue('RULES::isMatchingAllConditions', value);
        }
    };

    let typo;
    switch (rulesCount) {
        case 0:
            typo = t('jcontent:label.contentEditor.visibilityTab.conditions.norules');
            break;
        case 1:
            typo = t('jcontent:label.contentEditor.visibilityTab.conditions.rule');
            break;
        default:
            typo = t('jcontent:label.contentEditor.visibilityTab.conditions.rules', {rulesNumber: rulesCount});
            break;
    }

    if (rulesCount === 0 && !isAddingNewRule && formikContext.values['RULES::new'] === undefined) {
        // There is no rules, show the button to create a new rule
        return (
            <article>
                <div className={stylesFieldset.fieldSetTitleContainer}>
                    <div className="flexRow_nowrap">
                        <div className="flexCol">
                            <Typography component="label"
                                        htmlFor="jmix:i18n"
                                        className={stylesFieldset.fieldSetTitle}
                                        variant="heading"
                                        weight="bold"
                            >
                                {t('jcontent:label.contentEditor.visibilityTab.conditions.title')}
                            </Typography>
                        </div>
                    </div>
                </div>
                <Paper elevation={4}>
                    <div className={styles.nocondition}>
                        <Typography>{typo}</Typography>
                        <ButtonRenderer buttonLabel="Add condition" buttonIcon={<Add/>} onClick={() => {
                            formikContext.setFieldValue(jmixConditionalVisibility, true).then(() => {
                                handleChange();
                            });
                        }}/>
                    </div>
                </Paper>
            </article>);
    }

    if (isAddingNewRule) {
        return (
            <article>
                <div className={stylesFieldset.fieldSetTitleContainer}>
                    <div className="flexRow_nowrap">
                        <div className="flexCol">
                            <Typography component="label"
                                        htmlFor="jmix:i18n"
                                        className={stylesFieldset.fieldSetTitle}
                                        variant="heading"
                                        weight="bold"
                            >
                                {t('jcontent:label.contentEditor.visibilityTab.conditions.title')}
                            </Typography>
                        </div>
                    </div>
                </div>
                <AddNewRule node={node} onCancel={handleChange}/>
            </article>
        );
    }

    if (editingRule !== null) {
        return (
            <article>
                <div className={stylesFieldset.fieldSetTitleContainer}>
                    <div className="flexRow_nowrap">
                        <div className="flexCol">
                            <Typography component="label"
                                        htmlFor="jmix:i18n"
                                        className={stylesFieldset.fieldSetTitle}
                                        variant="heading"
                                        weight="bold"
                            >
                                {t('jcontent:label.contentEditor.visibilityTab.conditions.title')}
                            </Typography>
                        </div>
                    </div>
                </div>
                <EditRule rule={editingRule} onCancel={handleChangeEditingRule} onSave={handleSavingEditedRule}/>
            </article>
        );
    }

    const data = [true, false].map(v => ({
        value: v,
        label: v ? t('jcontent:label.contentEditor.visibilityTab.conditions.allrules') : t('jcontent:label.contentEditor.visibilityTab.conditions.anyrule')
    }));
    return (
        <article>
            <div className={stylesFieldset.fieldSetTitleContainer}>
                <div className="flexRow_between">
                    <div className="flexCol">
                        <Typography component="label"
                                    htmlFor="jmix:i18n"
                                    className={stylesFieldset.fieldSetTitle}
                                    variant="heading"
                                    weight="bold"
                        >
                            {t('jcontent:label.contentEditor.visibilityTab.conditions.title')}
                        </Typography>
                    </div>
                    <div className="flexCol">
                        <Dropdown
                            className={styles.language}
                            value={isMatchingAllConditionsUpdate}
                            size="medium"
                            data-sel-role="condition-matching"
                            data={data}
                            onChange={(e, item) => handleSetIsMachingAllConditionUpdate(item.value)}
                        />
                    </div>
                </div>
            </div>
            <Paper elevation={4}>
                <DatatableRules rules={rules} onEdit={setEditingRule}/>
                <div className={styles.rowEnd}>
                    <ButtonRenderer buttonLabel="Add condition" buttonIcon={<Add/>} onClick={() => {
                        formikContext.setFieldValue(jmixConditionalVisibility, true).then(() => {
                            handleChange();
                        });
                    }}/>
                </div>
            </Paper>
        </article>
    );
};

DateTime.propTypes = {
    rules: PropTypes.object.isRequired,
    refresh: PropTypes.func.isRequired,
    node: PropTypes.object.isRequired,
    isMatchingAllConditions: PropTypes.bool.isRequired,
    sections: PropTypes.array
};

