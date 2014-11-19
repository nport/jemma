package org.energy_home.jemma.internal.ah.m2m.device;

public class HttpEntityXmlConverterFactory {

	public static HttpEntityXmlConverter getConnectionConverter() {
		return HttpEntityXmlConverterJaxb.getConnectionConverter();
	}

	public static HttpEntityXmlConverter getCoreConverter() {
		return HttpEntityXmlConverterJaxb.getCoreConverter();
	}
}
