package org.energy_home.jemma.internal.ah.m2m.device.sax;

import java.util.Map;

import org.energy_home.jemma.ah.m2m.device.M2MXmlConverter;

public class M2MXmlConverterSax extends XmlConverterSax implements M2MXmlConverter {

	public M2MXmlConverterSax(String contextPath, String defaultNamespace, Map nameSpacePreferredPrefixMap, int poolMaxSize) {
		super(contextPath, defaultNamespace, nameSpacePreferredPrefixMap, poolMaxSize);
	}
}
