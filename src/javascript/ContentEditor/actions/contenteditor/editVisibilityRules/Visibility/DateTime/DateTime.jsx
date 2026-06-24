import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {Add, Chip, Dropdown, Hidden, Typography, Visibility} from '@jahia/moonstone';
import {Paper} from '@material-ui/core';
import {useFormikContext} from 'formik';
import stylesFieldset from '~/ContentEditor/editorTabs/EditPanelContent/FormBuilder/FieldSet/FieldSet.scss';
import {AddNewRule} from './AddNewRule';
import {EditRule} from './EditRule';
import {DatatableRules} from './DatatableRules';
import {ButtonRenderer} from './ButtonRenderers';
import {filterRegularFieldSets, jmixConditionalVisibility} from './utils';
import styles from './DateTime.scss';

const Header = () => {
    const {t} = useTranslation('jcontent');
    return (
        <div className={stylesFieldset.fieldSetTitleContainer}>
            <div className="flexRow_nowrap">
                <div className="flexCol">
                    <Typography component="label"
                                htmlFor="jmix:i18n"
                                className={stylesFieldset.fieldSetTitle}
                                variant="subheading"
                                weight="bold"
                    >
                        {t('jcontent:label.contentEditor.visibilityTab.conditions.title')}
                    </Typography>
                </div>
            </div>
        </div>
    );
};

export const DateTime = ({rules, refresh, node, isMatchingAllConditions, isVisible, isVisibleInLive, sections}) => {
    const {t} = useTranslation('jcontent');
    const [isAddingNewRule, setIsAddingNewRule] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [isMatchingAllConditionsUpdate, setIsMatchingAllConditionsUpdate] = useState(isMatchingAllConditions);
    const formikContext = useFormikContext();
    const section = sections.find(s => s.name === 'visibility');
    if (!section) {
        return null;
    }

    const fieldSets = filterRegularFieldSets(section.fieldSets);
    const rulesCount = rules.pageInfo.totalCount;

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
                <Header/>
                <Paper elevation={4}>
                    <div className={styles.nocondition}>
                        <div className="flexRow_nowrap margin-medium">
                            <Typography component="label"
                                        htmlFor="jmix:i18n"
                                        className={stylesFieldset.fieldSetTitle}
                                        variant="body"
                                        weight="semiBold"
                            >
                                {typo}
                            </Typography>
                        </div>
                        <ButtonRenderer buttonLabel="Add condition"
                                        buttonIcon={<Add/>}
                                        onClick={() => {
                                            formikContext.setFieldValue(jmixConditionalVisibility, true).then(() => {
                                                handleChange();
                                            });
                                        }}/>
                    </div>
                </Paper>
            </article>
        );
    }

    if (isAddingNewRule) {
        return (
            <article>
                <Header/>
                <AddNewRule node={node} onCancel={handleChange}/>
            </article>
        );
    }

    if (editingRule !== null) {
        return (
            <article>
                <Header/>
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
                                    variant="subheading"
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
                <div className={styles.row}>
                    <ButtonRenderer buttonLabel={t('jcontent:label.contentEditor.visibilityTab.conditions.add')}
                                    buttonIcon={<Add/>}
                                    onClick={() => {
                                        formikContext.setFieldValue(jmixConditionalVisibility, true).then(() => {
                                            handleChange();
                                        });
                                    }}/>
                </div>
                <div className={styles.row}>
                    <Typography
                        variant="body"
                        weight="bold"
                    >{t('jcontent:label.contentEditor.visibilityTab.conditions.preview')}
                    </Typography>
                    {isVisible && <Chip icon={<Visibility/>}
                                        color="success"
                                        label={t('jcontent:label.contentEditor.visibilityTab.conditions.visible')}/>}
                    {!isVisible && <Chip icon={<Hidden/>}
                                         color="warning"
                                         label={t('jcontent:label.contentEditor.visibilityTab.conditions.hidden')}/>}
                    <Typography
                        variant="body"
                        weight="bold"
                    >{t('jcontent:label.contentEditor.visibilityTab.conditions.live')}
                    </Typography>
                    {isVisibleInLive && <Chip icon={<Visibility/>}
                                              color="success"
                                              label={t('jcontent:label.contentEditor.visibilityTab.conditions.visible')}/>}
                    {!isVisibleInLive && <Chip icon={<Hidden/>}
                                               color="warning"
                                               label={t('jcontent:label.contentEditor.visibilityTab.conditions.hidden')}/>}
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
    isVisible: PropTypes.bool.isRequired,
    isVisibleInLive: PropTypes.bool.isRequired,
    sections: PropTypes.array
};

