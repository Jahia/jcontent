import React from 'react';
import {useCustomizedPreviewContext} from '../customizedPreview.context';
import {Dropdown} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {SelectorLabel} from './selectorLabel';
import styles from './selectors.scss'

export const ChannelSelector = () => {
    const {t} = useTranslation('jcontent');
    const {channelContext} = useCustomizedPreviewContext();
    const {channelData, channel, setChannel, variant, setVariant, getChannel} = channelContext;

    const onChannelChange = (e, item) => {
        setChannel(item.value);
        setVariant(item.variant?.[0]?.value);
    };

    const onVariantChange = (e, item) => {
        setVariant(item.value);
    };

    let variantData = channel && getChannel(channel).variant;
    return (
        <>
            <div className={styles.selector}>
                <SelectorLabel name="channel"/>
                <Dropdown
                    data-sel-role="channel-selector"
                    placeholder={t('jcontent:label.contentManager.actions.customizedPreview.selectChannel')}
                    variant="outlined"
                    data={channelData}
                    value={channel}
                    onChange={onChannelChange}
                />
            </div>
            {variantData &&
                <div className={styles.selector}>
                    <SelectorLabel name="variant"/>
                    <Dropdown
                        data-sel-role="variant-selector"
                        variant="outlined"
                        data={variantData}
                        value={variant}
                        onChange={onVariantChange}
                    />
                </div>
            }
        </>
    );
};
