package org.jahia.modules.choicelistinitializer;

import org.apache.jackrabbit.value.ValueFactoryImpl;
import org.jahia.services.content.nodetypes.ExtendedPropertyDefinition;
import org.jahia.services.content.nodetypes.initializers.ChoiceListValue;
import org.jahia.services.content.nodetypes.initializers.ModuleChoiceListInitializer;
import org.osgi.service.component.annotations.Component;

import java.util.*;

@Component(service = {ModuleChoiceListInitializer.class})
public class MyLinkTypeInitializer implements ModuleChoiceListInitializer {
    private String key = "myLinkTypeInitializer";

    @Override
    public String getKey() {
        return key;
    }

    @Override
    public void setKey(String key) {
        this.key = key;
    }

    @Override
    public List<ChoiceListValue> getChoiceListValues(ExtendedPropertyDefinition extendedPropertyDefinition, String s, List<ChoiceListValue> list, Locale locale, Map<String, Object> map) {
        return Arrays.asList(linkValue("internalLink", "cemix:internalLink"), linkValue("externalLink", "cemix:externalLink"));
    }

    private static ChoiceListValue linkValue(String value, String addMixin) {
        ChoiceListValue choiceListValue = new ChoiceListValue();
        choiceListValue.setValue(ValueFactoryImpl.getInstance().createValue(value));
        choiceListValue.setDisplayName(value);
        Map<String, Object> properties = new HashMap<>();
        properties.put("addMixin", addMixin);
        choiceListValue.setProperties(properties);
        return choiceListValue;
    }
}
