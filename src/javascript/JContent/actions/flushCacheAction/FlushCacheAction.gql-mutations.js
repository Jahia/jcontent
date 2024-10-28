import gql from 'graphql-tag';

export const FlushPageCacheMutation = gql`mutation flushPageCache($path: String!) {
    jcontent {
        flush: flushPageCache(pagePath: $path)
    }
}`;

export const FlushSiteCacheMutation = gql`mutation flushSiteCache($path: String!) {
    jcontent {
        flush: flushSiteCache(sitePath: $path)
    }
}`;
