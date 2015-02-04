package org.energy_home.jemma.internal.ah.m2m.device.xml;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.Reader;
import java.io.UnsupportedEncodingException;
import java.util.Iterator;
import java.util.List;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.energy_home.jemma.m2m.ContentInstance;
import org.energy_home.jemma.m2m.ContentInstanceItems;
import org.energy_home.jemma.m2m.ContentInstanceItemsList;
import org.energy_home.jemma.m2m.ContentInstanceItemsStatus;
import org.energy_home.jemma.m2m.ContentInstancesBatchRequest;
import org.energy_home.jemma.m2m.ContentInstancesBatchResponse;
import org.energy_home.jemma.m2m.Scl;
import org.energy_home.jemma.m2m.SclStatusEnumeration;
import org.energy_home.jemma.m2m.ah.DoubleCDV;
import org.energy_home.jemma.m2m.ah.DoubleDV;
import org.energy_home.jemma.m2m.ah.EnergyCostPowerInfo;
import org.energy_home.jemma.m2m.ah.FloatCDV;
import org.energy_home.jemma.m2m.ah.FloatDV;
import org.energy_home.jemma.m2m.ah.MinMaxPowerInfo;
import org.energy_home.jemma.m2m.connection.ConnectionParameters;
import org.energy_home.jemma.m2m.connection.DeviceConnectionParameters;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

public class ConverterXml {

	public static final String UTF8_CHAR_ENCODING = "UTF8";

	public ConverterXml(XmlConverterXml xmlConverterXml) {
		// TODO Auto-generated constructor stub
	}

	public final ByteArrayOutputStream getByteArrayOutputStream(Object o) {
		ByteArrayOutputStream os = new ByteArrayOutputStream();
		this.writeObject(o, os);
		return os;
	}

	public void writeObject(Object o, OutputStream os) {
		Document doc = getNewDocument();
		marshall(doc, o);
		toOutputStream(doc, os, true);
		toOutputStream(doc, System.out, true);
	}

	protected void marshall(Document doc, Object o) {
		if (o instanceof DeviceConnectionParameters) {
			marshall(doc, (DeviceConnectionParameters) o);
		} else if (o instanceof ConnectionParameters) {
			marshall(doc, (ConnectionParameters) o);
		} else if (o instanceof Scl) {
			marshall(doc, (Scl) o);
		} else if (o instanceof ContentInstance) {
			marshall(doc, null, (ContentInstance) o);
		} else if (o instanceof ContentInstanceItems) {
			marshall(doc, (ContentInstanceItems) o);
		} else if (o instanceof ContentInstancesBatchRequest) {
			marshall(doc, (ContentInstancesBatchRequest) o);
		} else if (o instanceof ContentInstancesBatchRequest) {
			marshall(doc, (ContentInstanceItems) o);
		} else {
			System.out.println("Unsupported marshalling of class " + o.getClass().getName());
			throw new RuntimeException("Unsupported marshalling of class " + o.getClass().getName());
		}
	}

