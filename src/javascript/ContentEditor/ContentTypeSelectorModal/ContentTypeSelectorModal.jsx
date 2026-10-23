import React, {useState} from 'react';
import PropTypes from 'prop-types';
import classNames from 'clsx';
import {Dialog, DialogActions, DialogTitle} from '@material-ui/core';
import {Input} from '@jahia/design-system-kit';
import {Button, Search, Typography, TreeView} from '@jahia/moonstone';
import {registry} from '@jahia/ui-extender';
import {ErrorBoundary} from '@jahia/jahia-ui-root';
import {useTranslation} from 'react-i18next';

import {filterTree, isOpenableEntry} from './ContentTypeSelectorModal.utils';
import styles from './ContentTypeSelectorModal.scss';

export const CONTENT_TYPE_SELECTOR_PANE = 'contentEditor.contentTypeSelectorPane';

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

const accepts = (pane, context) => {
    try {
        return !pane.isEnabled || pane.isEnabled(context);
    } catch (e) {
        console.error(`The content type selector pane ${pane.key} failed in isEnabled`, e);
        return false;
    }
};

// The first registered pane that accepts this create, if any.
const findPane = context => registry.find({type: CONTENT_TYPE_SELECTOR_PANE}).find(pane => accepts(pane, context));

export const ContentTypeSelectorModal = ({nodeTypesTree, isOpen, onExited, onClose, onCreateContent, name, editorConfig, onCreated}) => {
    const {t} = useTranslation('jcontent');
    const [selectedType, setSelectedType] = useState(null);
    const [filter, setFilter] = useState();

    // Filtering the tree
    const filteredTree = filterTree(nodeTypesTree, selectedType, filter);
    const annotatedFilteredTree = addContentTypeHtmlAnnotationsToTree(filteredTree);

    const pane = findPane({name, editorConfig});
    const Pane = pane?.component;

    const tree = (
        <div className={classNames(styles.treeContainer, {[styles.treeContainerWithPane]: Pane})} data-sel-role="content-type-tree">
            <TreeView
                data={annotatedFilteredTree}
                selectedItems={selectedType ? [selectedType.id] : []}
                openedItems={filter ? annotatedFilteredTree.map(n => n.id) : undefined}
                onClickItem={(item, ev, toggle) => {
                    if (!isOpenableEntry(item)) {
                        setSelectedType(item);
                    } else if (!filter) {
                        if (selectedType && selectedType.parent.id === item.id) {
                            setSelectedType(null);
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
    );

    return (
        <Dialog classes={{paper: classNames(styles.modalRoot, {[styles.modalRootWithPane]: Pane})}} open={isOpen} aria-labelledby="dialog-createNewContent" onExited={onExited} onClose={onClose}>
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
                    setSelectedType(null);
                }}
            />

            {Pane ? (
                <div className={styles.body}>
                    {tree}
                    <div className={styles.pane} data-sel-role="content-type-selector-pane" data-sel-pane={pane.key}>
                        <ErrorBoundary>
                            <Pane selectedType={selectedType}
                                  name={name}
                                  editorConfig={editorConfig}
                                  onClose={onClose}
                                  onCreated={onCreated}/>
                        </ErrorBoundary>
                    </div>
                </div>
            ) : tree}
            <DialogActions>
                <Button
                    data-sel-role="content-type-dialog-cancel"
                    variant="outlined"
                    size="big"
                    label={t('jcontent:label.contentEditor.CMMActions.createNewContent.btnDiscard')}
                    onClick={onClose}
                />
                <Button
                    data-sel-role="content-type-dialog-create"
                    disabled={!selectedType}
                    color="accent"
                    size="big"
                    label={t('jcontent:label.contentEditor.CMMActions.createNewContent.btnCreate')}
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
    onClose: PropTypes.func.isRequired,
    onExited: PropTypes.func.isRequired,
    onCreateContent: PropTypes.func.isRequired,
    name: PropTypes.string,
    editorConfig: PropTypes.object,
    onCreated: PropTypes.func
};
