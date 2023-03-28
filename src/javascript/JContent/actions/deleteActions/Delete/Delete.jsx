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

const DeleteContent = ({data, onClose, isLoading, dialogType, onAction, title}) => {
    const {t} = useTranslation('jcontent');
    if (isLoading || data?.jcr.nodesByPath.length === 0) {
        return (
            <>
                {title}
                <DialogContent>
                    <DialogContentText className={styles.margins}>
                        {t('jcontent:label.contentManager.deleteAction.loading')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button size="big"
                            label={t('jcontent:label.contentManager.editImage.close')}
                            onClick={onClose}/>
                </DialogActions>
            </>
        );
    }

    if (data?.jcr?.nodesByPath[0].isMarkedForDeletion && !data?.jcr?.nodesByPath[0].isMarkedForDeletionRoot) {
        return (
            <>
                <DialogTitle>{t(`jcontent:label.contentManager.deleteAction.locked.${dialogType}.title`)}</DialogTitle>
                <DialogContent>
                    <DialogContentText className={styles.margins}
                                       dangerouslySetInnerHTML={{
                                           __html: t(`jcontent:label.contentManager.deleteAction.locked.${dialogType}.content`, {
                                               name: data?.jcr?.nodesByPath[0].displayName,
                                               parentName: data?.jcr?.nodesByPath[0].rootDeletionInfo[0].displayName
                                           })
                                       }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button size="big"
                            label={t('jcontent:label.contentManager.editImage.close')}
                            onClick={onClose}/>
                </DialogActions>
            </>
        );
    }

    function getCount() {
        return data?.jcr?.nodesByPath.reduce((count, node) => count + (node.content.pageInfo.totalCount + node.pages.pageInfo.totalCount), 0) + data?.jcr?.nodesByPath.length;
    }

    function getPages() {
        return data?.jcr?.nodesByPath.reduce((count, node) => count + (node.pages.pageInfo.totalCount + (node.isPage ? 1 : 0)), 0);
    }

    const isSingleNodeDeletion = data?.jcr?.nodesByPath.length === 1 && data?.jcr?.nodesByPath[0].pages.pageInfo.totalCount === 0 && data?.jcr?.nodesByPath[0].content.pageInfo.totalCount === 0;

    function getLabel() {
        if (isSingleNodeDeletion) {
            return t(`jcontent:label.contentManager.deleteAction.${dialogType}.item`, {
                name: data?.jcr?.nodesByPath[0].displayName
            });
        }

        if (getPages() === 0) {
            return t(`jcontent:label.contentManager.deleteAction.${dialogType}.itemsOnly`, {
                count: getCount(),
                pages: getPages()
            });
        }

        return t(`jcontent:label.contentManager.deleteAction.${dialogType}.items`, {
            count: getCount(),
            pages: getPages()
        });
    }

    return (
        <>
            {title}
            <DialogContent>
                <DialogContentText className={styles.margins} dangerouslySetInnerHTML={{__html: getLabel()}}/>
            </DialogContent>
            <DialogActions>
                <Button size="big"
                        data-sel-role="cancel-button"
                        label={t('jcontent:label.contentManager.fileUpload.dialogRenameCancel')}
                        onClick={onClose}/>
                <Button size="big"
                        color="danger"
                        data-sel-role={`delete-${dialogType}-button`}
                        label={(isSingleNodeDeletion ?
                            t(`jcontent:label.contentManager.deleteAction.${dialogType}.title`) :
                            t(`jcontent:label.contentManager.deleteAction.${dialogType}.action`, {
                                count: getCount()
                            }))}
                        onClick={onAction}
                />
            </DialogActions>
        </>
    );
};

DeleteContent.propTypes = {
    data: PropTypes.object,
    dialogType: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    onAction: PropTypes.func.isRequired,
    title: PropTypes.object
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
    const {t} = useTranslation('jcontent');
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
            paths: paths
        }
    });

    const [mutation] = useMutation(getMutation(dialogType));

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
        <Dialog fullWidth
                open={open}
                aria-labelledby="form-dialog-title"
                data-sel-role={`delete-${dialogType}-dialog`}
                onClose={() => setOpen(false)}
                onExited={onExit}
        >
            <DeleteContent data={data}
                           isLoading={loading}
                           dialogType={dialogType}
                           title={
                               <DialogTitle>
                                   { t(`jcontent:label.contentManager.deleteAction.${dialogType}.title`) }
                               </DialogTitle>
                           }
                           onClose={() => setOpen(false)}
                           onAction={handleMutation}/>
        </Dialog>
    );
};

Delete.propTypes = {
    onExit: PropTypes.func.isRequired,
    dialogType: PropTypes.string.isRequired,
    node: PropTypes.object,
    nodes: PropTypes.array
};

export default Delete;
