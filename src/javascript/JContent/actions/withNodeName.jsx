import {map} from 'rxjs/operators';
import {composeActions} from '@jahia/react-material';
import {withDxContextAction} from './withDxContextAction';
import {ellipsizeText} from '../JContent.utils';
import * as _ from 'lodash';
import {withI18nAction} from './withI18nAction';

function getLanguageLabel(languages, currentLang) {
    return _.find(languages, function (language) {
        if (language.language === currentLang) {
            return language;
        }
    });
}

function uppercaseFirst(string) {
    return string.charAt(0).toUpperCase() + string.substr(1);
}

let withNodeName = composeActions(withDxContextAction, withI18nAction, {
    init: (context, props) => {
        context.initLabelParams = () => {
            if (context.node) {
                context.buttonLabelParams = context.node.pipe(map(node => ({
                    displayName: _.escape(ellipsizeText(node.displayName, 40)),
                    language: node.site ? _.escape(uppercaseFirst(getLanguageLabel(node.site.languages, context.language).displayName)) : null
                })));
            } else if (context.nodes) {
                context.buttonLabelParams = context.nodes.pipe(map(nodes => {
                    if (nodes.length > 0) {
                        return {
                            displayName: props.t('jcontent:label.contentManager.selection.itemsSelected', {count: context.paths.length}),
                            language: nodes[0].site ? _.escape(uppercaseFirst(getLanguageLabel(nodes[0].site.languages, context.language).displayName)) : null
                        };
                    }
                }));
            }
        };
    }
});

export {withNodeName};
