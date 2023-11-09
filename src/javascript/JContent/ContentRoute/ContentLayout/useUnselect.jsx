import {useTranslation} from 'react-i18next';
import {useNotifications} from '@jahia/react-material';
import {useDispatch} from 'react-redux';
import {useEffect} from 'react';
import {pathExistsInTree} from '~/JContent/JContent.utils';
import {cmOpenTablePaths} from '~/JContent/redux/JContent.redux';
import {cmRemoveSelection} from '~/JContent/redux/selection.redux';
import {TableViewModeChangeTracker} from '~/JContent/ContentRoute/ToolBar/ViewModeSelector/tableViewChangeTracker';

export function useUnselect(selection, isLoading, rows, isStructured, path, tableOpenPaths) {
    const {t} = useTranslation('jcontent');
    const {notify} = useNotifications();
    const dispatch = useDispatch();

    useEffect(() => {
        if (selection.length > 0 && !isLoading) {
            const notVisible = (rows?.length > 0) ? selection.filter(path => !pathExistsInTree(path, rows)) : selection;
            if (notVisible.length > 0) {
                const toRemove = [];
                notVisible.forEach(currentPath => {
                    const toOpen = [];
                    if (isStructured && currentPath.startsWith(path)) {
                        let pathParts = currentPath.substring(path.length).split('/').slice(0, -1);
                        let pathToAdd = '';
                        for (let pathPart of pathParts) {
                            pathToAdd = pathToAdd ? (pathToAdd + '/' + pathPart) : path;
                            if (tableOpenPaths.indexOf(pathToAdd) === -1) {
                                toOpen.push(pathToAdd);
                            }
                        }
                    }

                    if (toOpen.length === 0) {
                        // The node was not visible, and we cannot fix that by opening folders: remove selection
                        toRemove.push(currentPath);
                    } else {
                        dispatch(cmOpenTablePaths([...new Set(toOpen)]));
                    }
                });

                if (toRemove.length > 0) {
                    dispatch(cmRemoveSelection(toRemove));
                    if (TableViewModeChangeTracker.modeChanged) {
                        notify(t('jcontent:label.contentManager.selection.removed', {count: toRemove.length}), ['closeButton', 'closeAfter5s']);
                    }
                }
            }

            TableViewModeChangeTracker.resetChanged();
        } else if (!isLoading && rows?.length > 0) {
            TableViewModeChangeTracker.resetChanged();
        }
    }, [rows, tableOpenPaths, selection, dispatch, path, isLoading, notify, isStructured, t]);
}
