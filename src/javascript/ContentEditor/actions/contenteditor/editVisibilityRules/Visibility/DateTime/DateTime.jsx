import React, {useCallback, useEffect, useState} from 'react';
import styles from './DateTime.scss';
import {getButtonRenderer} from '~/ContentEditor/utils';
import {useTranslation} from 'react-i18next';
import stylesFieldset from '~/ContentEditor/editorTabs/EditPanelContent/FormBuilder/FieldSet/FieldSet.scss';
import {
    Add,
    Button,
    Delete,
    Dropdown,
    Edit,
    Table,
    TableBody,
    TableHead,
    TableHeadCell,
    TableRow,
    Typography
} from '@jahia/moonstone';
import PropTypes from 'prop-types';
import {Formik, useFormikContext} from "formik";
import {useCreatableNodetypesTree} from "~/ContentEditor/actions/jcontent/createContent/createContent.utils";
import {useContentEditorConfigContext} from "~/ContentEditor/contexts";
import {Constants} from "~/ContentEditor/ContentEditor.constants";
import {useQuery} from "@apollo/client";
import {useSelector} from "react-redux";
import {CreateFormQuery} from "~/ContentEditor/ContentEditor/create.gql-queries";
import {FieldContainer} from "~/ContentEditor/editorTabs/EditPanelContent/FormBuilder/Field";
import {Paper, TableCell} from "@material-ui/core";


const jmixConditionalVisibility = 'jmix:conditionalVisibility';

const EditButton = getButtonRenderer({
    defaultButtonProps: {
        variant: 'ghost',
        size: 'default',
        color: 'default'
    }
});

const DeleteButton = getButtonRenderer({
    defaultButtonProps: {
        variant: 'ghost',
        size: 'default',
        color: 'danger'
    }
});

const RefreshButton = getButtonRenderer({
    labelStyle: 'none',
    defaultButtonProps: {
        size: 'small',
        color: 'accent'
    }
});

const filterRegularFieldSets = fieldSets => {
    const showFieldSet = fieldSet => {
        if (!fieldSet || fieldSet.name !== jmixConditionalVisibility) {
            return false;
        }

        if (fieldSet.dynamic && !fieldSet.hasEnableSwitch && !fieldSet.activated) {
            return false;
        }

        // We must hide fieldSet in the section when the fieldSet is not dynamic and
        // the fieldSet doesn't contain any fields (empty).
        return fieldSet.dynamic || fieldSet.fields.length > 0;
    };

    return fieldSets.filter(fs => showFieldSet(fs));
};

const render = (props, t) => {
    return (
        <div className={styles.row}>
            <Typography>{props.typo}</Typography>
            <EditButton {...props}
                        buttonLabel={t('jcontent:label.contentManager.editAction')}
                        buttonIcon={<Edit/>}
            />
        </div>
    );
}

const ButtonRenderer = getButtonRenderer({
    defaultButtonProps: {
        variant: 'outlined',
        size: 'big',
        color: 'accent'
    }
});

const NewRule = ({type, node}) => {
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
    )
}

NewRule.propTypes = {
    type: PropTypes.string,
    node: PropTypes.object
};


