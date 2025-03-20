import React from 'react';
import {Cloud, Dropdown, Group, Not, Pill, Visibility} from '@jahia/moonstone';
import JContentConstants from '~/JContent/JContent.constants';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {setActiveContentStatus} from '~/JContent/redux/contentStatus.redux';
import styles from './ContentStatusSelector.scss';

const {PUBLISHED, PERMISSIONS, VISIBILITY, NO_STATUS} = JContentConstants.statusView;
const icons = {
    [NO_STATUS]: <Not/>,
    [PUBLISHED]: <Cloud/>,
    [VISIBILITY]: <Visibility/>,
    [PERMISSIONS]: <Group/>
};

export const ContentStatusSelector = () => {
    const statusMode = useSelector(state => state.jcontent.contentStatus.active) || NO_STATUS;
    const contentStatus = useSelector(state => state.jcontent.contentStatus.statusPaths, shallowEqual);
    const {t} = useTranslation('jcontent');
    const dispatch = useDispatch();

    const dropdownData = Object.values(JContentConstants.statusView).map(v => ({
        label: t(`jcontent:label.contentManager.contentStatusSelector.${v}`),
        value: v,
        iconStart: icons[v],
        iconEnd: <Pill className={styles.iconEndCount} label={contentStatus[v]?.size.toString()}/>,
        attributes: {
            'aria-selected': statusMode === v,
            'data-sel-role': `status-view-mode-${v}`
        }
    }));

    const setContentStatus = (e, item) => {
        console.debug(`selected content status: ${item.value}`);
        dispatch(setActiveContentStatus(item.value));
    };

    return (
        <Dropdown
            size="small"
            data-sel-role="status-view-mode-dropdown"
            data={dropdownData}
            value={statusMode}
            icon={icons[statusMode]}
            onChange={setContentStatus}
        />
    );
};
