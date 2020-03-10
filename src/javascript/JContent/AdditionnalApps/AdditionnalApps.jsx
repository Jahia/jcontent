import React from 'react';
import {TreeView} from '@jahia/moonstone';
import {useHistory} from 'react-router-dom';
import {registry} from '@jahia/ui-extender';
import {useTranslation} from 'react-i18next';

const getSelectedItems = history => {
    let selectedItems = [];
    let split = history.location.pathname.split('/');
    selectedItems.push(split.pop());
    return selectedItems;
};

const prepareData = (apps, t) => {
    const data = [];

    apps.forEach(app => {
        const label = t(app.label);
        const entry = {...app, label: label, route: app.route};
        data.push(entry);
    });

    return data;
};

const AdditionnalApps = () => {
    const history = useHistory();
    const {t} = useTranslation();
    let apps = registry.find({type: 'administration-sites', target: 'jcontent'});

    console.log(apps);
    const data = prepareData(apps, t);
    if (apps && apps.length !== 0) {
        return (
            <TreeView isReversed
                      data={data}
                      selectedItems={getSelectedItems(history)}
                      defaultOpenedItems={[data[0].id]}
                      onClickItem={app => history.push(app.route)}/>
        );
    }

    return null;
};

export default AdditionnalApps;
