package org.jahia.modules.choicelistinitializer;

import org.apache.jackrabbit.value.ValueFactoryImpl;
import org.jahia.services.content.nodetypes.ExtendedPropertyDefinition;
import org.jahia.services.content.nodetypes.initializers.ChoiceListValue;
import org.jahia.services.content.nodetypes.initializers.ModuleChoiceListInitializer;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;

import javax.jcr.Value;
import java.util.*;

@Component(service = {ModuleChoiceListInitializer.class})
public class MyLinkTypeInitializer implements ModuleChoiceListInitializer {
    private String key;

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
       ChoiceListValue internalValue = new ChoiceListValue();
       internalValue.setValue(ValueFactoryImpl.getInstance().createValue("internalLink"));
       internalValue.setDisplayName("internalLink");
       Map<String, Object> properties = new HashMap<>();
       properties.put("addMixin", "cemix:internalLink");
       internalValue.setProperties(properties);

        ChoiceListValue externalValue = new ChoiceListValue();
        Value externalLink = ValueFactoryImpl.getInstance().createValue("externalLink");
        externalValue.setDisplayName("externalLink");
        externalValue.setValue(externalLink);
        Map<String, Object> properties1 = new HashMap<>();
        properties1.put("addMixin", "cemix:externalLink");
        externalValue.setProperties(properties1);


       return Arrays.asList(internalValue, externalValue);
    }
}
