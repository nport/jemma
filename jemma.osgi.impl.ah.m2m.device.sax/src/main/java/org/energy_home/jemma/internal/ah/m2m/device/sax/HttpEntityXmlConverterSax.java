package org.energy_home.jemma.internal.ah.m2m.device.sax;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.Map;

import org.apache.http.HttpEntity;
import org.apache.http.entity.ByteArrayEntity;
import org.energy_home.jemma.internal.ah.m2m.device.HttpEntityXmlConverter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class HttpEntityXmlConverterSax extends XmlConverterSax implements HttpEntityXmlConverter {

	private static final Logger LOG = LoggerFactory.getLogger(HttpEntityXmlConverterSax.class);

	public static final String HTTP_ENTITY_CONTENT_TYPE = "application/xml";

	public HttpEntityXmlConverterSax(String contextPath, String defaultNamespace, Map<String, String> nameSpacePreferredPrefixMap,
			int poolMaxSize) {
		super(contextPath, defaultNamespace, nameSpacePreferredPrefixMap, poolMaxSize);
	}

	public HttpEntity getEntity(Object object) throws UnsupportedEncodingException, Exception {
		ByteArrayOutputStream b = getConverter().getByteArrayOutputStream(object);
		if (LOG.isDebugEnabled())
			LOG.debug("toEntity:\n" + getPrintableString(b.toString()));

		ByteArrayEntity entity = new ByteArrayEntity(b.toByteArray());
		entity.setContentType(HTTP_ENTITY_CONTENT_TYPE);

		return entity;
	}

	public Object getObject(HttpEntity entity) throws IllegalStateException, IOException, Exception {
		Object o = readObject(entity.getContent());
		return o;
	}
}
