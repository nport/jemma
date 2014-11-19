package org.energy_home.jemma.internal.ah.m2m.device;

import java.io.IOException;
import java.io.UnsupportedEncodingException;

import org.apache.http.HttpEntity;

public interface HttpEntityXmlConverter {

	public HttpEntity getEntity(Object object) throws UnsupportedEncodingException, Exception;
	
	public Object getObject(HttpEntity entity) throws IllegalStateException, IOException, Exception;

}
