import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@material-ui/core';
import {Button, Loader} from '@jahia/moonstone';
import styles from './Delete.scss';
import {useApolloClient, useMutation, useQuery} from '@apollo/client';
import {useDispatch, useSelector} from 'react-redux';
import {DeleteQueries} from './delete.gql-queries';
import {triggerRefetchAll} from '~/JContent/JContent.refetches';
import {
    DeleteMutation,
    MarkForDeletionMutation,
    UndeleteMutation
} from '~/JContent/actions/deleteActions/Delete/delete.gql-mutation';
import InfoTable from './InfoTable';
import SvgInformation from '@jahia/moonstone/dist/icons/components/Information';
import {Info} from '~/JContent/actions/deleteActions/Delete/Info';
import {getName} from '~/JContent';
import {isPathChildOfAnotherPath} from '../../../JContent.utils';
import {useNotifications} from '@jahia/react-material';
import {cmRemoveSelection} from '~/JContent/redux/selection.redux';

const getLabel = ({dialogType, locked, count, data, firstNode, pages, folders, t}) => {
    if (locked) {
        return t(`jcontent:label.contentManager.deleteAction.locked.${dialogType}.content`, {
            count: count,
            name: data.jcr.nodesByPath.map(n => getName(n)).join(', '),
            parentName: firstNode && getName(firstNode?.rootDeletionInfo[0])
        });
    }

    if (!count) {
        return t('jcontent:label.contentManager.deleteAction.loading');
    }

    if (count === 1) {
        return t(`jcontent:label.contentManager.deleteAction.${dialogType}.item`, {
            name: firstNode && getName(firstNode)
        });
    }

    if (pages === 0 && folders === 0) {
        return t(`jcontent:label.contentManager.deleteAction.${dialogType}.itemsOnly`, {count});
    }

    if (pages === 0) {
        return t(`jcontent:label.contentManager.deleteAction.${dialogType}.filesAndFolders`, {count, folders});
    }

    return t(`jcontent:label.contentManager.deleteAction.${dialogType}.items`, {count, pages});
};

const DeleteContent = ({data, onClose, isLoading, isMutationLoading, dialogType, onAction, paths, setInfoOpen}) => {
    const {t} = useTranslation('jcontent');

    const firstNode = data?.jcr?.nodesByPath[0];
    const pages = data?.jcr?.nodesByPath?.reduce((_count, node) => _count + (node.pages.pageInfo.totalCount + (node.isPage ? 1 : 0)), 0);
    const folders = data?.jcr?.nodesByPath?.reduce((_count, node) => _count + (node.folders.pageInfo.totalCount + (node.isFolder ? 1 : 0)), 0);
    const count = data?.jcr?.nodesByPath?.reduce((_count, node) =>
        _count + (node.content.pageInfo.totalCount + (!node.isPage && !node.isFolder ? 1 : 0)), 0) + pages + folders || 0;
    const locked = firstNode?.isMarkedForDeletion && !firstNode?.isMarkedForDeletionRoot;
    const hasUsages = dialogType !== 'undelete' &&
        data?.jcr?.nodesByPath?.reduce(
            (_hasUsages, node) =>
                _hasUsages || [node, ...node.allDescendants.nodes].some(p => p?.usagesCount > 0), false
        );
    const usagesOverflow = dialogType !== 'undelete' && data?.jcr?.nodesByPath?.reduce((isOverflow, node) => isOverflow || node.allDescendants.nodes.length === 100, false);
    const label = getLabel({dialogType, locked, count, data, firstNode, pages, folders, t});

    return (
        <>
            <DialogTitle>
                {t(`jcontent:label.contentManager.deleteAction.${dialogType}.title`)}
                <Button className={styles.button}
                        icon={<SvgInformation/>}
                        variant="ghost"
                        onClick={() => {
                            setInfoOpen(true);
                        }}
                />
            </DialogTitle>
            {isMutationLoading ?
                <Loader size="big" style={{width: '100%'}}/> :
                <DialogContent>
                    <DialogContentText className={styles.content} dangerouslySetInnerHTML={{__html: label}}/>
                    {hasUsages && count === 1 &&
                        <DialogContentText>{t('jcontent:label.contentManager.deleteAction.hasUsages.single')}</DialogContentText>}
                    {hasUsages && count !== 1 &&
                        <DialogContentText>{t('jcontent:label.contentManager.deleteAction.hasUsages.some')}</DialogContentText>}
                    {!hasUsages && usagesOverflow &&
                        <DialogContentText>{t('jcontent:label.contentManager.deleteAction.hasUsages.tooMany')}</DialogContentText>}
                    {!locked && <InfoTable paths={paths} dialogType={dialogType}/>}
                </DialogContent>}
            {(locked || isLoading || count === 0) ? (
                <DialogActions>
                    <Button size="big"
                            data-sel-role="close-button"
                            label={t('jcontent:label.contentManager.editImage.close')}
                            onClick={onClose}/>
                </DialogActions>
            ) : (
                <DialogActions>
                    <Button size="big"
                            isDisabled={isMutationLoading}
                            data-sel-role="cancel-button"
                            label={t('jcontent:label.contentManager.fileUpload.dialogRenameCancel')}
                            onClick={onClose}/>
                    <Button size="big"
                            isDisabled={isMutationLoading}
                            color="danger"
                            data-sel-role={`delete-${dialogType}-button`}
                            label={(count <= 1 ?
                                t(`jcontent:label.contentManager.deleteAction.${dialogType}.title`) :
                                t(`jcontent:label.contentManager.deleteAction.${dialogType}.action`, {count}))}
                            onClick={onAction}
                    />
                </DialogActions>
            )}
        </>
    );
};

