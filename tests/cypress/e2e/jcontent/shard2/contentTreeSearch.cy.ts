import {addNode, createSite, deleteSite} from '@jahia/cypress';
import {ContentTreeSearch, JContent} from '../../../page-object';

/**
 * End-to-end coverage for the search box above the pages tree.
 *
 * The query (ContentTreeSearch.gql-queries.js) sends the same four-clause `any` constraint for
 * each matchable node type. Throughout this file the four clauses are referred to as:
 *
 *   C1  {contains: "<terms>",   property: "jcr:title"}                        analyzed full text
 *   C2  {contains: "<*terms*>", property: "jcr:title"}                        wildcard full text
 *   C3  {like: "<%pattern%>",   property: "jcr:title",  function: LOWER_CASE} raw title value
 *   C4  {like: "<%pattern%>",   property: "j:nodename", function: LOWER_CASE} raw system name
 *
 * The five behaviours that make one clause answer and another stay silent:
 *
 *   - C1 and C2 read the lucene index, whose text is lowercased and accent-folded. C3 and C4 read
 *     the raw stored value and fold nothing, so an accent in the fixture (or in the typed term)
 *     is what silences them.
 *   - C1 matches a whole index token; C2 matches a substring of one. A term that is only part of
 *     a word therefore reaches C2 and never C1.
 *   - C1, C2 and C3 are scoped to jcr:title, so a term that appears only in the system name can
 *     be answered by C4 alone.
 *   - Several words inside one contains expression are ANDed by the repository, so C1 and C2
 *     match a title that holds all of them wherever they sit in it. C3 instead asks for them
 *     adjacent and in the order they were typed, which is what a multi-word term uses to
 *     separate C1/C2 from C3.
 *   - A token shorter than MIN_WILDCARD_TOKEN_LENGTH (3) is sent WITHOUT its wildcards, so for a
 *     one or two letter term C2 becomes a copy of C1 and both ask for a whole index token. Such a
 *     term is the one thing only C3 can answer.
 *
 * What the fixtures guarantee is NOT that a title and its system name share no substring - four of
 * them repeat the greek letter on both sides ("Forêt Alpha"/zzprobe-alpha and its siblings) and
 * zzprobe-zeta-menu/"Menu Zeta" repeats both of its words. What they guarantee is that no fixture
 * holds the TERM USED AGAINST IT on the side the test rules out, and that no other fixture holds
 * that term at all. Never search for a greek letter, nor for "menu" or "zzprobe": those reach a
 * title and a system name at once and isolate nothing.
 *
 * A term the builder can make nothing of - empty, whitespace only, punctuation only - is the one
 * case where no clause is sent at all: the component skips the query rather than send an empty
 * one, so the status line says nothing and no request leaves the browser.
 *
 * C1 is the one clause with no isolating test. Separating it from C2 needs a fixture whose index
 * token is a stem of the word the test types, which depends on the analyzer configured for the
 * site language. C3 IS isolated, by the two-letter term of 'finds a page by a two-letter raw
 * substring of its title' - see the fifth behaviour above.
 *
 * Every positive assertion goes through shouldHaveMatchedOnly(), which reads the
 * data-sel-search-match attribute the tree puts on a matched row. Asserting visibility instead
 * would prove nothing: every fixture is a direct child of home, so the first hit opens home and
 * renders all of them at once.
 */
