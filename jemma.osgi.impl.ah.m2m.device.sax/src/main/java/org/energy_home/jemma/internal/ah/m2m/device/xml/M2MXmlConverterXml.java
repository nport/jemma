package org.energy_home.jemma.internal.ah.m2m.device.xml;

import java.util.Map;

import org.energy_home.jemma.ah.m2m.device.M2MXmlConverter;

public class M2MXmlConverterXml extends XmlConverterXml implements M2MXmlConverter {

	public M2MXmlConverterXml(String contextPath, String defaultNamespace, Map<String, String> nameSpacePreferredPrefixMap,
			int poolMaxSize) {
		super(contextPath, defaultNamespace, nameSpacePreferredPrefixMap, poolMaxSize);
	}
}
