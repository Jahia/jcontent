import React from 'react';
import {map} from "rxjs/operators";
import {composeActions} from "@jahia/react-material";
import {withDxContextAction} from "./withDxContextAction";
import {ellipsizeText} from "../utils.js";
import * as _ from "lodash";

function getLanguageLabel(languages, currentLang) {
    return _.find(languages, function(language) {
        if (language.language === currentLang) {
            return language;
        }
    });
}

function uppercaseFirst(string) {
    return string.charAt(0).toUpperCase() + string.substr(1);
}

let withNodeName = composeActions(withDxContextAction, {
    init: (context) => {
        if (context.node) {
            context.buttonLabelParams = context.node.pipe(map(node=>({
                displayName:_.escape(ellipsizeText(node.displayName, 40)),
                language: node.site ? _.escape(uppercaseFirst(getLanguageLabel(node.site.languages, context.dxContext.lang).displayName)) : null
            })))
        }
    },
});

export { withNodeName };