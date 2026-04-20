import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {Button, Dropdown, Typography} from '@jahia/moonstone';
import {Paper} from '@material-ui/core';
import {useFormikContext} from 'formik';
import {useCreatableNodetypesTree} from '~/ContentEditor/actions/jcontent/createContent/createContent.utils';
import {useContentEditorConfigContext} from '~/ContentEditor/contexts';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {NewRule} from './NewRule';
import {generateUUID, jmixConditionalVisibility} from './utils';
import styles from './DateTime.scss';
import dayjs from "dayjs";

export const AddNewRule = ({node, onCancel}) => {
    const {uilang} = useContentEditorConfigContext();
    const {t} = useTranslation('jcontent');
    const name = 'rule';
    const excludedNodeTypes = ['jmix:studioOnly', 'jmix:hiddenType'];
    const showOnNodeTypes = ['jmix:conditionalVisibility'];
    const {loadingTypes, nodetypes: nodeTypesTree} = useCreatableNodetypesTree({
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
                                newRule.uuid = generateUUID();
                                newRule.timestamp = dayjs().toISOString();
                                newRule.username = globalThis.contextJsParameters.user.fullname;
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
    );
};

AddNewRule.propTypes = {
    node: PropTypes.object,
    onCancel: PropTypes.func
};

