import React, {useCallback, useEffect} from 'react';
import PropTypes from 'prop-types';
import {Tab, TabItem} from '@jahia/moonstone';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import JContentConstants from '~/JContent/JContent.constants';
import {setTableViewType} from '~/JContent/redux/tableView.redux';
import classes from './ContentTypeSelector.scss';
import {useTranslation} from 'react-i18next';
import {cmSetPage} from '~/JContent/redux/pagination.redux';
import {useLayoutQuery} from '~/JContent/ContentRoute/ContentLayout/useLayoutQuery';

const localStorage = window.localStorage;
const VIEW_TYPE = JContentConstants.localStorageKeys.viewType;

const ContentTypeSelector = ({selector, reduxActions}) => {
    const {t} = useTranslation('jcontent');
    const {tableView} = useSelector(selector, shallowEqual);
    const dispatch = useDispatch();
    const isStructuredView = tableView.viewMode === JContentConstants.tableView.viewMode.STRUCTURED;

    const switchToContentTab = useCallback(() => {
        // Reset pagination when changing view type in non-structured mode to disassociate pagination between two tabs
        if (!isStructuredView) {
            dispatch(reduxActions.setPageAction(0));
        }

        dispatch(reduxActions.setTableViewTypeAction(JContentConstants.tableView.viewType.CONTENT));
        localStorage.setItem(VIEW_TYPE, JContentConstants.tableView.viewType.CONTENT);
    }, [dispatch, reduxActions, isStructuredView]);

    const switchToSubPages = useCallback(() => {
        // Reset pagination when changing view type in non-structured mode to disassociate pagination between two tabs
        if (!isStructuredView) {
            dispatch(reduxActions.setPageAction(0));
        }

        dispatch(reduxActions.setTableViewTypeAction(JContentConstants.tableView.viewType.PAGES));
        localStorage.setItem(VIEW_TYPE, JContentConstants.tableView.viewType.PAGES);
    }, [dispatch, reduxActions, isStructuredView]);

    const pages = useLayoutQuery({
        ...useSelector(state => ({
            ...selector(state),
            tableView: {
                ...selector(state).tableView,
                viewType: JContentConstants.tableView.viewType.PAGES
            }
        })),
        fetchPolicy: 'cache-and-network'
    });

    const content = useLayoutQuery({
        ...useSelector(state => ({
            ...selector(state),
            tableView: {
                ...selector(state).tableView,
                viewType: JContentConstants.tableView.viewType.CONTENT
            }
        })),
        fetchPolicy: 'cache-and-network'
    });

    const pagesCount = (pages.loading || pages.error || content.loading) ? 0 : pages?.result?.pageInfo?.totalCount;

    const contentCount = (content.loading || content.error || pages.loading) ? 0 : content?.result?.pageInfo?.totalCount;

    useEffect(() => {
        if (!isStructuredView && (pagesCount > 0 || contentCount > 0)) {
            if (pagesCount > 0 && contentCount === 0 && JContentConstants.tableView.viewType.PAGES !== tableView.viewType) {
                switchToSubPages();
            } else if (pagesCount === 0 && contentCount > 0 && JContentConstants.tableView.viewType.CONTENT !== tableView.viewType) {
                switchToContentTab();
            }
        }
    }, [pagesCount, contentCount, switchToContentTab, switchToSubPages, isStructuredView, tableView.viewType]);

    return (
        <Tab className={classes.tabs}>
            <TabItem isSelected={JContentConstants.tableView.viewType.CONTENT === tableView.viewType}
                     isDisabled={contentCount === 0}
                     data-cm-view-type={JContentConstants.tableView.viewType.CONTENT}
                     label={t('jcontent:label.contentManager.contentTypeSelector.contents', {count: contentCount > 0 && !isStructuredView ? `(${contentCount})` : ' '})}
                     size="big"
                     onClick={switchToContentTab}/>
            <TabItem isSelected={JContentConstants.tableView.viewType.PAGES === tableView.viewType}
                     isDisabled={pagesCount === 0}
                     data-cm-view-type={JContentConstants.tableView.viewType.PAGES}
                     label={t('jcontent:label.contentManager.contentTypeSelector.pages', {count: pagesCount > 0 && !isStructuredView ? `(${pagesCount})` : ' '})}
                     size="big"
                     onClick={switchToSubPages}/>
        </Tab>
    );
};

ContentTypeSelector.propTypes = {
    selector: PropTypes.func,
    reduxActions: PropTypes.shape({
        setPageAction: PropTypes.func.isRequired,
        setTableViewTypeAction: PropTypes.func.isRequired
    })
};

ContentTypeSelector.defaultProps = {
    selector: state => ({
        mode: state.jcontent.mode,
        siteKey: state.site,
        path: state.jcontent.path,
        lang: state.language,
        uilang: state.uilang,
        params: state.jcontent.params,
        pagination: state.jcontent.pagination,
        sort: state.jcontent.sort,
        tableView: state.jcontent.tableView
    }),
    reduxActions: {
        setPageAction: page => cmSetPage(page),
        setTableViewTypeAction: view => setTableViewType(view)
    }
};

export default ContentTypeSelector;
