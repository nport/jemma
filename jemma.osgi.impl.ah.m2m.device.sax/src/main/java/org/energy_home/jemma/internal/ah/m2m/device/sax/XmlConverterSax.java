package org.energy_home.jemma.internal.ah.m2m.device.sax;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.xml.transform.TransformerConfigurationException;

import org.xml.sax.SAXException;

public abstract class XmlConverterSax {

	public static final String XML_SCHEMA_NAMESPACE = "http://www.w3.org/2001/XMLSchema";
	public static final String XML_SCHEMA_INSTANCE_NAMESPACE = "http://www.w3.org/2001/XMLSchema-instance";

	protected static final String getPrintableString(String xml) {
		StringBuilder sb = new StringBuilder(xml);
		int i = 0;
		while ((i = sb.indexOf(" ", i + 1000)) != -1) {
			sb.replace(i, i + 1, "\n");
		}

		return sb.toString();
	}

	private class ConverterPool {
		private int poolMaxSize = 0;
		private int currentIndex = -1;
		private List<SaxConverter> pool;

		ConverterPool(int poolMaxSize) {
			if (poolMaxSize <= 0)
				throw new IllegalStateException("Pool size cannot be 0 or a negative number");
			this.poolMaxSize = poolMaxSize;
			pool = new ArrayList<SaxConverter>(poolMaxSize);
			this.currentIndex = 0;
		}

		private void incrementIndex() {
			currentIndex++;
			if (currentIndex == poolMaxSize)
				currentIndex = 0;
		}

		int getMaxSize() {
			return poolMaxSize;
		}

		synchronized SaxConverter get() {
			SaxConverter converter;
			if (pool.size() < poolMaxSize) {
				converter = createConverter();
				pool.add(converter);
			} else {
				converter = pool.get(currentIndex);
			}

			if (poolMaxSize > 1)
				incrementIndex();
			return converter;
		}
	}

	private String contextPath;
	private String defaultNamespace;
	private ConverterPool convertersPool;

	private void setPoolMaxSize(int poolMaxSize) {
		if (poolMaxSize > 0) {
			convertersPool = new ConverterPool(poolMaxSize);
		} else {
			convertersPool = null;
		}
	}

	protected SaxConverter getConverter() {
		SaxConverter converterXml;
		if (convertersPool == null) {
			converterXml = createConverter();
		} else {
			converterXml = convertersPool.get();
		}
		return converterXml;
	}

	protected SaxConverter createConverter() {
		return new SaxConverter(this);
	}

	public XmlConverterSax(String contextPath, String defaultNamespace, Map<String, String> nameSpacePreferredPrefixMap,
			int poolMaxSize) {
		this.contextPath = contextPath;
		this.defaultNamespace = defaultNamespace;
		setPoolMaxSize(poolMaxSize);
	}

	public String getContextPath() {
		return this.contextPath;
	}

	public String getDefaultNamespace() {
		return this.defaultNamespace;
	}

	public Map<String, String> getNameSpacePreferredPrefixMap() {
		return null;
	}

	public byte[] getByteArray(Object o) {
		try {
			return getConverter().getByteArrayOutputStream(o).toByteArray();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}

	public String getString(Object o) {
		try {
			return getConverter().getByteArrayOutputStream(o).toString();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}

	public String getPrintableString(Object o) {
		String result;
		try {
			result = getConverter().getByteArrayOutputStream(o).toString();
			return getPrintableString(result);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}

	public String getFormattedString(Object o) {
		String result;
		try {
			result = getConverter().getFormattedByteArrayOutputStream(o).toString();
			return getPrintableString(result);
		} catch (TransformerConfigurationException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (SAXException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}

	public Object getObject(String xmlString) {
		try {
			return getConverter().readObject(new ByteArrayInputStream(xmlString.getBytes(SaxConverter.UTF8_CHAR_ENCODING)));
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return null;
	}

	public Object readObject(InputStream in) {
		try {
			return getConverter().readObject(in);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}

	public void writeObject(Object object, OutputStream out) {
		try {
			getConverter().writeObject(object, out);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	public Object loadFromFile(String filePath) {
		Object object = null;
		BufferedInputStream fileIn = null;
		try {
			fileIn = new BufferedInputStream(new FileInputStream(filePath));
			object = readObject(fileIn);
			fileIn.close();
			return object;
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			if (fileIn != null)
				try {
					fileIn.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
		}
		return object;
	}

	public boolean saveToFile(String filePath, Object object) {
		BufferedOutputStream fileOut = null;
		try {
			fileOut = new BufferedOutputStream(new FileOutputStream(filePath));
			writeObject(object, fileOut);
			return true;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		} finally {
			if (fileOut != null)
				try {
					fileOut.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
		}
	}

}