DeleteContent.propTypes = {
    data: PropTypes.object,
    dialogType: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    isMutationLoading: PropTypes.bool.isRequired,
    onAction: PropTypes.func.isRequired,
    setInfoOpen: PropTypes.func.isRequired,
    paths: PropTypes.array.isRequired
};

const getMutation = dialogType => {
    if (dialogType === 'undelete') {
        return UndeleteMutation;
    }

    if (dialogType === 'permanently') {
        return DeleteMutation;
    }

    return MarkForDeletionMutation;
};

const Delete = ({dialogType, path, paths, onExit, onDeleted}) => {
    const [open, setOpen] = useState(true);
    const [infoOpen, setInfoOpen] = useState(false);
    const language = useSelector(state => state.language);
    const dispatch = useDispatch();
    const queryPaths = path ? [path] : (paths.sort().filter((_path, index, array) => array.find(parentPath => isPathChildOfAnotherPath(_path, parentPath)) === undefined));
    const client = useApolloClient();
    const notificationContext = useNotifications();
    const {t} = useTranslation('jcontent');
    const [mutation, {called: mutationLoading}] = useMutation(getMutation(dialogType));

    const {data, error, loading} = useQuery(DeleteQueries, {
        variables: {
            language: language,
            paths: queryPaths,
            getUsages: dialogType !== 'undelete'
        },
        skip: mutationLoading,
        fetchPolicy: 'network-only'
    });

    if (error) {
        console.log(error);
        return null;
    }

    const handleMutation = () => {
        Promise.all(queryPaths.map(_path => mutation({
            variables: {
                path: _path
            }
        }))).then(() => {
            setOpen(false);
        }).then(() => {
            queryPaths.forEach(_path => client.cache.flushNodeEntryByPath(_path));
            if (dialogType === 'permanently') {
                queryPaths.forEach(_path => {
                    dispatch(cmRemoveSelection(_path));
                });
            }

            triggerRefetchAll();
            if (onDeleted) {
                onDeleted();
            }
        }).catch(() => {
            notificationContext.notify(t('jcontent:label.contentManager.deleteAction.error'), ['closeButton']);
            queryPaths.forEach(_path => client.cache.flushNodeEntryByPath(_path));
            triggerRefetchAll();
            setOpen(false);
        });
    };

    return (
        <>
            <Dialog maxWidth="xl"
                    open={open}
                    aria-labelledby="form-dialog-title"
                    data-sel-role={`delete-${dialogType}-dialog`}
                    onClose={() => setOpen(false)}
                    onExited={onExit}
            >
                <DeleteContent data={data}
                               isLoading={loading}
                               isMutationLoading={mutationLoading}
                               paths={queryPaths}
                               dialogType={dialogType}
                               setInfoOpen={setInfoOpen}
                               onClose={() => setOpen(false)}
                               onAction={handleMutation}/>
            </Dialog>
            <Info isOpen={infoOpen} onClose={() => setInfoOpen(false)}/>
        </>
    );
};

Delete.propTypes = {
    onExit: PropTypes.func.isRequired,
    onDeleted: PropTypes.func,
    dialogType: PropTypes.string.isRequired,
    path: PropTypes.string,
    paths: PropTypes.array
};

export default Delete;