const AddNewRule = ({node, onCancel}) => {
    const {uilang} = useContentEditorConfigContext();
    const {t} = useTranslation('jcontent');
    const name = 'rule';
    const excludedNodeTypes = ['jmix:studioOnly', 'jmix:hiddenType'];
    const showOnNodeTypes = ['jmix:conditionalVisibility'];
    const {loadingTypes, error, nodetypes: nodeTypesTree} = useCreatableNodetypesTree({
        nodeTypes: "jnt:condition",
        childNodeName: name,
        includeSubTypes: true,
        path: node.path,
        uilang,
        excludedNodeTypes,
        showOnNodeTypes
    });
    const formikContext = useFormikContext();
    const [selectedType, setSelectedType] = useState(null);
    const [data, setData] = useState([]);

    useEffect(() => {
        if (!loadingTypes && nodeTypesTree) {
            const data = nodeTypesTree.flatMap(type => ({
                value: type.name,
                label: type.label
            })).sort((a, b) => a.label.localeCompare(b.label));
            setData(data);
            setSelectedType(data.length > 0 ? data[0].value : null);
        }
    }, [nodeTypesTree, loadingTypes]);

    if (loadingTypes) {
        return <Typography>{t('jcontent:label.contentEditor.visibilityTab.conditions.loading')}</Typography>;
    }
    console.debug('Node types tree for node', node, 'is', nodeTypesTree);

    return (
        <Paper elevation={4}>
            <div className={styles.column}>
                <Typography variant="body" weight="bold">
                    {t('jcontent:label.contentEditor.visibilityTab.conditions.type')}
                </Typography>
                <Typography variant="caption">
                    {t('jcontent:label.contentEditor.visibilityTab.conditions.typeDescription')}
                </Typography>
                <Dropdown
                    value={selectedType}
                    variant="outlined"
                    size="medium"
                    data-sel-role="condition-type"
                    data={data}
                    onChange={(e, item) => setSelectedType(item.value)}
                />
                {selectedType !== null &&
                    <>
                        <NewRule type={selectedType} node={node}/>
                        <div className={styles.rowEnd}>
                            <Button
                                size="big"
                                label={t('jcontent:label.contentEditor.close')}
                                onClick={() => {
                                    setSelectedType(null);
                                    onCancel();
                                }}/>
                            <Button size="big" label="Add" onClick={() => {
                                // All the new rules value have been saved in formik values we need to group them and move them under a value named RULES::new,
                                // each of these new rules should contain all the properties of formik.values apart RULES::new,WIP::Info,jmix:i18n_j:invalidLanguages and jmix:conditionalVisibility
                                const newRule = Object.keys(formikContext.values).reduce((acc, key) => {
                                    if (key !== Constants.wip.fieldName && key !== 'jmix:i18n_j:invalidLanguages' && key !== jmixConditionalVisibility && !key.startsWith('RULES::')) {
                                        acc[key] = formikContext.values[key];
                                        formikContext.setFieldValue(key, undefined);
                                    }
                                    return acc;
                                }, {});
                                if (Object.keys(newRule).length === 0) {
                                    setSelectedType(null);
                                    onCancel();
                                    return;
                                }
                                newRule.type = selectedType;
                                const newRules = formikContext.values['RULES::new'] || [];
                                newRules.push(newRule);
                                formikContext.setFieldValue('RULES::new', newRules).then(() => {
                                    setSelectedType(null);
                                    onCancel();
                                });
                            }}/>
                        </div>
                    </>
                }
            </div>
        </Paper>
    )
}

AddNewRule.propTypes = {
    node: PropTypes.object,
    onCancel: PropTypes.func
};

const RenderCondition = ({rule, updateRules, isNew}) => {
    function getTypography(prop) {
        // Check if there is an updated rule with rule.uuid in updateRules if yes get the value of the property from this rule instead of the one from the original rule
        const updatedRule = updateRules ? updateRules.find(r => r.uuid === rule.uuid) : null;
        const value = updatedRule && updatedRule[prop.name] !== undefined ? updatedRule[prop.name] : (prop.values !== null ? prop.values : prop.value);
        if (Array.isArray(value)) {
            return value.join(', ');
        }
        return value;
    }

    if (isNew) {
        return <div className={styles.row}>
            {Object.keys(rule).filter(key => key !== 'type').map(key => {
                return (
                    <div key={key} className={styles.row}>
                        <Typography variant="caption">{key}:</Typography>
                        <Typography>{rule[key]}</Typography>
                    </div>
                );
            })}
        </div>;
    }

    return <div className={styles.row}>
        {rule.properties.map(prop => {
            if (prop.name !== 'jcr:primaryType' && prop.name !== 'jcr:uuid') {
                return (
                    <div key={prop.name} className={styles.row}>
                        <Typography variant="caption">{prop.name}:</Typography>
                        <Typography>{getTypography(prop)}</Typography>
                    </div>
                );
            }
            return null;
        })}
    </div>;
}