	public Object readObject(InputStream in) {

		// String s = slurp(in, 1000);
		// System.out.println(s);

		DocumentBuilderFactory docFactory = DocumentBuilderFactory.newInstance();
		DocumentBuilder docBuilder;
		try {
			docBuilder = docFactory.newDocumentBuilder();
			Document dom = docBuilder.parse(in);

			Element rootElement = dom.getDocumentElement();

			String name = rootElement.getNodeName();

			if (name.equals("ConnectionParameters")) {
				return unmarshal(rootElement, new ConnectionParameters());
			} else if (name.equals("Scl")) {
				return unmarshal(rootElement, new Scl());
			} else if (name.equals("ContentInstance")) {
				return unmarshal(rootElement, new ContentInstance());
			} else if (name.equals("ContentInstanceItems")) {
				return unmarshal(rootElement, new ContentInstanceItems());
			} else if (name.equals("ContentInstancesBatchResponse")) {
				return unmarshal(rootElement, new ContentInstancesBatchResponse());
			} else if (name.equals("ContentInstanceItemsList")) {
				return unmarshal(rootElement, new ContentInstanceItemsList());
			} else {
				System.err.println("Unsupported unmarshalling of class " + name);
				throw new RuntimeException("Unsupported unmarshalling of class " + name);
			}
		} catch (ParserConfigurationException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return null;
		} catch (SAXException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return null;
	}

	protected Object unmarshal(Element rootElement, ConnectionParameters connectionParameters) {
		NodeList nl = rootElement.getChildNodes();
		if (nl == null)
			return connectionParameters;

		for (int i = 0; i < nl.getLength(); i++) {
			Node el = nl.item(i);
			String name = el.getNodeName();
			if (name.equals("Id")) {
				connectionParameters.setId(getStringValue(el));
			} else if (name.equals("Time")) {
				connectionParameters.setTime(getBaseLongValue(el));
			} else if (name.equals("TimeOffset")) {
				connectionParameters.setTimeOffset(getBaseIntValue(el));
			} else if (name.equals("Token")) {
				connectionParameters.setToken(getStringValue(el));
			} else if (name.equals("NwkSclBaseId")) {
				connectionParameters.setNwkSclBaseId(getStringValue(el));
			} else if (name.equals("KeepAliveTimeout")) {
				connectionParameters.setKeepAliveTimeout(getBaseLongValue(el));
			} else {
				throw new RuntimeException("unknown tag " + name);
			}
		}

		return connectionParameters;
	}

	protected Object unmarshal(Element rootElement, Scl scl) {
		NodeList nl = rootElement.getChildNodes();
		if (nl == null)
			return scl;

		for (int i = 0; i < nl.getLength(); i++) {
			Node el = nl.item(i);
			String name = el.getNodeName();
			if (name.equals("Id")) {
				scl.setId(getStringValue(el));
			} else if (name.equals("CreationTime")) {
				scl.setCreationTime(getLongValue(el));
			} else if (name.equals("ExpirationTime")) {
				scl.setExpirationTime(getLongValue(el));
			} else if (name.equals("LastModifiedTime")) {
				scl.setLastModifiedTime(getLongValue(el));
			} else if (name.equals("SclBaseId")) {
				scl.setSclBaseId(getStringValue(el));
			} else if (name.equals("OnLineStatus")) {
				scl.setOnLineStatus(getOnLineStatus(el));
			} else if (name.equals("AccessRightId")) {
				scl.setAccessRightId(getStringValue(el));
			} else {
				throw new RuntimeException("unknown tag " + name);
			}
		}

		return scl;
	}

	protected Object unmarshal(Node rootElement, ContentInstance contentInstance) {
		NodeList nl = rootElement.getChildNodes();
		if (nl == null)
			return contentInstance;

		for (int i = 0; i < nl.getLength(); i++) {
			Node el = nl.item(i);
			String name = el.getNodeName();
			if (name.equals("Id")) {
				contentInstance.setId(getLongValue(el));
			} else if (name.equals("CreationTime")) {
				contentInstance.setCreationTime(getLongValue(el));
			} else if (name.equals("Content")) {
				Object content = unmarshall(el);
				contentInstance.setContent(content);
			} else {
				throw new RuntimeException("unknown tag " + name);
			}
		}

		return contentInstance;
	}

	protected Object unmarshal(Node rootElement, ContentInstanceItems contentInstanceItems) {
		NodeList nl = rootElement.getChildNodes();
		if (nl == null)
			return contentInstanceItems;

		NamedNodeMap attributes = rootElement.getAttributes();
		Node addressedId = attributes.getNamedItem("AddressedId");
		if (addressedId != null) {
			contentInstanceItems.setAddressedId(addressedId.getNodeValue());
		}

		List<ContentInstance> list = contentInstanceItems.getContentInstances();

		for (int i = 0; i < nl.getLength(); i++) {
			Node el = nl.item(i);
			String name = el.getNodeName();
			if (name.equals("ContentInstance")) {
				ContentInstance contentInstance = (ContentInstance) this.unmarshal(el, new ContentInstance());
				list.add(contentInstance);
			} else {
				throw new RuntimeException("unknown tag " + name);
			}
		}

		return contentInstanceItems;
	}

	protected Object unmarshal(Element rootElement, ContentInstanceItemsList contentInstanceItemsList) {
		NodeList nl = rootElement.getChildNodes();
		if (nl == null)
			return contentInstanceItemsList;

		List<ContentInstanceItems> list = contentInstanceItemsList.getContentInstanceItems();

		for (int i = 0; i < nl.getLength(); i++) {
			Node el = nl.item(i);
			String name = el.getNodeName();
			if (name.equals("ContentInstanceItems")) {
				ContentInstanceItems instanceItems = (ContentInstanceItems) this.unmarshal(el, new ContentInstanceItems());
				list.add(instanceItems);
			} else {
				throw new RuntimeException("unknown tag " + name);
			}
		}

		return contentInstanceItemsList;
	}

	protected Object unmarshal(Element rootElement, ContentInstancesBatchResponse contentInstancesBatchResponse) {
		NodeList nl = rootElement.getChildNodes();
		if (nl == null)
			return contentInstancesBatchResponse;

		for (int i = 0; i < nl.getLength(); i++) {
			Node el = nl.item(i);
			String name = el.getNodeName();
			if (name.equals("AddressedId")) {
				List<ContentInstanceItemsStatus> statuses = contentInstancesBatchResponse.getContentInstanceItemsStatuses();
			} else {
				throw new RuntimeException("unknown tag " + name);
			}
		}

		return contentInstancesBatchResponse;
	}

	protected Object unmarshall(Node el) {
		NamedNodeMap attrs = el.getAttributes();
		Node item = attrs.getNamedItem("xsi:type");
		String type = item.getNodeValue();
		String value = el.getChildNodes().item(0).getNodeValue();
		if (type.equals("xs:short")) {
			return new Short(value);
		} else if (type.equals("xs:int")) {
			return new Integer(value);
		} else if (type.equals("xs:string")) {
			return value;
		} else if (type.equals("ah:FloatDV")) {
			FloatDV floatDV = new FloatDV();
			NodeList nl = el.getChildNodes();
			for (int i = 0; i < nl.getLength(); i++) {
				Node n = nl.item(i);
				String name = n.getNodeName();
				String nV = n.getChildNodes().item(0).getNodeValue();
				if (name.equals("ah:Value")) {
					floatDV.setValue(new Float(nV));
				} else if (name.equals("ah:Duration")) {
					floatDV.setDuration(Long.parseLong(nV));
				} else {
					throw new RuntimeException("Unsupported field: " + name + " in FloatDV");
				}
			}
			return floatDV;
		} else if (type.equals("ah:FloatCDV")) {
			FloatCDV floatCDV = new FloatCDV();
			NodeList nl = el.getChildNodes();
			for (int i = 0; i < nl.getLength(); i++) {
				Node n = nl.item(i);
				String name = n.getNodeName();
				String nV = n.getChildNodes().item(0).getNodeValue();
				if (name.equals("ah:Value")) {
					floatCDV.setValue(new Float(nV));
				} else if (name.equals("ah:Duration")) {
					floatCDV.setDuration(Long.parseLong(nV));
				} else if (name.equals("ah:Min")) {
					floatCDV.setMin(new Float(nV));
				} else if (name.equals("ah:Max")) {
					floatCDV.setMax(new Float(nV));
				} else {
					throw new RuntimeException("Unsupported field: " + name + " in FloatCDV");
				}
			}
			return floatCDV;

		} else if (type.equals("ah:DoubleCDV")) {
			DoubleCDV doubleCDV = new DoubleCDV();
			NodeList nl = el.getChildNodes();
			for (int i = 0; i < nl.getLength(); i++) {
				Node n = nl.item(i);
				String name = n.getNodeName();
				String nV = n.getChildNodes().item(0).getNodeValue();
				if (name.equals("ah:Value")) {
					doubleCDV.setValue(new Double(nV));
				} else if (name.equals("ah:Duration")) {
					doubleCDV.setDuration(Long.parseLong(nV));
				} else if (name.equals("ah:Min")) {
					doubleCDV.setMin(new Double(nV));
				} else if (name.equals("ah:Max")) {
					doubleCDV.setMax(new Double(nV));
				} else {
					throw new RuntimeException("Unsupported field: " + name + " in DoubleCDV");
				}
			}
			return doubleCDV;
		} else if (type.equals("ah:DoubleDV")) {
			DoubleDV doubleDV = new DoubleDV();
			NodeList nl = el.getChildNodes();
			for (int i = 0; i < nl.getLength(); i++) {
				Node n = nl.item(i);
				String name = n.getNodeName();
				String nV = n.getChildNodes().item(0).getNodeValue();
				if (name.equals("ah:Value")) {
					doubleDV.setValue(new Double(nV));
				} else if (name.equals("ah:Duration")) {
					doubleDV.setDuration(Long.parseLong(nV));
				} else {
					throw new RuntimeException("Unsupported field: " + name + " in DoubleDV");
				}
			}
			return doubleDV;
		} else if (type.equals("ah:MinMaxPowerInfo")) {
			MinMaxPowerInfo minMaxPowerInfo = new MinMaxPowerInfo();
			NodeList nl = el.getChildNodes();
			for (int i = 0; i < nl.getLength(); i++) {
				Node n = nl.item(i);
				String name = n.getNodeName();
				String nV = n.getChildNodes().item(0).getNodeValue();
				if (name.equals("MinPower")) {
					minMaxPowerInfo.setMinPower(Float.parseFloat(nV));
				} else if (name.equals("MaxPower")) {
					minMaxPowerInfo.setMaxPower(Float.parseFloat(nV));
				} else if (name.equals("MinPowerTime")) {
					minMaxPowerInfo.setMinPowerTime(Long.parseLong(nV));
				} else if (name.equals("MaxPowerTime")) {
					minMaxPowerInfo.setMaxPowerTime(Long.parseLong(nV));
				} else {
					throw new RuntimeException("Unsupported field: " + name + " in ah:MinMaxPowerInfo");
				}
			}
			return minMaxPowerInfo;
		}

		else {
			throw new RuntimeException("Unsupported xs type: " + type);
		}
	}

	protected SclStatusEnumeration getOnLineStatus(Node n) {
		Node child = n.getChildNodes().item(0);
		String value = child.getNodeValue();
		if (value.equals("Online")) {
			return SclStatusEnumeration.ONLINE;
		} else if (value.equals("Online")) {
			return SclStatusEnumeration.OFFLINE;
		} else if (value.equals("Disconnected")) {
			return SclStatusEnumeration.DISCONNECTED;
		}

		return null;
	}

	protected String getStringValue(Node n) {
		Node child = n.getChildNodes().item(0);
		return child.getNodeValue();
	}

	protected Long getLongValue(Node n) {
		Node child = n.getChildNodes().item(0);
		return new Long(child.getNodeValue());
	}

	protected Integer getIntegerValue(Node n) {
		Node child = n.getChildNodes().item(0);
		return new Integer(child.getNodeValue());
	}

	protected long getBaseLongValue(Node n) {
		Node child = n.getChildNodes().item(0);
		return Long.parseLong(child.getNodeValue());
	}

	protected int getBaseIntValue(Node n) {
		Node child = n.getChildNodes().item(0);
		return Integer.parseInt(child.getNodeValue());
	}

	protected boolean getBaseBooleanValue(Node n) {
		Node child = n.getChildNodes().item(0);
		return Boolean.parseBoolean(child.getNodeValue());
	}

	public Object getFormattedByteArrayOutputStream(Object o) {
		ByteArrayOutputStream b = new ByteArrayOutputStream();
		this.writeObject(o, b);
		return b;
	}

	public Document getNewDocument() {
		DocumentBuilderFactory docFactory = DocumentBuilderFactory.newInstance();
		DocumentBuilder docBuilder;
		try {
			docBuilder = docFactory.newDocumentBuilder();
		} catch (ParserConfigurationException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return null;
		}

		Document doc = docBuilder.newDocument();
		return doc;
	}

	protected void marshallText(Document doc, Element parent, String name, long l) {
		Element el = doc.createElement(name);
		el.appendChild(doc.createTextNode(new Long(l).toString()));
		parent.appendChild(el);
	}

	protected void marshallText(Document doc, Element parent, String name, boolean b) {
		Element el = doc.createElement(name);
		el.appendChild(doc.createTextNode(new Boolean(b).toString()));
		parent.appendChild(el);
	}

	// protected void marshall(Document doc, Element parent, String name,
	// Integer i) {
	// if (i != null) {
	// Element el = doc.createElement(name);
	// el.appendChild(doc.createTextNode(i.toString()));
	// parent.appendChild(el);
	// }
	// }
	//
	protected void marshallText(Document doc, Element parent, String name, Long l) {
		if (l != null) {
			Element el = doc.createElement(name);
			el.appendChild(doc.createTextNode(l.toString()));
			parent.appendChild(el);
		}
	}

	//
	// protected void marshall(Document doc, Element parent, String name, String
	// s) {
	// if (s != null) {
	// Element el = doc.createElement(name);
	// el.appendChild(doc.createTextNode(s));
	// parent.appendChild(el);
	// }
	// }

	protected void marshall(Document doc, DeviceConnectionParameters o) {
		// root elements
		Element rootElement = doc.createElementNS("http://schemas.telecomitalia.it/m2m/connection", "DeviceConnectionParameters");

		doc.appendChild(rootElement);
		marshall(doc, rootElement, "Version", o.getVersion());
		marshall(doc, rootElement, "Restarted", o.isRestarted());
		marshall(doc, rootElement, "Time", o.getTime());
		marshall(doc, rootElement, "TimeOffset", o.getTimeOffset());
		marshall(doc, rootElement, "ListeningPort", o.getListeningPort());
		marshall(doc, rootElement, "keepAliveTimeout", o.getKeepAliveTimeout());
	}

	protected void marshall(Document doc, Scl o) {

		// root elements
		Element rootElement = doc.createElementNS("http://schemas.telecomitalia.it/m2m", "Scl");
		marshall(doc, rootElement, "AccessRightId", o.getAccessRightId());
		marshall(doc, rootElement, "CreationTime", o.getCreationTime());
		marshall(doc, rootElement, "ExpirationTime", o.getExpirationTime());
		marshall(doc, rootElement, "Id", o.getId());
		marshall(doc, rootElement, "LastModifiedTime", o.getLastModifiedTime());
		marshall(doc, rootElement, "OnLineStatus", o.getOnLineStatus());
		marshall(doc, rootElement, "ScBaseId", o.getSclBaseId());
		doc.appendChild(rootElement);
	}

	protected void marshall(Document doc, Element parent, ContentInstance o) {
		Element rootElement = doc.createElementNS("http://schemas.telecomitalia.it/m2m", "ContentInstance");

		marshallText(doc, rootElement, "Id", o.getId());
		marshallText(doc, rootElement, "CreationTime", o.getCreationTime());
		marshall(doc, rootElement, "Content", o.getContent());

		if (parent == null) {
			doc.appendChild(rootElement);
		} else {
			parent.appendChild(rootElement);
		}
	}

	protected void marshall(Document doc, ContentInstancesBatchRequest o) {
		Element rootElement = doc.createElementNS("http://schemas.telecomitalia.it/m2m", "ContentInstancesBatchRequest");
		marshall(doc, rootElement, "Timestamp", o.getTimestamp());

		List<ContentInstanceItems> ciis = o.getContentInstanceItems();
		for (Iterator iterator = ciis.iterator(); iterator.hasNext();) {
			ContentInstanceItems contentInstanceItems = (ContentInstanceItems) iterator.next();
			marshall(doc, rootElement, "ContentInstanceItems", contentInstanceItems);
		}

		doc.appendChild(rootElement);
	}

	protected void marshall(Document doc, Element parent, String name, ContentInstanceItems o) {
		Element rootElement = doc.createElementNS("http://schemas.telecomitalia.it/m2m", name);

		rootElement.setAttribute("AddressedId", o.getAddressedId());
		List<ContentInstance> list = o.getContentInstances();
		for (Iterator iterator = list.iterator(); iterator.hasNext();) {
			ContentInstance contentInstance = (ContentInstance) iterator.next();
			this.marshall(doc, rootElement, contentInstance);
		}
		if (parent == null) {
			doc.appendChild(rootElement);
		} else {
			parent.appendChild(rootElement);
		}
	}

	protected void marshall(Document doc, ContentInstanceItems o) {
		Element rootElement = doc.createElementNS("http://schemas.telecomitalia.it/m2m", "ContentInstanceItems");

		rootElement.setAttribute("AddressedId", o.getAddressedId());
		List<ContentInstance> list = o.getContentInstances();
		for (Iterator iterator = list.iterator(); iterator.hasNext();) {
			ContentInstance contentInstance = (ContentInstance) iterator.next();
			this.marshall(doc, rootElement, contentInstance);
		}
		doc.appendChild(rootElement);
	}

	protected void marshall(Document doc, Element parent, String name, FloatCDV o) {
		Element el = null;

		if (parent == null) {
			el = doc.createElementNS("http://schemas.telecomitalia.it/m2m", "FloatCDV");
			el.setAttribute("xmlns:ah", "http://schemas.telecomitalia.it/ah");
		} else {
			el = parent;
		}

		marshall(doc, el, "ah:Value", o.getValue());
		marshall(doc, el, "ah:Duration", o.getDuration());
		marshall(doc, el, "ah:Min", o.getMin());
		marshall(doc, el, "ah:Max", o.getMax());
		doc.appendChild(el);
	}

	protected void marshall(Document doc, FloatDV o) {
		// root elements
		Element el = doc.createElementNS("http://schemas.telecomitalia.it/m2m", "FloatDV");
		el.setAttribute("xmlns:ah", "http://schemas.telecomitalia.it/ah");
		marshall(doc, el, "ah:Value", o.getValue());
		marshall(doc, el, "ah:Duration", o.getDuration());
		doc.appendChild(el);
	}

	protected void marshall(Document doc, DoubleCDV o) {
		// root elements
		Element el = doc.createElementNS("http://schemas.telecomitalia.it/m2m", "DoubleCDV");
		el.setAttribute("xmlns:ah", "http://schemas.telecomitalia.it/ah");
		marshall(doc, el, "ah:Value", o.getValue());
		marshall(doc, el, "ah:Duration", o.getDuration());
		marshall(doc, el, "ah:Min", o.getMin());
		marshall(doc, el, "ah:Max", o.getMax());
		doc.appendChild(el);
	}

	protected void marshall(Document doc, DoubleDV o) {
		// root elements
		Element el = doc.createElementNS("http://schemas.telecomitalia.it/m2m", "DoubleDV");
		el.setAttribute("xmlns:ah", "http://schemas.telecomitalia.it/ah");
		marshall(doc, el, "ah:Value", o.getValue());
		marshall(doc, el, "ah:Duration", o.getDuration());
		doc.appendChild(el);
	}

	private void marshall(Document doc, Element parent, String name, List<ContentInstanceItems> items) {
		System.out.println(">>>>>>>>>>>>>>>>>>>>>>>>>> CONTROLLLAMI CONTROLLAMI");
		for (Iterator iterator = items.iterator(); iterator.hasNext();) {
			ContentInstanceItems contentInstanceItems = (ContentInstanceItems) iterator.next();
			this.marshall(doc, contentInstanceItems);
		}
	}

	/**
	 * Marshall a xsi:type data type.
	 * 
	 * @param doc
	 * @param parent
	 * @param name
	 *            The name to give to the element
	 * @param obj
	 *            The object to marshal
	 */

	private void marshall(Document doc, Element parent, String name, Object obj) {

		if (obj == null) {
			return;
		}

		Element element = doc.createElement(name);
		element.setAttribute("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
		element.setAttribute("xmlns:xs", "http://www.w3.org/2001/XMLSchema");

		if (obj instanceof Integer) {
			element.appendChild(doc.createTextNode(((Integer) obj).toString()));
			element.setAttribute("xsi:type", "xs:int");
			parent.appendChild(element);
		} else if (obj instanceof Long) {
			element.appendChild(doc.createTextNode(((Long) obj).toString()));
			element.setAttribute("xsi:type", "xs:long");
			parent.appendChild(element);
		}

		else if (obj instanceof String) {
			element.appendChild(doc.createTextNode((String) obj));
			element.setAttribute("xsi:type", "xs:string");
			parent.appendChild(element);
		} else if (obj instanceof Float) {
			element.appendChild(doc.createTextNode(((Float) obj).toString()));
			element.setAttribute("xsi:type", "xs:float");
			parent.appendChild(element);
		} else if (obj instanceof Short) {
			element.appendChild(doc.createTextNode(((Short) obj).toString()));
			element.setAttribute("xsi:type", "xs:short");
			parent.appendChild(element);
		} else if (obj instanceof Boolean) {
			element.appendChild(doc.createTextNode(((Boolean) obj).toString()));
			element.setAttribute("xsi:type", "xs:boolean");
			parent.appendChild(element);
		} else if (obj instanceof EnergyCostPowerInfo) {
			element.setAttribute("xmlns:ah", "http://schemas.telecomitalia.it/ah");
			element.setAttribute("xsi:type", "ah:EnergyCostPowerInfo");
			EnergyCostPowerInfo o = (EnergyCostPowerInfo) obj;
			marshallText(doc, element, "ah:Duration", o.getDuration());
			marshallText(doc, element, "ah:DeltaEnergy", o.getDeltaEnergy());
			marshallText(doc, element, "ah:Cost", o.getCost());
			marshallText(doc, element, "ah:MinCost", o.getMinCost());
			marshallText(doc, element, "ah:MaxCost", o.getMaxCost());

			MinMaxPowerInfo pi = o.getPowerInfo();
			if (pi != null) {
				Element piEl = doc.createElement("ah:PowerInfo");
				marshallText(doc, piEl, "ah:MinPower", pi.getMinPower());
				marshallText(doc, piEl, "ah:MinPowerTime", pi.getMinPowerTime());
				marshallText(doc, piEl, "ah:MaxPower", pi.getMaxPower());
				marshallText(doc, piEl, "ah:MaxPowerTime", pi.getMaxPowerTime());
				element.appendChild(piEl);
			}
			parent.appendChild(element);

		} else if (obj instanceof FloatCDV) {
			element.setAttribute("xmlns:ah", "http://schemas.telecomitalia.it/ah");
			element.setAttribute("xsi:type", "ah:FloatCDV");
			FloatCDV o = (FloatCDV) obj;
			marshallText(doc, element, "ah:Value", o.getValue());
			marshallText(doc, element, "ah:Duration", o.getDuration());
			marshallText(doc, element, "ah:Min", o.getMin());
			marshallText(doc, element, "ah:Max", o.getMax());
		} else if (obj instanceof FloatDV) {
			element.setAttribute("xmlns:ah", "http://schemas.telecomitalia.it/ah");
			element.setAttribute("xsi:type", "ah:FloatDV");
			FloatDV o = (FloatDV) obj;
			marshallText(doc, element, "ah:Value", o.getValue());
			marshallText(doc, element, "ah:Duration", o.getDuration());
		} else if (obj instanceof DoubleCDV) {
			element.setAttribute("xsi:type", "ah:DoubleCDV");
			element.setAttribute("xmlns:ah", "http://schemas.telecomitalia.it/ah");
			DoubleCDV o = (DoubleCDV) obj;
			marshallText(doc, element, "ah:Value", o.getValue());
			marshallText(doc, element, "ah:Duration", o.getDuration());
			marshallText(doc, element, "ah:Min", o.getMin());
			marshallText(doc, element, "ah:Max", o.getMax());
		} else if (obj instanceof DoubleDV) {
			element.setAttribute("xsi:type", "ah:DoubleDV");
			element.setAttribute("xmlns:ah", "http://schemas.telecomitalia.it/ah");
			DoubleDV o = (DoubleDV) obj;
			marshallText(doc, element, "ah:Value", o.getValue());
			marshallText(doc, element, "ah:Duration", o.getDuration());
		} else if (obj instanceof MinMaxPowerInfo) {
			System.err.println("ERROR unable to marshall " + obj.getClass().getName());
			throw new RuntimeException("ERROR unable to marshall " + obj.getClass().getName());
		} else {
			System.err.println("ERROR unable to marshall " + obj.getClass().getName());
			throw new RuntimeException("ERROR unable to marshall " + obj.getClass().getName());
		}

		parent.appendChild(element);
	}

	protected void marshallText(Document doc, Element parent, String tagName, Object o) {
		if (o != null) {
			Element el = doc.createElement(tagName);
			el.appendChild(doc.createTextNode(o.toString()));
			parent.appendChild(el);
		}
	}

	private void marshall(Document doc, Element parent, String name, SclStatusEnumeration onLineStatus) {
		if (onLineStatus != null) {
			Element el = doc.createElement(name);
			el.appendChild(doc.createTextNode(onLineStatus.value()));
			parent.appendChild(el);
		}
	}

	/**
	 * Marshall the FloatCDV type.
	 * 
	 * @param doc
	 * @param parent
	 * @param namespace
	 * @param o
	 */

	private void marshall(Document doc, Element parent, FloatCDV o) {
		marshall(doc, parent, "ah:Value", o.getValue());
		marshall(doc, parent, "ah:Duration", o.getDuration());
		marshall(doc, parent, "ah:Min", o.getMin());
		marshall(doc, parent, "ah:Max", o.getMax());
	}

	protected void marshall(Document doc, ConnectionParameters o) {

		Element rootElement = doc.createElement("ConnectionParameters");

		Element idTag = doc.createElement("Id");
		Element tokenTag = doc.createElement("Token");
		Element timeTag = doc.createElement("Time");
		Element timeOffsetTag = doc.createElement("TimeOffset");
		Element keepAliveTimeoutTag = doc.createElement("KeepAliveTimeout");
		Element nwkSclBaseIdTag = doc.createElement("NwkSclBaseId");

		idTag.appendChild(doc.createTextNode(o.getId()));
		tokenTag.appendChild(doc.createTextNode(o.getToken()));
		timeTag.appendChild(doc.createTextNode(new Long(o.getTime()).toString()));
		timeOffsetTag.appendChild(doc.createTextNode(new Integer(o.getTimeOffset()).toString()));
		keepAliveTimeoutTag.appendChild(doc.createTextNode(new Long(o.getKeepAliveTimeout()).toString()));
		nwkSclBaseIdTag.appendChild(doc.createTextNode(o.getNwkSclBaseId()));

		rootElement.appendChild(idTag);
		rootElement.appendChild(tokenTag);
		rootElement.appendChild(timeTag);
		rootElement.appendChild(timeOffsetTag);
		rootElement.appendChild(keepAliveTimeoutTag);
		rootElement.appendChild(nwkSclBaseIdTag);

		doc.appendChild(rootElement);
	}

	protected void toOutputStream(Document doc, OutputStream os, boolean indent) {
		// write the content into xml file
		TransformerFactory transformerFactory = TransformerFactory.newInstance();

		Transformer transformer;
		try {
			transformer = transformerFactory.newTransformer();
			if (indent) {
				transformer.setOutputProperty(OutputKeys.INDENT, "yes");
				transformer.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "4");
			}
			DOMSource source = new DOMSource(doc);
			StreamResult result = new StreamResult(os);

			// Output to console for testing
			// StreamResult result = new StreamResult(System.out);

			transformer.transform(source, result);

		} catch (TransformerConfigurationException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (TransformerException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	/*
	 * 
	 * 
	 * TransformerFactory tf = TransformerFactory.newInstance(); if(!tf.getFeature(SAXTransformerFactory.FEATURE)){ throw new
	 * RuntimeException( "Did not find a SAX-compatible TransformerFactory."); } SAXTransformerFactory stf =
	 * (SAXTransformerFactory)tf; TransformerHandler th = stf.newTransformerHandler(); th.setResult(new StreamResult(System.out));
	 * 
	 * th.startDocument();
	 * 
	 * AttributesImpl fieldAttrs = new AttributesImpl(); fieldAttrs.addAttribute("", "", "Name", "", "Value");
	 * 
	 * th.startElement("", "", "Root", fieldAttrs); th.startElement("", "", "Child", null); th.endElement("", "", "Child");
	 * th.endElement("", "", "Root"); th.endDocument();
	 */

	public static String slurp(final InputStream is, final int bufferSize) {
		final char[] buffer = new char[bufferSize];
		final StringBuilder out = new StringBuilder();
		try {
			final Reader in = new InputStreamReader(is, "UTF-8");
			try {
				for (;;) {
					int rsz = in.read(buffer, 0, buffer.length);
					if (rsz < 0)
						break;
					out.append(buffer, 0, rsz);
				}
			} finally {
				in.close();
			}
		} catch (UnsupportedEncodingException ex) {
			/* ... */
		} catch (IOException ex) {
			/* ... */
		}
		return out.toString();
	}
}
