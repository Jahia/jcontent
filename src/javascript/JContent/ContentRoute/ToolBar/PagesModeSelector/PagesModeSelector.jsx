import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import JContentConstants from '../../../JContent.constants';
import {WebPage, ViewList} from '@jahia/moonstone/dist/icons';
import {Button} from '@jahia/moonstone';
import {setPagesMode} from './PagesModeSelector.redux';

const LIST = JContentConstants.pagesMode.LIST;
const VIEW = JContentConstants.pagesMode.VIEW;
const VIEW_DEVICE = JContentConstants.pagesMode.VIEW_DEVICE;

const buttons = {
    [LIST]: <ViewList/>,
    [VIEW]: <WebPage/>,
    [VIEW_DEVICE]: <WebPage/>
};

export const PagesModeSelector = () => {
    const {t} = useTranslation();

    const mode = useSelector(state => state.jcontent.pagesMode);

    const dispatch = useDispatch();

    return (
        Object.keys(buttons).map(v => (
            <Button key={v}
                    data-sel-role={'set-view-mode-' + v}
                    aria-selected={mode === v}
                    color={mode === v ? 'accent' : 'default'}
                    title={t('jcontent:label.contentManager.pagesMode.' + v)}
                    size="default"
                    variant="ghost"
                    icon={buttons[v]}
                    onClick={() => dispatch(setPagesMode(v))}
            />
        ))
    );
};

export default PagesModeSelector;

