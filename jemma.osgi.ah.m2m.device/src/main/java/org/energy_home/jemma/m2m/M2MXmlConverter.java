package org.energy_home.jemma.m2m;

import java.io.InputStream;
import java.io.OutputStream;

public interface M2MXmlConverter {

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
