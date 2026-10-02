import {BaseQueryHandler} from './BaseQueryHandler';

/**
 * Lists what a samples category holds, and nothing beneath it.
 *
 * A sample keeps its own content - an agency sample carries its property listings, or it would
 * preview as an empty box - but those internals are not themselves samples. The pages handler lists
 * descendants, which turned a single saved agency into dozens of rows of the listings it happens to
 * contain, so this deliberately stays with BaseQueryHandler's children query.
 */
export const SamplesQueryHandler = {
    ...BaseQueryHandler,

    getTreeParams: () => null,

    isStructured: () => false
};
