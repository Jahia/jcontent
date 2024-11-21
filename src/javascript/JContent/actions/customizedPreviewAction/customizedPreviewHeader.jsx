import React from 'react';
import {useSelector} from 'react-redux';
import {Calendar, Group, Header, IconTextIcon, ResponsiveDevices} from '@jahia/moonstone';
import styles from '~/JContent/actions/customizedPreviewAction/customizedPreview.scss';
import clsx from 'clsx';
import {DisplayAction} from '@jahia/ui-extender';
import {ButtonRendererShortLabel} from '~/ContentEditor/utils';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import {useChannelData} from './useChannelData';

export const CustomizedPreviewHeader = ({user, date, channel, variant}) => {
    const path = useSelector(state => state.jcontent.path);
    const {getChannel} = useChannelData();

    const channelLabel = getChannel(channel).label;
    const variantLabel = getChannel(channel).variants?.find(v => v.value === variant)?.label;
    return (
        <Header
            data-sel-role="customized-preview-header"
            className={styles.header}
            title={
                <div className={clsx('flexRow_nowrap', styles.headerItems)}>
                    <DisplayAction
                        className={styles.headerItem}
                        actionKey="customizedPreview"
                        path={path}
                        render={ButtonRendererShortLabel}
                        buttonProps={{isReversed: true, variant: 'outlined'}}
                    />
                    {user &&
                        <IconTextIcon className={styles.headerItem} iconStart={<Group/>}>
                            {user}
                        </IconTextIcon>}
                    {date &&
                        <IconTextIcon className={styles.headerItem} iconStart={<Calendar/>}>
                            {dayjs(date).format('DD / MMM / YYYY')}
                        </IconTextIcon>}
                    {channel &&
                        <IconTextIcon className={styles.headerItem} iconStart={<ResponsiveDevices/>}>
                            {channelLabel}{variantLabel ? ` (${variantLabel})` : ''}
                        </IconTextIcon>}
                </div>
            }
        />
    );
};

CustomizedPreviewHeader.propTypes = {
    user: PropTypes.string,
    date: PropTypes.object,
    channel: PropTypes.string,
    variant: PropTypes.string
};
