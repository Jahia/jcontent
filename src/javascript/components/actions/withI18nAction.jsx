import React from 'react';
import {translate} from 'react-i18next';

let TranslateConsumer = translate()(props => props.children(props.t));

let withI18nAction = {
    init: (context, props) => {
        context.t = props.t;
    },

    wrappers: [
        component => <TranslateConsumer>{t => React.cloneElement(component, {t})}</TranslateConsumer>
    ]
};

export {withI18nAction};
