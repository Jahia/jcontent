package org.jahia.modules.textfieldinitializer;

import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.decorator.validation.JCRNodeValidator;

import javax.validation.constraints.NotEmpty;

/**
 * Validator for cent:noDefaultValidator. Validates a property that has no default value, using a
 * custom validation message (regression test for jcontent#2374).
 */
public class NoDefaultValidator implements JCRNodeValidator {

    private JCRNodeWrapper node;

    public NoDefaultValidator(JCRNodeWrapper node) {
        this.node = node;
    }

    // The punctuation is deliberate: this message is interpolated into a translation on the
    // client, and used to arrive with its apostrophe and ampersand as entities (jcontent#2748).
    @NotEmpty(message = "noDefaultString must not be empty & mustn't use \"quotes\" or /")
    public String getNoDefaultString() {
        return node.getPropertyAsString("noDefaultString");
    }

}
