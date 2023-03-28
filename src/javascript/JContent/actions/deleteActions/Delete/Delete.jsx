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
import {DeleteMutation, MarkForDeletionMutation} from '~/JContent/actions/deleteActions/Delete/delete.gql-mutation';

const DeleteContent = ({data, onClose, isLoading, onMarkForDeletion, onDeletion, title}) => {
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
                <DialogTitle>{t('jcontent:label.contentManager.deleteAction.locked.title')}</DialogTitle>
                <DialogContent>
                    <DialogContentText className={styles.margins}
                                       dangerouslySetInnerHTML={{
                                           __html: t('jcontent:label.contentManager.deleteAction.locked.content', {
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
    return (
        <>
            {title}
            <DialogContent>
                {
                    data?.jcr?.nodesByPath[0].isMarkedForDeletion ? <DialogContentText className={styles.margins}
                                                                                       dangerouslySetInnerHTML={{
                                                                                           __html:
                                                                                               (isSingleNodeDeletion ?
                                                                                                   t('jcontent:label.contentManager.deleteAction.permanently.item', {name: data?.jcr?.nodesByPath[0].displayName}) :
                                                                                                   t(getPages() === 0 ? 'jcontent:label.contentManager.deleteAction.permanently.itemsOnly' : 'jcontent:label.contentManager.deleteAction.permanently.items', {
                                                                                                       count: getCount(),
                                                                                                       pages: getPages()
                                                                                                   }))
                                                                                       }}
                    /> : <DialogContentText className={styles.margins}
                                            dangerouslySetInnerHTML={{
                                                __html:
                                                    (isSingleNodeDeletion ?
                                                        t('jcontent:label.contentManager.deleteAction.mark.item', {name: data?.jcr?.nodesByPath[0].displayName}) :
                                                        t(getPages() === 0 ? 'jcontent:label.contentManager.deleteAction.mark.itemsOnly' : 'jcontent:label.contentManager.deleteAction.mark.items', {
                                                            count: getCount(),
                                                            pages: getPages()
                                                        }))
                                            }}
                    />
                }

            </DialogContent>
            <DialogActions>
                <Button size="big"
                        label={t('jcontent:label.contentManager.fileUpload.dialogRenameCancel')}
                        onClick={onClose}/>
                {
                    data?.jcr?.nodesByPath[0].isMarkedForDeletion ? <Button
                        size="big"
                        color="danger"
                        data-cm-role="delete-button"
                        label={(isSingleNodeDeletion ?
                            t('jcontent:label.contentManager.deleteAction.deletion') :
                            t('jcontent:label.contentManager.deleteAction.permanently.action', {
                                count: getCount()
                            }))}
                        onClick={() => {
                            onDeletion();
                        }}
                    /> : <Button
                        size="big"
                        color="danger"
                        data-cm-role="delete-button"
                        label={(isSingleNodeDeletion ?
                            t('jcontent:label.contentManager.deleteAction.markForDeletion') :
                            t('jcontent:label.contentManager.deleteAction.mark.action', {
                                count: getCount()
                            }))}
                        onClick={() => {
                            onMarkForDeletion();
                        }}
                    />
                }

            </DialogActions>
        </>
    );
};

DeleteContent.propTypes = {
    data: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    onMarkForDeletion: PropTypes.func.isRequired,
    onDeletion: PropTypes.func.isRequired,
    title: PropTypes.object
};
const Delete = ({isMarkedForDeletionDialog, node, nodes, onExit}) => {
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

    const [deleteMutation] = useMutation(DeleteMutation);

    const [markForDeletionMutation] = useMutation(MarkForDeletionMutation);

    if (error) {
        console.log(error);
        return null;
    }

    const handleMarkForDeletion = () => {
        Promise.all(paths.map(path => markForDeletionMutation({
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

    const handleDeletion = () => {
        Promise.all(paths.map(path => deleteMutation({
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
                data-cm-role="delete-dialog"
                onClose={() => setOpen(false)}
                onExited={onExit}
        >
            <DeleteContent data={data}
                           isLoading={loading}
                           title={
                               <DialogTitle>
                                   {isMarkedForDeletionDialog ?
                                       t('jcontent:label.contentManager.deleteAction.deletion') :
                                       t('jcontent:label.contentManager.deleteAction.markForDeletion')}
                               </DialogTitle>
}
                           onClose={() => setOpen(false)}
                           onMarkForDeletion={handleMarkForDeletion}
                           onDeletion={handleDeletion}/>
        </Dialog>
    );
};

Delete.propTypes = {
    onExit: PropTypes.func.isRequired,
    isMarkedForDeletionDialog: PropTypes.bool.isRequired,
    node: PropTypes.object,
    nodes: PropTypes.array
};

export default Delete;
