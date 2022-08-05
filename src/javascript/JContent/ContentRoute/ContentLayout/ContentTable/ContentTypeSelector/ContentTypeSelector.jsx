import React from 'react';
import PropTypes from 'prop-types';
import {Tab, TabItem} from '@jahia/moonstone';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import JContentConstants from '~/JContent/JContent.constants';
import {setTableViewType} from '../../StructuredView/StructuredView.redux';
import classes from './ContentTypeSelector.scss';
import {useTranslation} from 'react-i18next';
import {batchActions} from 'redux-batched-actions';
import {cmSetPage} from '../../pagination.redux';
import {useLayoutQuery} from '~/JContent/ContentRoute/ContentLayout/useLayoutQuery';

const localStorage = window.localStorage;
const VIEW_TYPE = JContentConstants.localStorageKeys.viewType;

const ContentTypeSelector = ({selector, reduxActions}) => {
    const {t} = useTranslation();
    const tableView = useSelector(selector, shallowEqual);
    const dispatch = useDispatch();
    const isStructuredView = tableView.viewMode === JContentConstants.tableView.viewMode.STRUCTURED;
    const actionsBatch = [];

    // Reset pagination when changing view type in non structured mode to disassociate pagination between two tabs
    if (!isStructuredView) {
        actionsBatch.push(reduxActions.setPageAction(0));
    }

    const pages = useLayoutQuery({tableView: {...tableView, viewType: JContentConstants.tableView.viewType.PAGES}, fetchPolicy: 'cache-and-network'});
    const pagesCount = pages.loading ? 0 : pages.queryHandler.getResultsPath(pages.data).pageInfo.totalCount;
    const content = useLayoutQuery({tableView: {...tableView, viewType: JContentConstants.tableView.viewType.CONTENT}, fetchPolicy: 'cache-and-network'});
    const contentCount = content.loading ? 0 : content.queryHandler.getResultsPath(content.data).pageInfo.totalCount;

    return (
        <Tab className={classes.tabs}>
            <TabItem isSelected={JContentConstants.tableView.viewType.CONTENT === tableView.viewType}
                     isDisabled={contentCount === 0}
                     label={t('jcontent:label.contentManager.contentTypeSelector.contents', {count: contentCount > 0 ? `(${contentCount})` : ' '})}
                     size="big"
                     onClick={() => {
                         actionsBatch.push(reduxActions.setTableViewTypeAction(JContentConstants.tableView.viewType.CONTENT));
                         dispatch(batchActions(actionsBatch));
                         localStorage.setItem(VIEW_TYPE, JContentConstants.tableView.viewType.CONTENT);
                     }}/>
            <TabItem isSelected={JContentConstants.tableView.viewType.PAGES === tableView.viewType}
                     isDisabled={pagesCount === 0}
                     label={t('jcontent:label.contentManager.contentTypeSelector.pages', {count: pagesCount > 0 ? `(${pagesCount})` : ' '})}
                     size="big"
                     onClick={() => {
                         actionsBatch.push(reduxActions.setTableViewTypeAction(JContentConstants.tableView.viewType.PAGES));
                         dispatch(batchActions(actionsBatch));
                         localStorage.setItem(VIEW_TYPE, JContentConstants.tableView.viewType.PAGES);
                     }}/>
        </Tab>
    );
};

ContentTypeSelector.propTypes = {
    selector: PropTypes.func,
    reduxActions: {
        setPageAction: PropTypes.func.isRequired,
        setTableViewTypeAction: PropTypes.func.isRequired
    }
};

ContentTypeSelector.defaultProps = {
    selector: state => state.jcontent.tableView,
    reduxActions: {
        setPageAction: page => cmSetPage(page),
        setTableViewTypeAction: view => setTableViewType(view)
    }
};

export default ContentTypeSelector;
