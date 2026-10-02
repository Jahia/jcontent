import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useApolloClient} from '@apollo/client';
import {useDispatch} from 'react-redux';
import {Button, Close, Undo} from '@jahia/moonstone';
import {cmOpenTablePaths} from '~/JContent/redux/JContent.redux';
import {triggerRefetchAll} from '~/JContent/JContent.refetches';
import {buildUndoMoveDocument, buildUndoMoveVariables, restoredParents} from './CategoriesUndo';
import {clearCategoryUndo, useCategoryUndo} from './useCategoryUndo';
import styles from './CategoriesUndo.scss';

/**
 * The offer to take back the last move, in the header toolbar beside the other actions.
 *
 * In the flow of the toolbar rather than floating over the tree: a control in the interface is read
 * as part of it, where a notice is read as something that will go away on its own. Nothing here
 * goes away on its own - there is no timer, because a safety net that quietly expires is one nobody
 * can rely on. It is superseded by the next move, and by nothing else.
 *
 * **It puts the categories back where they were, it does not replay history.** Nothing here notices
 * another editor moving the same categories in between, which is the honest limit of one snapshot
 * taken at one moment - and the reason this is one level rather than a stack.
 */
export const CategoriesUndoAction = () => {
    const {t} = useTranslation('jcontent');
    const client = useApolloClient();
    const dispatch = useDispatch();
    const snapshot = useCategoryUndo();
    const [isUndoing, setIsUndoing] = useState(false);
    const [failed, setFailed] = useState(false);

    if (!snapshot || snapshot.entries.length === 0) {
        return null;
    }

    // The button says only "Undo"; which move it would take back belongs in the tooltip, where
    // there is room to name the category and where it does not stretch the toolbar.
    const message = t('jcontent:label.contentManager.undo.move', {
        count: snapshot.count,
        name: snapshot.entries[0]?.displayName,
        dest: snapshot.label
    });

    const undo = async () => {
        setIsUndoing(true);
        setFailed(false);
        try {
            await client.mutate({
                mutation: buildUndoMoveDocument(snapshot),
                variables: buildUndoMoveVariables(snapshot)
            });

            // Reopen where they landed, the same way a drop opens its target: the reader should see
            // the categories back in place rather than be told they are.
            dispatch(cmOpenTablePaths(restoredParents(snapshot)));
            triggerRefetchAll();
            clearCategoryUndo();
        } catch (e) {
            console.error('Could not undo the move', e);
            // The control stays, so a failure that was momentary can simply be tried again.
            // Clearing it here would take away the only way back.
            setFailed(true);
        } finally {
            setIsUndoing(false);
        }
    };

    return (
        <div className={styles.undoAction} data-sel-role="categories-undo-group">
            <Button
                size="default"
                variant="default"
                color={failed ? 'danger' : 'accent'}
                icon={<Undo/>}
                label={t('jcontent:label.contentManager.undo.action')}
                title={failed ? t('jcontent:label.contentManager.undo.failed') : message}
                disabled={isUndoing}
                data-sel-role="categories-undo"
                onClick={undo}
            />
            <Button
                size="default"
                variant="ghost"
                icon={<Close/>}
                title={t('jcontent:label.contentManager.undo.dismiss')}
                data-sel-role="categories-undo-dismiss"
                onClick={clearCategoryUndo}
            />
        </div>
    );
};

export default CategoriesUndoAction;
