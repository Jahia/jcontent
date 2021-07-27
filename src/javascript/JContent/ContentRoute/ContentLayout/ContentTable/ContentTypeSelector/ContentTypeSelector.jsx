import React from 'react';
import PropTypes from 'prop-types';
import {Tab, TabItem} from '@jahia/moonstone';
import {useSelector, useDispatch} from 'react-redux';
import JContentConstants from '../../../../JContent.constants';
import {setTableViewType} from '../../StructuredView/StructuredView.redux';
import classes from './ContentTypeSelector.scss';
import {useTranslation} from 'react-i18next';

const localStorage = window.localStorage;
const VIEW_TYPE = JContentConstants.localStorageKeys.viewType;

const ContentTypeSelector = ({contentCount, pagesCount}) => {
    const {t} = useTranslation();
    const viewType = useSelector(state => state.jcontent.tableView.viewType);
    const dispatch = useDispatch();

    return (
        <Tab className={classes.tabs}>
            <TabItem isSelected={JContentConstants.tableView.viewType.CONTENT === viewType}
                     isDisabled={contentCount === 0}
                     label={t('jcontent:label.contentManager.contentTypeSelector.contents', {count: contentCount > 0 ? `(${contentCount})` : ' '})}
                     size="big"
                     onClick={() => {
                         dispatch(setTableViewType(JContentConstants.tableView.viewType.CONTENT));
                         localStorage.setItem(VIEW_TYPE, JContentConstants.tableView.viewType.CONTENT);
                     }}/>
            <TabItem isSelected={JContentConstants.tableView.viewType.PAGES === viewType}
                     isDisabled={pagesCount === 0}
                     label={t('jcontent:label.contentManager.contentTypeSelector.pages', {count: pagesCount > 0 ? `(${pagesCount})` : ' '})}
                     size="big"
                     onClick={() => {
                         dispatch(setTableViewType(JContentConstants.tableView.viewType.PAGES));
                         localStorage.setItem(VIEW_TYPE, JContentConstants.tableView.viewType.PAGES);
                     }}/>
        </Tab>
    );
};

ContentTypeSelector.propTypes = {
    contentCount: PropTypes.number,
    pagesCount: PropTypes.number
};

export default ContentTypeSelector;