describe('Content tree search', () => {
    const siteKey = 'treeSearchSite';
    const pagesAccordion = 'pages';
    const matchedRowSelector = '[role="treeitem"][data-sel-search-match="true"]';
    let jcontent: JContent;
    let search: ContentTreeSearch;

    const addProbePage = (name: string, title: string) => {
        addNode({
            parentPathOrId: `/sites/${siteKey}/home`,
            primaryNodeType: 'jnt:page',
            name,
            properties: [
                {name: 'jcr:title', value: title, language: 'en'},
                {name: 'j:templateName', value: '2-column'}
            ]
        });
    };

    before(() => {
        createSite(siteKey);

        // Accented title, unaccented system name: only a clause that folds accents can match the
        // unaccented term "foret".
        addProbePage('zzprobe-alpha', 'Forêt Alpha');

        // Unaccented title: "armott" is a substring of the title and of its index token, but not
        // of the system name.
        addProbePage('zzprobe-beta', 'Marmotte Beta');

        // Accented AND longer than the term used against it: "hateau" is neither a whole index
        // token, nor present in the raw (accented) title, nor in the system name.
        addProbePage('zzprobe-gamma', 'Châteaux Gamma');

        // Unaccented title searched with an accented term: the accent has to be folded out of the
        // term before it can match, and the raw value can no longer hold the accented spelling.
        addProbePage('zzprobe-delta', 'Riviere Delta');

        // "history" appears in the system name only - the title is its French translation, which
        // shares no substring with it.
        addProbePage('zzprobe-history', 'Origine Epsilon');

        // A title written in no latin letter at all, paired with a latin system name. Nothing in
        // the name resembles the title, so only a clause reading the title can answer.
        addProbePage('zzprobe-hangul', '한국어');

        // Two searchable words with a third one between them, so a term made of the first and the
        // last is NOT a substring of the raw title and only the ANDing clauses can match it. Its
        // last word also carries the two-letter raw substring "ag" (nu-AG-e), which no other
        // fixture title or system name holds and which no fixture carries as a whole index token.
        addProbePage('zzprobe-theta', 'Chalet Bleu Nuage');

        // A menu item rather than a page, to cover the second of the query's four aliases.
        addNode({
            parentPathOrId: `/sites/${siteKey}/home`,
            primaryNodeType: 'jnt:navMenuText',
            name: 'zzprobe-zeta-menu',
            properties: [{name: 'jcr:title', value: 'Menu Zeta', language: 'en'}]
        });
    });

    after(() => {
        cy.logout();
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.login();
        jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        search = new ContentTreeSearch();
    });

    /**
     * Asserts the search marked exactly one row, and that it is the expected fixture.
     *
     * The marker is set from the paths the query returned, so it is present on a matched row and
     * on no other - including when the hit came from the system name or from a stemmed title and
     * the label shows no highlighted text at all. Asserting that the row is merely visible would
     * pass for a hit on ANY fixture, since they are all children of the same home page.
     * @param nodeName the system name of the fixture the search is expected to have matched
     */
    const shouldHaveMatchedOnly = (nodeName: string) => {
        jcontent.getAccordionItem(pagesAccordion).getSection()
            .find(matchedRowSelector)
            .should('have.length', 1)
            .and('be.visible')
            .and('have.attr', 'data-sel-role', nodeName);
    };

    const shouldHaveMatchedNothing = () => {
        jcontent.getAccordionItem(pagesAccordion).getSection()
            .find(matchedRowSelector)
            .should('not.exist');
    };

    it('finds a page by its accented title when the term is typed without accents', () => {
        // Clause under test: C1/C2, the two accent-folding clauses on jcr:title.
        // C3 cannot answer: its pattern is the raw term "%foret%" and the raw title is
        // "Forêt Alpha", which holds "ê" and therefore does not contain "foret".
        // C4 cannot answer: the system name is "zzprobe-alpha" and holds no "foret".
        // C1 and C2 are NOT separated here, and no accent fixture can separate them - both read
        // the same folded index. Their separation is discussed in the file header.
        search.search('foret').shouldShowResultCount(1);
        shouldHaveMatchedOnly('zzprobe-alpha');
    });

    it('finds a page by a substring of its title', () => {
        // Clause under test: the substring behaviour, carried by C2 and C3 together.
        // C1 cannot answer: "armott" is not a whole index token of "Marmotte Beta", and the
        // analyzed clause matches whole tokens only.
        // C4 cannot answer: the system name is "zzprobe-beta" and holds no "armott".
        // C2 and C3 both can: C2 because "armott" is a substring of the index token "marmotte",
        // C3 because "%armott%" is a substring of the raw title. The two tests that follow take
        // them apart, one isolating C2 and one isolating C3.
        search.search('armott').shouldShowResultCount(1);
        shouldHaveMatchedOnly('zzprobe-beta');
    });

    it('finds a page by an unaccented substring of an accented title', () => {
        // Clause under test: C2, the wildcard contains on jcr:title.
        // C1 cannot answer: "hateau" is not a whole index token ("chateaux" is).
        // C3 cannot answer: the raw title is "Châteaux Gamma"; "hateau" is absent from it because
        // of the "â", and `like` folds nothing.
        // C4 cannot answer: the system name is "zzprobe-gamma".
        search.search('hateau').shouldShowResultCount(1);
        shouldHaveMatchedOnly('zzprobe-gamma');
    });

    it('folds the accent the user types before wrapping the term in wildcards', () => {
        // Clause under test: C2 again, from the other side - the accent is in the term instead of
        // in the content. A wildcard term skips the analyzer, so the fold has to happen in the
        // client: with fold() removed the clause is sent as "*ivièr*", the index holds "rivier"
        // (or "riviere", depending on the stemmer) and nothing matches.
        // C1 cannot answer: the analyzed term is a whole-token match, and "ivier" is not a token
        // of "Riviere Delta". Note that C1 folds the accent server-side, which is why the term of
        // this test has to be a SUBSTRING - a whole word would keep this test green with fold()
        // deleted, since C1 alone would answer it.
        // C3 cannot answer: its pattern keeps the accent the user typed ("%ivièr%") while the raw
        // title is "Riviere Delta".
        // C4 cannot answer: the system name is "zzprobe-delta".
        search.search('ivièr').shouldShowResultCount(1);
        shouldHaveMatchedOnly('zzprobe-delta');
    });

    it('finds a page by a two-letter raw substring of its title', () => {
        // Clause under test: C3, the raw like on jcr:title. This is the only test that isolates
        // it, and the only one that fails if the raw-title clause is dropped.
        // C1 cannot answer: "ag" is not a whole index token of "Chalet Bleu Nuage", nor of any
        // other fixture.
        // C2 cannot answer: "ag" is two characters, which is under MIN_WILDCARD_TOKEN_LENGTH, so
        // it is sent without its wildcards and C2 asks for the same whole token C1 does.
        // C4 cannot answer: no system name holds "ag" ("zzprobe-hangul" holds "an", not "ag", and
        // "zzprobe-gamma" holds "ga").
        search.search('ag').shouldShowResultCount(1);
        shouldHaveMatchedOnly('zzprobe-theta');
    });

    it('finds a page whose title is written in no latin letter', () => {
        // Clause under test: none in particular - what is under test is the tokenizer that feeds
        // all four. It drops what is neither a letter nor a digit with the unicode property
        // escapes \p{L} and \p{N} rather than \w, which stays ASCII even under the u flag: with
        // \w the hangul term is erased, buildSearchTerms returns null, NO query is sent and the
        // status line stays empty - so the four clauses fail together and this test fails.
        // C1, C2 and C3 can each answer and this test separates none of them: the term is a whole
        // index token, a substring of that token, and a substring of the raw title at once.
        // C4 cannot answer: the system name is "zzprobe-hangul" and holds no hangul.
        // What this test does NOT prove is the NFC recompose that closes fold(). NFD splits a
        // hangul syllable into jamo, which sit outside the combining-mark range and survive the
        // strip - but the C3 pattern is built from the RAW input and is never folded, so C3
        // answers even when the folded term is left decomposed. Only a term typed in its
        // decomposed form would separate them, and it would then rest on how the analyzer indexes
        // hangul, which is not something this suite can pin down.
        search.search('한국어').shouldShowResultCount(1);
        shouldHaveMatchedOnly('zzprobe-hangul');
    });

    it('finds a page by its system name', () => {
        // Clause under test: C4, the like on j:nodename. This is the only clause that can reach a
        // system name at all - a property-scoped contains on j:nodename matches nothing, which is
        // why the system name is searched with `like`.
        // C1, C2 and C3 cannot answer: they are scoped to jcr:title, and the title of this
        // fixture is "Origine Epsilon", which shares no substring with "history". No other
        // fixture carries "history" in its title either.
        // This is also the case the row marker exists for: the label reads "Origine Epsilon" and
        // holds no "history" to highlight, so without the marker the hit would be invisible.
        search.search('history').shouldShowResultCount(1);
        shouldHaveMatchedOnly('zzprobe-history');
    });

    it('is case insensitive on both the title and the system name', () => {
        // Upper-cased repeats of two isolating tests above, so each half keeps its isolation.
        // The system-name half is also a regression test for a repository behaviour that is easy
        // to get wrong: function LOWER_CASE lowercases the PROPERTY and not the pattern, so a
        // pattern sent as "%HISTORY%" matches nothing. A hit here proves the caller lowercased it.
        search.search('HATEAU').shouldShowResultCount(1);
        shouldHaveMatchedOnly('zzprobe-gamma');

        search.search('HISTORY').shouldShowResultCount(1);
        shouldHaveMatchedOnly('zzprobe-history');
    });

    it('does not treat a percent sign as a wildcard', () => {
        // A percent sign on its own leaves no usable token, so no query is sent at all and the
        // status line goes back to saying nothing. The control search before it makes that a real
        // transition rather than an assertion on the initial state.
        search.search('hateau').shouldShowResultCount(1);
        search.search('%').shouldShowNoStatus();

        // Clause under test: the escaping of "%" inside the C4 pattern.
        // With the escape in place the pattern is "%zzprobe\%history%", which asks for a literal
        // percent sign in the system name and finds none.
        // Without it the pattern is "%zzprobe%history%", where the middle "%" is a wildcard that
        // matches the hyphen, and "zzprobe-history" is returned.
        // C1 and C2 cannot answer: no title holds "zzprobe" or "history".
        // C3 cannot answer: same reason, it is scoped to jcr:title.
        search.search('zzprobe%history').shouldShowNoResults();
        shouldHaveMatchedNothing();
    });

    it('does not treat an underscore as a wildcard', () => {
        // Clause under test: the escaping of "_" inside the C4 pattern.
        // With the escape in place the pattern is "%zzprobe\_history%", which asks for a literal
        // underscore in the system name and finds none.
        // Without it "_" matches any single character - including the hyphen of
        // "zzprobe-history", which would then be returned.
        // C1 and C2 cannot answer: no title holds "zzprobe_history" or any part of it.
        // C3 cannot answer: it is scoped to jcr:title.
        search.search('zzprobe_history').shouldShowNoResults();
        shouldHaveMatchedNothing();
    });

    it('sends no query at all for a term made only of whitespace or of punctuation', () => {
        // Not a clause test: the assertion is that NOT ONE clause is sent. Such a term leaves the
        // tokenizer with nothing, and the component has to skip the query - an empty contains
        // expression throws, and a "%%" like pattern matches every node in the tree, which is
        // what the previous implementation returned for a single space.
        // What is observed here is the absence of the REQUEST, since a term the component never
        // sends cannot mark a row either way.
        let searchRequests = 0;
        cy.intercept('POST', '**/modules/graphql', req => {
            if (JSON.stringify(req.body).includes('searchTreeNodes')) {
                searchRequests++;
            }
        });

        // A real search first, so that a counter left at zero cannot be mistaken for an intercept
        // that never saw anything, and so that the empty status below is a transition rather than
        // an assertion on the initial state.
        search.search('hateau').shouldShowResultCount(1);
        search.search(' ').shouldShowNoStatus();
        search.search('!?.').shouldShowNoStatus();

        // A second real search closes the window: its response cannot come back before a request
        // sent by either search above would have left, so a count of exactly two proves neither of
        // them sent one.
        search.search('history').shouldShowResultCount(1);
        cy.then(() => {
            expect(searchRequests).to.equal(2);
        });
    });

    it('does not fail on punctuation the full-text parser rejects', () => {
        // "!" and "(" make the repository throw an InvalidQueryException when they reach a
        // contains expression, and one bad clause fails the whole constraint - so the assertion
        // here is that the term is sanitized before the query is built and the search still
        // returns its hit rather than the failure message.
        // Clause under test: C1 in both halves, since the punctuation is stripped and what is
        // left is a whole index token. C3 cannot answer either half: its pattern keeps the
        // punctuation ("%marmotte!%", "%foret (alpha)%") and no raw title holds it. C4 cannot
        // answer: neither system name holds "marmotte" or "foret".
        search.search('marmotte!').shouldShowResultCount(1);
        shouldHaveMatchedOnly('zzprobe-beta');

        search.search('foret (alpha)').shouldShowResultCount(1);
        shouldHaveMatchedOnly('zzprobe-alpha');
    });

    it('needs every word of a multi-word term to appear in the title', () => {
        // Clause under test: C1 and C2 as a pair, which the repository ANDs when one contains
        // expression carries several words - the two words are matched wherever they sit in the
        // title, and "Bleu" between them changes nothing.
        // C3 cannot answer: its pattern is "%chalet nuage%", which asks for the two words
        // adjacent and in that order, while the raw title is "Chalet Bleu Nuage".
        // C4 cannot answer: the system name is "zzprobe-theta".
        // C1 and C2 are not separated from each other, for the reason given in the file header.
        search.search('chalet nuage').shouldShowResultCount(1);
        shouldHaveMatchedOnly('zzprobe-theta');
    });

    it('returns nothing when one word of a multi-word term appears in no title', () => {
        // The guard against the words being split into separate OR-ed clauses, which would turn
        // every multi-word search into a wider one instead of a narrower one: "chalet" on its
        // own matches "Chalet Bleu Nuage", so an OR would return that page here, while the AND the
        // repository applies inside one contains expression returns nothing.
        // Clause under test: C1 and C2 again, from the other side.
        // C3 cannot answer: its pattern is "%chalet zzznomatchxyz%" and no raw title holds it.
        // C4 cannot answer: no system name holds either word.
        search.search('chalet zzznomatchxyz').shouldShowNoResults();
        shouldHaveMatchedNothing();
    });

    it('finds a menu item by its title', () => {
        // Not a clause test but an alias test: menu items are a separate nodesByCriteria alias
        // from pages, and the suite would otherwise only ever exercise the jnt:page one.
        // "zeta" is a whole index token of "Menu Zeta", so C1 answers; C2 and C3 can answer too.
        // C4 also could, since the system name holds "zeta" - all four point at the same node,
        // which is the point of this test rather than a problem for it.
        search.search('zeta').shouldShowResultCount(1);
        shouldHaveMatchedOnly('zzprobe-zeta-menu');
    });

    it('returns nothing for a term no fixture carries', () => {
        // The negative control. Without it every test above could be satisfied by a search that
        // matches everything, which is exactly the failure mode the escaping tests guard against.
        search.search('zzznomatchxyz').shouldShowNoResults();
        shouldHaveMatchedNothing();
    });
});
