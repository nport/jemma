package org.energy_home.jemma.m2m;

public class M2MXmlConverterFactory {
	public synchronized static M2MXmlConverter getConnectionConverter() {
		return M2MXmlConverterJaxb.getConnectionConverter();
	}

	public synchronized static M2MXmlConverter getCoreConverter() {
		return M2MXmlConverterJaxb.getCoreConverter();
	}
}
