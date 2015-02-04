/**
 * This file is part of JEMMA - http://jemma.energy-home.org
 * (C) Copyright 2013 Telecom Italia (http://www.telecomitalia.it)
 *
 * JEMMA is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License (LGPL) version 3
 * or later as published by the Free Software Foundation, which accompanies
 * this distribution and is available at http://www.gnu.org/licenses/lgpl.html
 *
 * JEMMA is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License (LGPL) for more details.
 *
 */

package org.energy_home.jemma.ah.m2m.device;

import java.io.InputStream;
import java.io.OutputStream;

public interface M2MXmlConverter {

	public static final String JAXB_CONNECTION_NAMESPACE = "http://schemas.telecomitalia.it/m2m/connection";
	public static final String JAXB_CONNECTION_CONTEXT_PATH = "org.energy_home.jemma.m2m.connection";
	public static final String JAXB_CORE_NAMESPACE = "http://schemas.telecomitalia.it/m2m";

	public byte[] getByteArray(Object o);

	public Object readObject(InputStream in);

	public void writeObject(Object object, OutputStream out);

	public String getString(Object o);

	public String getPrintableString(Object o);

	public String getFormattedString(Object o);

	public Object getObject(String xmlString);

	public Object loadFromFile(String filePath);

	public boolean saveToFile(String filePath, Object object);
}