import React, {useEffect, useMemo, useState} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {Button, Dropdown, Typography} from '@jahia/moonstone';
import {Paper} from '@material-ui/core';
import {useFormikContext} from 'formik';
import {useCreatableNodetypesTree} from '~/ContentEditor/actions/jcontent/createContent/createContent.utils';
import {useContentEditorConfigContext} from '~/ContentEditor/contexts';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {NewRule} from './NewRule';
import {buildNewCondition, jmixConditionalVisibility} from './utils';
import styles from './DateTime.scss';

export const AddNewRule = ({node, isMatchingAllConditions, saveConditions, onCancel}) => {
    const {uilang} = useContentEditorConfigContext();
    const {t} = useTranslation('jcontent');
    const name = 'rule';
    const excludedNodeTypes = ['jmix:studioOnly', 'jmix:hiddenType'];
    const showOnNodeTypes = ['jmix:conditionalVisibility'];
    const {loadingTypes, nodetypes: nodeTypesTree} = useCreatableNodetypesTree({
        nodeTypes: 'jnt:condition',
        childNodeName: name,
        includeSubTypes: true,
        path: node.path,
        uilang,
        excludedNodeTypes,
        showOnNodeTypes
    });
    const formikContext = useFormikContext();
    const [selectedType, setSelectedType] = useState(null);

    const data = useMemo(() => {
        if (loadingTypes || !nodeTypesTree) {
            return [];
        }

        return nodeTypesTree.flatMap(type => ({
            value: type.name,
            label: type.label
        })).sort((a, b) => a.label.localeCompare(b.label));
    }, [nodeTypesTree, loadingTypes]);

    // Side effect: initialise selectedType whenever the derived data changes
    useEffect(() => {
        if (data.length > 0) {
            setSelectedType(data[0].value);
        }
    }, [data]);

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
                            <Button size="big"
                                    color="accent"
                                    label={t('jcontent:label.contentEditor.edit.action.goBack.btnSave')}
                                    onClick={() => {
                                // Collect the new rule field values held in the Formik context (everything
                                // apart from the WIP/languages/conditionalVisibility helper keys).
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
                                // Real backend save of the new condition.
                                // Reset and close only on success; the error is notified
                                // inside saveConditions so the panel stays open to retry.
                                saveConditions({
                                    newConditions: [buildNewCondition(newRule)],
                                    isMatchingAllConditions
                                }).then(() => {
                                    setSelectedType(null);
                                    onCancel();
                                }).catch(() => {});
                            }}/>
                        </div>
                    </>}
            </div>
        </Paper>
    );
};

AddNewRule.propTypes = {
    node: PropTypes.object,
    isMatchingAllConditions: PropTypes.bool,
    saveConditions: PropTypes.func.isRequired,
    onCancel: PropTypes.func
};
