import {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import JContentConstants from '~/JContent/JContent.constants';
import {setTableViewMode} from '~/JContent/redux/JContent.redux';
import {isFormidableForm} from '~/JContent/JContent.utils';
import {isInSearchMode} from './ContentLayout/ContentLayout.utils';

// A form opens in the Page Builder, once per form, so the view selector still reaches its list
export const useOpenFormInPageBuilder = ({node, path, mode, isOpenDialog}) => {
    const dispatch = useDispatch();
    const openedFormPath = (node?.path === path && isFormidableForm(node)) ? path : null;

    useEffect(() => {
        if (openedFormPath && !isOpenDialog && !isInSearchMode(mode)) {
            dispatch(setTableViewMode(JContentConstants.tableView.viewMode.PAGE_BUILDER));
        }
    }, [dispatch, openedFormPath, isOpenDialog, mode]);
};
