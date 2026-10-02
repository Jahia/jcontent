import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {Dialog, DialogActions, DialogTitle} from '@material-ui/core';
import {Input} from '@jahia/design-system-kit';
import {Button, Search, Typography, TreeView} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {useMutation} from '@apollo/client';
import copyPasteQueries from '~/JContent/actions/copyPaste/copyPaste.gql-mutations';
import {triggerRefetchAll} from '~/JContent/JContent.refetches';
import {useSamplesForType} from '~/JContent/samples';

import {filterTree, isOpenableEntry} from './ContentTypeSelectorModal.utils';
import {SamplePreview} from './SamplePreview';
import styles from './ContentTypeSelectorModal.scss';

const addContentTypeHtmlAnnotationsToTree = nodeTypesTree => {
    const addContentTypeHtmlAnnotationsToNode = node => {
        const typeName = node?.nodeType?.name;
        const children = node?.children?.map(addContentTypeHtmlAnnotationsToNode);
        return {
            ...node,
            children,
            treeItemProps: {
                'data-sel-role': 'content-type-tree-item',
                'data-sel-content-type': typeName
            }
        };
    };

    return nodeTypesTree?.map(addContentTypeHtmlAnnotationsToNode);
};

export const ContentTypeSelectorModal = ({nodeTypesTree, isOpen, parentUuid, onExited, onClose, onCreateContent}) => {
    const {t} = useTranslation('jcontent');
    const [selectedType, setSelectedType] = useState(null);
    const [filter, setFilter] = useState();
    const [selectedSamplePath, setSelectedSamplePath] = useState(null);
    const [pasteNode] = useMutation(copyPasteQueries.pasteNode);

    const selectedTypeName = selectedType?.nodeType?.name;
    const {samples, previewPagePath, loading: samplesLoading} = useSamplesForType({parentUuid, nodeType: selectedTypeName});
    const selectedSample = samples.find(sample => sample.path === selectedSamplePath) ?? samples[0];

    // Filtering the tree
    const filteredTree = filterTree(nodeTypesTree, selectedType, filter);
    const annotatedFilteredTree = addContentTypeHtmlAnnotationsToTree(filteredTree);

    const selectType = item => {
        setSelectedType(item);
        // The previously chosen sample belongs to the previous type.
        setSelectedSamplePath(null);
    };

    const handleUseSample = () => {
        // Inserting a sample is a copy-paste of it, so the author gets a filled node to edit rather
        // than an empty form. Failure closes the dialog like any other outcome: the node simply is
        // not there, and the console carries the reason.
        pasteNode({variables: {pathOrId: selectedSample.path, destParentPathOrId: parentUuid}})
            .then(() => {
                triggerRefetchAll();
            })
            .catch(e => {
                console.error('Error when inserting a sample', e.message);
            })
            .finally(() => {
                onClose();
            });
    };

    return (
        <Dialog classes={{paper: styles.modalRoot}} open={isOpen} aria-labelledby="dialog-createNewContent" onExited={onExited} onClose={onClose}>
            <DialogTitle className={styles.dialogTitle} id="dialog-createNewContent">
                <Typography variant="heading">
                    {t('jcontent:label.contentEditor.CMMActions.createNewContent.labelModal')}
                </Typography>
            </DialogTitle>

            <Input
                autoFocus
                data-sel-role="content-type-dialog-input"
                placeholder={t('jcontent:label.contentEditor.CMMActions.createNewContent.filterLabel')}
                className={styles.filterInput}
                variant={{interactive: <Search/>}}
                onChange={e => {
                    setFilter(e.target.value.toLowerCase());
                    selectType(null);
                }}
            />

            <div className={styles.panes}>
                <div className={styles.treeContainer} data-sel-role="content-type-tree">
                    <TreeView
                        data={annotatedFilteredTree}
                        selectedItems={selectedType ? [selectedType.id] : []}
                        openedItems={filter ? annotatedFilteredTree.map(n => n.id) : undefined}
                        onClickItem={(item, ev, toggle) => {
                            if (!isOpenableEntry(item)) {
                                selectType(item);
                            } else if (!filter) {
                                if (selectedType && selectedType.parent.id === item.id) {
                                    selectType(null);
                                }

                                toggle();
                            }
                        }}
                        onDoubleClickItem={item => {
                            if (!isOpenableEntry(item)) {
                                onCreateContent(item);
                            }
                        }}
                    />
                </div>

                <SamplePreview
                    samples={samples}
                    previewPagePath={previewPagePath}
                    selectedSample={selectedSample}
                    isLoading={samplesLoading}
                    hasSelectedType={Boolean(selectedTypeName)}
                    onSelectSample={setSelectedSamplePath}
                />
            </div>

            <DialogActions>
                <Button
                    data-sel-role="content-type-dialog-cancel"
                    variant="outlined"
                    size="big"
                    label={t('jcontent:label.contentEditor.CMMActions.createNewContent.btnDiscard')}
                    onClick={onClose}
                />
                <Button
                    data-sel-role="content-type-dialog-use-sample"
                    variant="outlined"
                    size="big"
                    isDisabled={!selectedSample}
                    label={t('jcontent:label.contentEditor.samples.useSample')}
                    onClick={handleUseSample}
                />
                <Button
                    data-sel-role="content-type-dialog-create"
                    disabled={!selectedType}
                    color="accent"
                    size="big"
                    label={t('jcontent:label.contentEditor.samples.createEmpty')}
                    onClick={() => {
                        onCreateContent(selectedType);
                    }}
                />
            </DialogActions>
        </Dialog>
    );
};

ContentTypeSelectorModal.propTypes = {
    nodeTypesTree: PropTypes.array.isRequired,
    isOpen: PropTypes.bool.isRequired,
    parentUuid: PropTypes.string,
    onClose: PropTypes.func.isRequired,
    onExited: PropTypes.func.isRequired,
    onCreateContent: PropTypes.func.isRequired
};
