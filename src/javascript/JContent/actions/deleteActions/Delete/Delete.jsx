import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@material-ui/core';
import {Button} from '@jahia/moonstone';
import styles from './Delete.scss';
import {useApolloClient, useMutation, useQuery} from '@apollo/react-hooks';
import {shallowEqual, useSelector} from 'react-redux';
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
import {TransparentLoaderOverlay} from '../../../TransparentLoaderOverlay';

const DeleteContent = ({data, onClose, isLoading, isMutationLoading, dialogType, onAction, paths, setInfoOpen}) => {
    const {t} = useTranslation('jcontent');

    const firstNode = data?.jcr?.nodesByPath[0];
    const pages = data?.jcr?.nodesByPath?.reduce((count, node) => count + (node.pages.pageInfo.totalCount + (node.isPage ? 1 : 0)), 0);
    const folders = data?.jcr?.nodesByPath?.reduce((count, node) => count + (node.folders.pageInfo.totalCount + (node.isFolder ? 1 : 0)), 0);
    const count = data?.jcr?.nodesByPath?.reduce((count, node) => count + (node.content.pageInfo.totalCount + node.pages.pageInfo.totalCount + (!node.isPage && !node.isFolder ? 1 : 0)), 0) + pages + folders;
    const locked = firstNode?.isMarkedForDeletion && !firstNode?.isMarkedForDeletionRoot;
    const hasUsages = dialogType !== 'undelete' && data?.jcr?.nodesByPath?.reduce((hasUsages, node) => hasUsages || [node, ...node.allDescendants.nodes].some(p => p?.usages?.nodes?.length > 0), false);
    const usagesOverflow = dialogType !== 'undelete' && data?.jcr?.nodesByPath?.reduce((isOverflow, node) => isOverflow || node.allDescendants.nodes.length === 100, false);

    let label;
    if (locked) {
        label = t(`jcontent:label.contentManager.deleteAction.locked.${dialogType}.content`, {
            count: count,
            name: data.jcr.nodesByPath.map(n => getName(n)).join(', '),
            parentName: firstNode?.rootDeletionInfo[0].displayName
        });
    } else if (!count) {
        label = t('jcontent:label.contentManager.deleteAction.loading');
    } else if (count === 1) {
        label = t(`jcontent:label.contentManager.deleteAction.${dialogType}.item`, {
            name: firstNode?.displayName
        });
    } else if (pages === 0 && folders === 0) {
        label = t(`jcontent:label.contentManager.deleteAction.${dialogType}.itemsOnly`, {count});
    } else if (pages === 0) {
        label = t(`jcontent:label.contentManager.deleteAction.${dialogType}.filesAndFolders`, {count, folders});
    } else {
        label = t(`jcontent:label.contentManager.deleteAction.${dialogType}.items`, {count, pages});
    }

    return (
        <>
            {isMutationLoading && <TransparentLoaderOverlay/>}
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
            <DialogContent>
                <DialogContentText className={styles.margins} dangerouslySetInnerHTML={{__html: label}}/>
                {hasUsages && count === 1 && <DialogContentText>{t('jcontent:label.contentManager.deleteAction.hasUsages.single')}</DialogContentText>}
                {hasUsages && count > 1 && <DialogContentText>{t('jcontent:label.contentManager.deleteAction.hasUsages.some')}</DialogContentText>}
                {!hasUsages && usagesOverflow && <DialogContentText>{t('jcontent:label.contentManager.deleteAction.hasUsages.tooMany')}</DialogContentText>}
                {!locked && <InfoTable paths={paths}/>}
            </DialogContent>
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
                            label={(count === 1 ?
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

const Delete = ({dialogType, node, nodes, onExit}) => {
    const [open, setOpen] = useState(true);
    const [infoOpen, setInfoOpen] = useState(false);
    const {siteKey, language} = useSelector(state => ({
        siteKey: state.site,
        language: state.language
    }), shallowEqual);
    const paths = node ? [node.path] : (nodes.map(node => node.path).sort().filter((path, index, array) => array.find(parentPath => path.startsWith(parentPath) && path.length > parentPath.length) === undefined));
    const client = useApolloClient();
    const {data, error, loading} = useQuery(DeleteQueries, {
        variables: {
            siteKey: `/sites/${siteKey}`,
            language: language,
            paths: paths,
            getUsages: dialogType !== 'undelete'
        },
        fetchPolicy: 'network-only'
    });

    const [mutation, {loading: mutationLoading}] = useMutation(getMutation(dialogType));

    if (error) {
        console.log(error);
        return null;
    }

    const handleMutation = () => {
        Promise.all(paths.map(path => mutation({
            variables: {
                path: path
            }
        }))).then(() => {
            setOpen(false);
        }).then(() => {
            paths.forEach(path => client.cache.flushNodeEntryByPath(path));
            triggerRefetchAll();
        });
    };

    return (
        <>
            <Dialog fullWidth
                    maxWidth="xl"
                    open={open}
                    aria-labelledby="form-dialog-title"
                    data-sel-role={`delete-${dialogType}-dialog`}
                    onClose={() => setOpen(false)}
                    onExited={onExit}
            >
                <DeleteContent data={data}
                               isLoading={loading}
                               isMutationLoading={mutationLoading}
                               paths={paths}
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
    dialogType: PropTypes.string.isRequired,
    node: PropTypes.object,
    nodes: PropTypes.array
};

export default Delete;
