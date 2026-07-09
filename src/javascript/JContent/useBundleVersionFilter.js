import {useQuery} from '@apollo/client';
import gql from 'graphql-tag';
import {satisfies} from 'compare-versions';

const GET_BUNDLE_VERSIONS = gql`
    query GetBundleVersions($nameRegExp: String!) {
        admin {
            tools {
                bundles(nameRegExp: $nameRegExp, areModules: true) {
                    symbolicName
                    version
                }
            }
        }
    }
`;

// Normalize Jahia version strings to pure numeric dot-notation:
// "3.8.0.SNAPSHOT" → "3.8.0", "4.21.0.jahia8-8" → "4.21.0.8.8"
const normalize = v => v?.match(/\d+/g)?.join('.');

export const useBundleVersionFilter = routes => {
    const requiredBundles = [...new Set(
        routes
            .filter(r => r.requiredBundle)
            .map(r => r.requiredBundle.bundle)
    )];

    const {data, loading} = useQuery(GET_BUNDLE_VERSIONS, {
        variables: {nameRegExp: requiredBundles.join('|') || ''},
        skip: requiredBundles.length === 0
    });

    const bundleVersionMap = Object.fromEntries(
        (data?.admin?.tools?.bundles || []).map(b => [b.symbolicName, b.version])
    );

    return route => {
        if (!route.requiredBundle) {
            return true;
        }

        if (loading) {
            return false;
        }

        const {bundle, versionRange} = route.requiredBundle;
        const version = bundleVersionMap[bundle];
        if (!versionRange) {
            return Boolean(version);
        }

        return Boolean(version) && satisfies(normalize(version), versionRange);
    };
};
