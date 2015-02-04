package org.energy_home.jemma.ah.m2m.lib;

import org.energy_home.jemma.ah.m2m.device.M2MConverters;
import org.energy_home.jemma.ah.m2m.device.M2MXmlConverter;
import org.energy_home.jemma.internal.ah.m2m.device.sax.M2MXmlConverterSax;

public class M2MXmlConverterFactoryImpl implements M2MConverters {

	private static M2MXmlConverter connectionInstance = null;
	private static M2MXmlConverter coreInstance = null;

	public static synchronized M2MXmlConverter getConnectionConverterStatic() {
		if (connectionInstance == null) {
			connectionInstance = new M2MXmlConverterSax(M2MXmlConverter.JAXB_CONNECTION_CONTEXT_PATH,
					M2MXmlConverter.JAXB_CONNECTION_NAMESPACE, null, 1);
		}
		return connectionInstance;
	}

	public static synchronized M2MXmlConverter getCoreConverterStatic() {
		if (coreInstance == null) {
			coreInstance = new M2MXmlConverterSax(null, M2MXmlConverter.JAXB_CORE_NAMESPACE, null, 1);
		}
		return coreInstance;
	}

	public M2MXmlConverter getConnectionConverter() {
		return getConnectionConverterStatic();
	}

	public M2MXmlConverter getCoreConverter() {
		return getCoreConverterStatic();
	}
}
