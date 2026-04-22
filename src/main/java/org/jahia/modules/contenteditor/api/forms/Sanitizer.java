package org.jahia.modules.contenteditor.api.forms;

import org.owasp.html.HtmlPolicyBuilder;
import org.owasp.html.PolicyFactory;
import org.owasp.html.Sanitizers;

/**
 * This class provides custom sanitizers for various form fields.
 */
public class Sanitizer {

    public static final PolicyFactory DESCRIPTION_FORMATTING = new HtmlPolicyBuilder()
        .allowCommonInlineFormattingElements()
        .allowStandardUrlProtocols()
        .allowElements("a")
        .allowAttributes("href").onElements("a")
        .toFactory();

    public static final PolicyFactory COMMON_FORMATTING = Sanitizers.FORMATTING;

    private Sanitizer() {
        /* This utility class should not be instantiated */
    }
}
