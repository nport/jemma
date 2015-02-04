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
package org.energy_home.jemma.internal.ah.m2m.device;

import java.io.InputStream;
import java.io.OutputStream;

import org.energy_home.jemma.ah.m2m.device.M2MXmlConverter;
import org.energy_home.jemma.ah.m2m.device.M2MXmlObject;
import org.energy_home.jemma.ah.m2m.lib.M2MXmlConverterFactoryImpl;

public class M2MXmlObjectImpl implements M2MXmlObject, Cloneable {

	private static M2MXmlConverter converterFactory = M2MXmlConverterFactoryImpl.getCoreConverterStatic();

	public byte[] getByteArray(Object o) {
		return converterFactory.getByteArray(o);
	}

	public String getString(Object o) {
		return converterFactory.getString(o);
	}

	public String getPrintableString(Object o) {
		return converterFactory.getPrintableString(o);
	}

	public String getFormattedString(Object o) {
		return converterFactory.getFormattedString(o);
	}

	public M2MXmlObject getObject(String xmlString) {
		return (M2MXmlObject) converterFactory.getObject(xmlString);
	}

	public M2MXmlObject readObject(InputStream in) {
		return (M2MXmlObject) converterFactory.readObject(in);
	}

	public void writeObject(Object object, OutputStream out) {
		converterFactory.writeObject(object, out);
	}

	public M2MXmlObject loadFromFile(String filePath) {
		return (M2MXmlObject) converterFactory.loadFromFile(filePath);
	}

	public boolean saveToFile(String filePath, Object object) {
		return converterFactory.saveToFile(filePath, object);
	}

	public Object clone() throws CloneNotSupportedException {
		return converterFactory.getObject(this.toXmlString());
	}

	public String toXmlString() {
		return converterFactory.getString(this);
	}

	public String toXmlPrintableString() {
		return converterFactory.getPrintableString(this);
	}

	public String toXmlFormattedString() {
		return converterFactory.getFormattedString(this);
	}
}
