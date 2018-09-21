import * as _ from "lodash";

function hasMixin(node, mixin) {
    let mixinTypesProperty = _.find(node.properties, property => property.name === 'jcr:mixinTypes');
    return (mixinTypesProperty != null && _.includes(mixinTypesProperty.values, mixin));
}

function extractPaths(siteKey, path) {
    let pathParts = path.replace("/sites/" + siteKey, "").split("/");
    let paths = [];
    for (let i in pathParts) {
        if (i > 0) {
            paths.push(paths[i - 1] + "/" + pathParts[i]);
        } else {
            paths.push("/sites/" + siteKey);
        }
    }
    return paths;
}

export {
    hasMixin,
    extractPaths
};