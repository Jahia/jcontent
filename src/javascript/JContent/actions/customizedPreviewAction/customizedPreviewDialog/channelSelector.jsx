import React from 'react';
import {useCustomizedPreviewContext} from '../customizedPreview.context';
import {Dropdown} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {SelectorLabel} from './selectorLabel';
import styles from './selectors.scss';
import {useChannelData} from '../useChannelData';

export const ChannelSelector = () => {
    const {t} = useTranslation('jcontent');
    const {channel, setChannel, variant, setVariant} = useCustomizedPreviewContext();
    const {channelData, loading, error, getChannel} = useChannelData();

    const onChannelChange = (e, item) => {
        setChannel(item.value);
        if (!item.variants.some(v => v.value === variant)) {
            setVariant(item.variants?.[0]?.value);
        }
    };

    const onVariantChange = (e, item) => {
        setVariant(item.value);
    };

    if (channelData.length === 1 && channelData[0].value === 'generic') {
        // We do not display any channel/variant selector if there is only generic channel
        // i.e. channels module is not enabled
        return null;
    }

    let variantData = channel && getChannel(channel).variants;
    return (
        <>
            <div className={styles.selector}>
                <SelectorLabel name="channel"/>
                <Dropdown
                    isDisabled={loading || error}
                    data-sel-role="channel-selector-dropdown"
                    placeholder={t('jcontent:label.contentManager.actions.customizedPreview.channelPlaceholder')}
                    variant="outlined"
                    data={channelData}
                    value={channel}
                    onChange={onChannelChange}
                />
            </div>
            {variantData?.length ?
                <div className={styles.selector}>
                    <SelectorLabel name="variant"/>
                    <Dropdown
                        data-sel-role="variant-selector-dropdown"
                        variant="outlined"
                        data={variantData}
                        value={variant}
                        onChange={onVariantChange}
                    />
                </div> : null}
        </>
    );
};