RenderCondition.propTypes = {updateRules: PropTypes.array, rule: PropTypes.object, isNew: PropTypes.bool};

const RulesList = ({rules, onEdit}) => {
    const formikContext = useFormikContext();

    const newRules = formikContext.values['RULES::new'];
    const updatedRules = formikContext.values['RULES::updated'];
    const deletedRules = formikContext.values['RULES::deleted'];
    // rules.node contains all the rules on the current node, let's render it using paper and table from material ui and moonstone
    return (<div className={styles.column}>
        <div className="flexRow">
            <Typography variant="subheading" weight="bold">
                Existing condition
            </Typography>
        </div>
        <Paper elevation={8} style={{minWidth:"100%"}}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableHeadCell>Source</TableHeadCell>
                        <TableHeadCell>Type</TableHeadCell>
                        <TableHeadCell>State</TableHeadCell>
                        <TableHeadCell>Action</TableHeadCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rules.nodes.filter(rule => {
                        return (deletedRules === undefined || !deletedRules.includes(rule.uuid))
                    }).map((rule, index) => {
                        return (
                            <TableRow key={index}>
                                <TableCell>{rule.aggregatedPublicationInfo.existsInLive ? "Live" : "Edit"}</TableCell>
                                <TableCell>{rule.primaryNodeType.name}</TableCell>
                                <TableCell><RenderCondition rule={rule} updateRules={updatedRules}/></TableCell>
                                <TableCell>
                                    <EditButton buttonIcon={<Edit/>} onClick={() => {
                                        onEdit(rule);
                                    }}/>
                                    <DeleteButton buttonIcon={<Delete/>} onClick={() => {
                                        const deletedRules = formikContext.values['RULES::deleted'] || [];
                                        deletedRules.push(rule.uuid);
                                        // if the rule is already in updated rules we need to remove it from there
                                        const updatedRules = formikContext.values['RULES::updated'] || [];
                                        const newUpdatedRules = updatedRules.filter(r => r.uuid !== rule.uuid);
                                        formikContext.setFieldValue('RULES::updated', newUpdatedRules).then(() => {
                                            formikContext.setFieldValue('RULES::deleted', deletedRules);
                                        });
                                    }}/>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                    {newRules !== undefined && newRules.map((rule, index) => {
                        return (
                            <TableRow key={index}>
                                <TableCell>New</TableCell>
                                <TableCell>{rule.type}</TableCell>
                                <TableCell><RenderCondition rule={rule} isNew={true}/></TableCell>
                                <TableCell>
                                    <EditButton buttonIcon={<Edit/>} onClick={() => {
                                        onEdit(rule)
                                    }}/>
                                    <DeleteButton buttonIcon={<Delete/>} onClick={() => {
                                        const newRules = formikContext.values['RULES::new'] || [];
                                        const updatedNewRules = newRules.filter(r => r !== rule);
                                        formikContext.setFieldValue('RULES::new', updatedNewRules);
                                    }}/>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </Paper>
    </div>)
        ;
}

RulesList.propTypes = {
    rules: PropTypes.object,
    onEdit: PropTypes.func
};

const SaveEditedRuleButton = (onCancel) => {
    const formikContext = useFormikContext();
    const {t} = useTranslation('jcontent');
    return <Button size="big" label={t('jcontent:label.ok')} onClick={() => {
        formikContext.submitForm();
    }}/>;
}

const EditRule = ({rule, onSave, onCancel}) => {
    const {uilang} = useContentEditorConfigContext();
    const {t} = useTranslation('jcontent');
    const formikContext = useFormikContext();
    console.debug('Editing rule', rule);
    // Add all the properties of rules inside formikContext initialValues as an object apart ("jcr:primaryType" and "jcr:uuid") with the format prop.name : prop.value
    const initialValues = rule.properties.filter(prop => prop.name !== 'jcr:primaryType' && prop.name !== 'jcr:uuid').reduce((acc, prop) => {
        acc[prop.name] = prop.values !== null ? prop.values : prop.value;
        // Check if we have an update rule with the same uuid a rule.uuid if yes use this value instead
        const updatedRules = formikContext.values['RULES::updated'] || [];
        const updatedRule = updatedRules.find(r => r.uuid === rule.uuid);
        if (updatedRule) {
            acc[prop.name] = updatedRule[prop.name] !== undefined ? updatedRule[prop.name] : acc[prop.name];
        }
        return acc;
    }, {});

    const handleSubmit = useCallback((values, actions) => {
        console.debug('Submitting form with values', values, 'and initialValues', initialValues, ' for rule', rule);
        const updatedRule = Object.keys(values).reduce((acc, key) => {
            if (key !== Constants.wip.fieldName && key !== 'jmix:i18n_j:invalidLanguages' && key !== jmixConditionalVisibility && !key.startsWith('RULES::')) {
                acc[key] = values[key];
            }
            return acc;
        }, {});
        updatedRule.type = rule.primaryNodeType.name;
        updatedRule.uuid = rule.uuid;
        const newRules = formikContext.values['RULES::updated'] || [];
        // if new rules contains already an object with the same uuid replace it
        const existingRuleIndex = newRules.findIndex(r => r.uuid === rule.uuid);
        if (existingRuleIndex !== -1) {
            newRules[existingRuleIndex] = updatedRule;
        } else {
            newRules.push(updatedRule);
        }
        formikContext.setFieldValue('RULES::updated', newRules).then(() => {
            onCancel();
        });
    });

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
                        <SaveEditedRuleButton onCancel={onCancel}/>
                    </div>
                </div>
            </Paper>
        </Formik>);
}

EditRule.propTypes = {
    rule: PropTypes.any,
    onCancel: PropTypes.any,
    onSave: PropTypes.any
};
export const DateTime = ({rules, refresh, node, isMatchingAllConditions, sections}) => {
    const {t} = useTranslation('jcontent');
    const section = sections.filter(s => s.name === 'visibility');
    const fieldSets = filterRegularFieldSets(section[0].fieldSets);
    const rulesCount = rules.pageInfo.totalCount;
    const [isAddingNewRule, setIsAddingNewRule] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [isMatchingAllConditionsUpdate, setIsMatchingAllConditionsUpdate] = useState(isMatchingAllConditions)
    const formikContext = useFormikContext();

    if (fieldSets.length === 0) {
        return null;
    }

    const handleChange = () => {
        setIsAddingNewRule(!isAddingNewRule);
    };

    const handleClick = () => {
        refresh();
    };

    const handleChangeEditingRule = () => {
        setEditingRule(null);
        refresh();
    }

    const handleSavingEditedRule = () => {
        setEditingRule(null);
        refresh();
    }

    const handleSetIsMachingAllConditionUpdate = (value) => {
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

    const prepareFieldset = {
        ...fieldSets[0],
        displayName: t('jcontent:label.contentEditor.visibilityTab.conditions.title')
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
    } else if (isAddingNewRule) {
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
    } else if (editingRule !== null) {
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
    } else {
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
                    <RulesList rules={rules} onEdit={setEditingRule}/>
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
    }
};

DateTime.propTypes = {
    rules: PropTypes.object.isRequired,
    refresh: PropTypes.func.isRequired,
    node: PropTypes.object.isRequired,
    isMatchingAllConditions: PropTypes.bool.isRequired,
    sections: PropTypes.array
};
