package org.energy_home.jemma.internal.ah.m2m.device;

import org.energy_home.jemma.ah.m2m.device.M2MXmlConverter;
import org.energy_home.jemma.internal.ah.m2m.device.sax.HttpEntityXmlConverterSax;

public class HttpEntityXmlConverterFactory {

	private static HttpEntityXmlConverter connectionInstance = null;
	private static HttpEntityXmlConverter coreInstance = null;

	public synchronized static HttpEntityXmlConverter getConnectionConverter() {

		if (connectionInstance == null) {
			connectionInstance = new HttpEntityXmlConverterSax(M2MXmlConverter.JAXB_CONNECTION_CONTEXT_PATH,
					M2MXmlConverter.JAXB_CONNECTION_NAMESPACE, null, 1);
		}
		return connectionInstance;
	}

	public synchronized static HttpEntityXmlConverter getCoreConverter() {
		if (coreInstance == null) {
			coreInstance = new HttpEntityXmlConverterSax(null, M2MXmlConverter.JAXB_CORE_NAMESPACE, null, 1);
		}
		return coreInstance;
	}
}
