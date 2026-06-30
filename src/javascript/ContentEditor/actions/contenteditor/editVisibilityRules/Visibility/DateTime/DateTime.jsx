import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {Add, Chip, Dropdown, Hidden, Typography, Visibility} from '@jahia/moonstone';
import {Paper} from '@material-ui/core';
import {Formik} from 'formik';
import stylesFieldset from '~/ContentEditor/editorTabs/EditPanelContent/FormBuilder/FieldSet/FieldSet.scss';
import {AddNewRule} from './AddNewRule';
import {EditRule} from './EditRule';
import {DatatableRules} from './DatatableRules';
import {ButtonRenderer} from './ButtonRenderers';
import {filterRegularFieldSets} from './utils';
import {useSaveVisibilityRules} from './useSaveVisibilityRules';
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

const DateTimeContent = ({rules, refresh, node, lang, isMatchingAllConditions, isVisible, isVisibleInLive, sections}) => {
    const {t} = useTranslation('jcontent');
    const [isAddingNewRule, setIsAddingNewRule] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [isMatchingAllConditionsUpdate, setIsMatchingAllConditionsUpdate] = useState(isMatchingAllConditions);
    const saveConditions = useSaveVisibilityRules({uuid: node.uuid, lang, refresh});
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

    const handleSetIsMachingAllConditionUpdate = value => {
        if (value !== isMatchingAllConditionsUpdate) {
            setIsMatchingAllConditionsUpdate(value);
            // Error notification is handled inside saveConditions; revert the optimistic toggle on failure.
            saveConditions({isMatchingAllConditions: value}).catch(() => {
                setIsMatchingAllConditionsUpdate(isMatchingAllConditionsUpdate);
            });
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

    if (rulesCount === 0 && !isAddingNewRule) {
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
                        <ButtonRenderer buttonLabel={t('jcontent:label.contentEditor.visibilityTab.conditions.add')}
                                        buttonIcon={<Add/>}
                                        onClick={handleChange}/>
                    </div>
                </Paper>
            </article>
        );
    }

    if (isAddingNewRule) {
        return (
            <article>
                <Header/>
                <AddNewRule node={node}
                            isMatchingAllConditions={isMatchingAllConditionsUpdate}
                            saveConditions={saveConditions}
                            onCancel={handleChange}/>
            </article>
        );
    }

    const isEditing = editingRule !== null;
    // While editing a condition, keep only the edited row visible underneath the edition panel
    // (the other rows are hidden); otherwise show all the rules.
    const tableRules = isEditing ?
        {...rules, nodes: rules.nodes.filter(rule => rule.uuid === editingRule.uuid)} :
        rules;

    const data = ['true', 'false'].map(v => ({
        value: v,
        label: v === 'true' ? t('jcontent:label.contentEditor.visibilityTab.conditions.allrules') : t('jcontent:label.contentEditor.visibilityTab.conditions.anyrule')
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
                            value={isMatchingAllConditionsUpdate ? 'true' : 'false'}
                            size="medium"
                            variant="outlined"
                            data-sel-role="condition-matching"
                            data={data}
                            onChange={(e, item) => handleSetIsMachingAllConditionUpdate(item.value === 'true')}
                        />
                    </div>
                </div>
            </div>
            {/* When editing a condition, show the edition panel on top of the (single) row being edited. */}
            {isEditing &&
                <EditRule rule={editingRule}
                          isMatchingAllConditions={isMatchingAllConditionsUpdate}
                          saveConditions={saveConditions}
                          onCancel={() => setEditingRule(null)}/>}
            <Paper elevation={4}>
                <DatatableRules rules={tableRules}
                                refresh={refresh}
                                hideActions={isEditing}
                                onEdit={setEditingRule}/>
                {!isEditing &&
                    <>
                        <div className={styles.row}>
                            <ButtonRenderer buttonLabel={t('jcontent:label.contentEditor.visibilityTab.conditions.add')}
                                            buttonIcon={<Add/>}
                                            onClick={handleChange}/>
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
                    </>}
            </Paper>
        </article>
    );
};

DateTimeContent.propTypes = {
    rules: PropTypes.object.isRequired,
    refresh: PropTypes.func.isRequired,
    node: PropTypes.object.isRequired,
    lang: PropTypes.string.isRequired,
    isMatchingAllConditions: PropTypes.bool.isRequired,
    isVisible: PropTypes.bool.isRequired,
    isVisibleInLive: PropTypes.bool.isRequired,
    sections: PropTypes.array
};

export const DateTime = props => (
    // Own Formik context holding the in-progress fields of a new rule being added.
    // Editing an existing rule uses its own nested Formik (see EditRule).
    <Formik initialValues={{}} onSubmit={() => {}}>
        <DateTimeContent {...props}/>
    </Formik>
);

DateTime.propTypes = DateTimeContent.propTypes;
