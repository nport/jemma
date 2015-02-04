package org.energy_home.jemma.internal.ah.m2m.device.sax;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Iterator;
import java.util.List;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.sax.SAXTransformerFactory;
import javax.xml.transform.sax.TransformerHandler;
import javax.xml.transform.stream.StreamResult;

import org.energy_home.jemma.m2m.ContentInstance;
import org.energy_home.jemma.m2m.ContentInstanceItemStatus;
import org.energy_home.jemma.m2m.ContentInstanceItems;
import org.energy_home.jemma.m2m.ContentInstanceItemsList;
import org.energy_home.jemma.m2m.ContentInstanceItemsStatus;
import org.energy_home.jemma.m2m.ContentInstancesBatchRequest;
import org.energy_home.jemma.m2m.ContentInstancesBatchResponse;
import org.energy_home.jemma.m2m.Scl;
import org.energy_home.jemma.m2m.SclItems;
import org.energy_home.jemma.m2m.SclStatusEnumeration;
import org.energy_home.jemma.m2m.ah.ApplianceLog;
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
import org.xml.sax.Attributes;
import org.xml.sax.Locator;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.AttributesImpl;
import org.xml.sax.helpers.DefaultHandler;

public class SaxConverter {

	public static final String UTF8_CHAR_ENCODING = "UTF8";
	private DomUnmarshaller unmarshaller;
	private SaxMarshaller marshaller;

	private static String m2m = ContentInstance.class.getPackage().getName();
	private static String ah = DoubleCDV.class.getPackage().getName();
	private static String conn = ConnectionParameters.class.getPackage().getName();

	private static final String emptyString = "";

	public SaxConverter(XmlConverterSax xmlConverterXml) {
		this.unmarshaller = new DomUnmarshaller(this);
		this.marshaller = new SaxMarshaller(this);
	}

	public final ByteArrayOutputStream getByteArrayOutputStream(Object o) throws TransformerConfigurationException, SAXException {
		ByteArrayOutputStream os = new ByteArrayOutputStream();
		this.writeObject(o, os);
		return os;
	}

	public void writeObject(Object o, OutputStream os) throws TransformerConfigurationException, SAXException {
		marshaller.marshal(o, os);
	}

	public Object readObject(InputStream is) throws Exception {
		return unmarshaller.unmarshal(is);
	}

	public Object getFormattedByteArrayOutputStream(Object o) throws TransformerConfigurationException, SAXException {
		ByteArrayOutputStream b = new ByteArrayOutputStream();
		this.writeObject(o, b);
		return b;
	}

	class SaxMarshaller {

		private TransformerHandler hd;
		AttributesImpl rootNamespacesAttributes = null;

		public SaxMarshaller(SaxConverter saxConverter) {
			// TODO Auto-generated constructor stub
		}

		public void marshal(Object o, OutputStream os) throws TransformerConfigurationException, SAXException {
			StreamResult streamResult = new StreamResult(os);
			SAXTransformerFactory tf = (SAXTransformerFactory) SAXTransformerFactory.newInstance();
			TransformerHandler hd = tf.newTransformerHandler();
			this.hd = hd;
			Transformer serializer = hd.getTransformer();
			serializer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
			serializer.setOutputProperty(OutputKeys.STANDALONE, "yes");
			// serializer.setOutputProperty(OutputKeys.DOCTYPE_SYSTEM, "users.dtd");
			serializer.setOutputProperty(OutputKeys.INDENT, "yes");
			hd.setResult(streamResult);
			hd.startDocument();

			rootNamespacesAttributes = getRootNamespacesAttributes();

			if (o instanceof ContentInstancesBatchRequest) {
				marshal((ContentInstancesBatchRequest) o);
			} else if (o instanceof ContentInstance) {
				marshal((ContentInstance) o);
			} else if (o instanceof ContentInstanceItems) {
				marshal((ContentInstanceItems) o);
			} else if (o instanceof ContentInstanceItemsList) {
				marshal((ContentInstanceItemsList) o);
			} else if (o instanceof Scl) {
				marshal((Scl) o);
			} else if (o instanceof ConnectionParameters) {
				marshal((ConnectionParameters) o);
			} else if (o instanceof DeviceConnectionParameters) {
				marshal((DeviceConnectionParameters) o);
			} else if (o instanceof SclItems) {
				marshal((SclItems) o);
			} else {
				throw new RuntimeException("unable to marshal object " + o.getClass().getName());
			}

			hd.endDocument();
		}

		public void marshal(ContentInstancesBatchRequest ci) throws SAXException {
			AttributesImpl attrs = null;
			String np = getNamespace(ci);

			String tag = np + "ContentInstancesBatchRequest";

			attrs = new AttributesImpl();
			attrs.addAttribute(null, null, "Timestamp", null, Long.toString(ci.getTimestamp()));

			if (rootNamespacesAttributes != null) {
				addRootNamespacesAttributes(attrs);
			}

			hd.startElement(emptyString, emptyString, tag, attrs);

			rootNamespacesAttributes = null;

			List<ContentInstanceItems> l = ci.getContentInstanceItems();
			for (Iterator iterator = l.iterator(); iterator.hasNext();) {
				ContentInstanceItems contentInstanceItems = (ContentInstanceItems) iterator.next();
				marshal(contentInstanceItems);
			}
			hd.endElement(emptyString, emptyString, tag);
		}

		private String getNamespace(Object o) {
			String packageName = o.getClass().getPackage().getName();
			if (packageName.equals(m2m)) {
				return ""; // this is the default namespace
			} else if (packageName.equals(ah)) {
				return "ah:";
			} else if (packageName.equals(conn)) {
				return "conn:";
			}
			return "";
		}

		public void marshal(ContentInstanceItems cii) throws SAXException {
			String np = getNamespace(cii);

			String tag = np + "ContentInstanceItems";
			String addressedId = cii.getAddressedId();

			if (addressedId == null) {
				throw new RuntimeException("addressedId cannot be null");
			}

			AttributesImpl attrs = null;

			if (rootNamespacesAttributes == null) {
				attrs = new AttributesImpl();
			} else {
				attrs = rootNamespacesAttributes;
			}

			attrs.addAttribute(null, null, np + "AddressedId", null, addressedId);
			hd.startElement(emptyString, emptyString, tag, attrs);

			rootNamespacesAttributes = null;

			List<ContentInstance> contentInstances = cii.getContentInstances();
			for (Iterator iterator = contentInstances.iterator(); iterator.hasNext();) {
				ContentInstance contentInstance = (ContentInstance) iterator.next();
				marshal(contentInstance);
			}

			hd.endElement(emptyString, emptyString, tag);
		}

		public void marshal(ContentInstanceItemsList ciil) throws SAXException {
			String np = getNamespace(ciil);

			String tag = np + "ContentInstanceItemsList";

			AttributesImpl attrs = null;

			if (rootNamespacesAttributes == null) {
				attrs = new AttributesImpl();
			} else {
				attrs = rootNamespacesAttributes;
			}

			hd.startElement(emptyString, emptyString, tag, attrs);

			List<ContentInstanceItems> ciis = ciil.getContentInstanceItems();

			for (Iterator iterator = ciis.iterator(); iterator.hasNext();) {
				ContentInstanceItems cii = (ContentInstanceItems) iterator.next();
				marshal(cii);
			}

			hd.endElement(emptyString, emptyString, tag);
		}

		public void marshal(String name, Object value) throws SAXException {
			if (value != null) {
				hd.startElement(emptyString, emptyString, name, null);
				String s = value.toString();
				hd.characters(s.toCharArray(), 0, s.length());
				hd.endElement(emptyString, emptyString, name);
			}
		}

		public void marshal(String name, SclStatusEnumeration value) throws SAXException {
			if (value != null) {
				hd.startElement(emptyString, emptyString, name, null);
				// Convert AAA into AAA. ONLINE into Online.
				// FIXME: optimize it!
				String s = value.toString().toLowerCase();
				s = s.substring(0, 1).toUpperCase() + s.substring(1);
				hd.characters(s.toCharArray(), 0, s.length());
				hd.endElement(emptyString, emptyString, name);
			}
		}

		public void marshal(ContentInstance ci) throws SAXException {
			String np = getNamespace(ci);
			String dataTypePrefix = null;

			String tag = np + "ContentInstance";
			hd.startElement(emptyString, emptyString, tag, rootNamespacesAttributes);

			rootNamespacesAttributes = null;

			marshal(np + "Id", ci.getId());
			marshal(np + "CreationTime", ci.getCreationTime());
			Object content = ci.getContent();
			if (content != null) {
				dataTypePrefix = getNamespace(content);
				AttributesImpl attrs = new AttributesImpl();

				String xsiDataType = null;
				if (isBaseDataType(content)) {
					xsiDataType = this.getXsiDataType(content);
					attrs.addAttribute(null, null, "xsi:type", null, xsiDataType);
					hd.startElement(emptyString, emptyString, np + "Content", attrs);
					String s = content.toString();
					hd.characters(s.toCharArray(), 0, s.length());
				} else if (content instanceof DoubleCDV) {
					xsiDataType = dataTypePrefix + "DoubleCDV";

					attrs.addAttribute(null, null, "xsi:type", null, xsiDataType);
					hd.startElement(emptyString, emptyString, np + "Content", attrs);
					marshal(false, (DoubleCDV) content);
				} else if (content instanceof DoubleDV) {
					xsiDataType = dataTypePrefix + "DoubleDV";
					attrs.addAttribute(null, null, "xsi:type", null, xsiDataType);
					hd.startElement(emptyString, emptyString, np + "Content", attrs);
					marshal(false, (DoubleDV) content);
				} else if (content instanceof FloatCDV) {
					xsiDataType = dataTypePrefix + "FloatCDV";
					attrs.addAttribute(null, null, "xsi:type", null, xsiDataType);
					hd.startElement(emptyString, emptyString, np + "Content", attrs);
					marshal(false, (FloatCDV) content);
				} else if (content instanceof FloatDV) {
					xsiDataType = dataTypePrefix + "FloatDV";
					attrs.addAttribute(null, null, "xsi:type", null, xsiDataType);
					hd.startElement(emptyString, emptyString, np + "Content", attrs);
					marshal(false, (FloatDV) content);
				} else if (content instanceof EnergyCostPowerInfo) {
					xsiDataType = dataTypePrefix + "EnergyCostPowerInfo";
					attrs.addAttribute(null, null, "xsi:type", null, xsiDataType);
					hd.startElement(emptyString, emptyString, np + "Content", attrs);
					marshal(false, (EnergyCostPowerInfo) content);
				} else {
					throw new RuntimeException("unhandled anyType " + content.getClass().getName());
				}
				hd.endElement(emptyString, emptyString, np + "Content");
			}
			hd.endElement(emptyString, emptyString, tag);
		}

		public void marshal(ConnectionParameters cp) throws SAXException {
			String np = getNamespace(cp);

			String tag = np + "ConnectionParameters";
			hd.startElement(emptyString, emptyString, tag, rootNamespacesAttributes);
			rootNamespacesAttributes = null;

			marshal(np + "Id", cp.getId());
			marshal(np + "KeepAliveTimeout", cp.getKeepAliveTimeout());
			marshal(np + "NwkSclBaseId", cp.getNwkSclBaseId());
			marshal(np + "Time", cp.getTime());
			marshal(np + "TimeOffset", cp.getTimeOffset());
			marshal(np + "Token", cp.getToken());

			hd.endElement(emptyString, emptyString, tag);
		}

		public void marshal(DeviceConnectionParameters dcp) throws SAXException {
			String np = getNamespace(dcp);

			String tag = "DeviceConnectionParameters";
			hd.startElement(emptyString, emptyString, tag, getRootNamespacesAttributesConnection());
			rootNamespacesAttributes = null;
			marshal("Version", dcp.getVersion());
			marshal("Restarted", dcp.isRestarted());
			marshal("Time", dcp.getTime());
			marshal("TimeOffset", dcp.getTimeOffset());
			marshal("ListeningPort", dcp.getListeningPort());
			marshal("KeepAliveTimeout", dcp.getKeepAliveTimeout());
			hd.endElement(emptyString, emptyString, tag);
		}

		public void marshal(Scl scl) throws SAXException {
			String np = getNamespace(scl);
			String dataTypePrefix = null;

			String tag = np + "Scl";
			hd.startElement(emptyString, emptyString, tag, rootNamespacesAttributes);
			rootNamespacesAttributes = null;

			marshal(np + "AccessRightId", scl.getAccessRightId());
			marshal(np + "CreationTime", scl.getCreationTime());
			marshal(np + "ExpirationTime", scl.getExpirationTime());
			marshal(np + "Id", scl.getId());
			marshal(np + "LastModifiedTime", scl.getLastModifiedTime());
			marshal(np + "OnLineStatus", scl.getOnLineStatus());
			marshal(np + "SclBaseId", scl.getSclBaseId());

			hd.endElement(emptyString, emptyString, tag);
		}

		public void marshal(SclItems sclItems) throws SAXException {
			String np = getNamespace(sclItems);

			String tag = np + "SclItems";
			String addressedId = sclItems.getAddressedId();

			if (addressedId == null) {
				throw new RuntimeException("addressedId cannot be null");
			}

			AttributesImpl attrs = null;

			if (rootNamespacesAttributes == null) {
				attrs = new AttributesImpl();
			} else {
				attrs = rootNamespacesAttributes;
			}

			attrs.addAttribute(null, null, np + "AddressedId", null, addressedId);
			hd.startElement(emptyString, emptyString, tag, attrs);

			rootNamespacesAttributes = null;

			List<Scl> contentInstances = sclItems.getScls();
			for (Iterator iterator = contentInstances.iterator(); iterator.hasNext();) {
				Scl contentInstance = (Scl) iterator.next();
				marshal(contentInstance);
			}

			hd.endElement(emptyString, emptyString, tag);
		}

		private AttributesImpl getRootNamespacesAttributes() {
			AttributesImpl attrs = new AttributesImpl();
			attrs.addAttribute(null, null, "xmlns", null, "http://schemas.telecomitalia.it/m2m");
			attrs.addAttribute(null, null, "xmlns:xs", null, "http://www.w3.org/2001/XMLSchema");
			attrs.addAttribute(null, null, "xmlns:ah", null, "http://schemas.telecomitalia.it/ah");
			attrs.addAttribute(null, null, "xmlns:xsi", null, "http://www.w3.org/2001/XMLSchema-instance");
			// attrs.addAttribute(null, null, "xmlns:conn", null, "http://schemas.telecomitalia.it/m2m/connection");
			return attrs;
		}

		private void addRootNamespacesAttributes(AttributesImpl attrs) {
			attrs.addAttribute(null, null, "xmlns", null, "http://schemas.telecomitalia.it/m2m");
			attrs.addAttribute(null, null, "xmlns:xs", null, "http://www.w3.org/2001/XMLSchema");
			attrs.addAttribute(null, null, "xmlns:ah", null, "http://schemas.telecomitalia.it/ah");
			attrs.addAttribute(null, null, "xmlns:xsi", null, "http://www.w3.org/2001/XMLSchema-instance");
			// attrs.addAttribute(null, null, "xmlns:conn", null, "http://schemas.telecomitalia.it/m2m/connection");
		}

		private AttributesImpl getRootNamespacesAttributesConnection() {
			AttributesImpl attrs = new AttributesImpl();
			attrs.addAttribute(null, null, "xmlns", null, "http://schemas.telecomitalia.it/m2m/connection");
			return attrs;
		}

		private String getXsiDataType(Object content) {
			if (content instanceof Integer) {
				return "xs:int";
			} else if (content instanceof Long) {
				return "xs:long";
			} else if (content instanceof Boolean) {
				return "xs:boolean";
			} else if (content instanceof String) {
				return "xs:string";
			} else if (content instanceof Double) {
				return "xs:double";
			} else if (content instanceof Float) {
				return "xs:float";
			} else if (content instanceof Short) {
				return "xs:short";
			} else {
				throw new RuntimeException("unknown xsi data type " + content.getClass().getName());
			}
		}

		private boolean isBaseDataType(Object content) {
			if (content instanceof Number) {
				return true;
			} else if (content instanceof String) {
				return true;
			} else if (content instanceof Boolean) {
				return true;
			}
			return false;
		}

		public void marshal(TransformerHandler hd, boolean wrap, ApplianceLog alog) throws SAXException {
			String np = getNamespace(alog);

			if (wrap) {
				hd.startElement(emptyString, emptyString, np + "ApplianceLog", null);
			}
			marshal(np + "LogId", alog.getLogId());
			marshal(np + "LogPayload", alog.getLogPayload());
			if (wrap) {
				hd.endElement(emptyString, emptyString, np + "ApplianceLog");
			}
		}

		public void marshal(boolean wrap, DoubleDV doubleDV) throws SAXException {
			String np = getNamespace(doubleDV);

			if (wrap) {
				hd.startElement(emptyString, emptyString, np + "DoubleDV", null);
			}
			marshal(np + "Value", doubleDV.getValue());
			marshal(np + "Duration", doubleDV.getDuration());
			if (wrap) {
				hd.endElement(emptyString, emptyString, np + "DoubleDV");
			}
		}

		public void marshal(boolean wrap, DoubleCDV doubleCDV) throws SAXException {
			String np = getNamespace(doubleCDV);
			if (wrap) {
				hd.startElement(emptyString, emptyString, np + "DoubleCDV", null);
			}

			marshal(false, (DoubleDV) doubleCDV);
			marshal(np + "Min", doubleCDV.getMin());
			marshal(np + "Max", doubleCDV.getMax());
			if (wrap) {
				hd.endElement(emptyString, emptyString, np + "DoubleCDV");
			}
		}

		public void marshal(boolean wrap, FloatDV floatDV) throws SAXException {

			String np = getNamespace(floatDV);
			if (wrap) {
				hd.startElement(emptyString, emptyString, np + "FloatDV", null);
			}
			marshal(np + "Value", floatDV.getValue());
			marshal(np + "Duration", floatDV.getDuration());
			if (wrap) {
				hd.endElement(emptyString, emptyString, np + "FloatDV");
			}
		}

		public void marshal(boolean wrap, FloatCDV floatCDV) throws SAXException {
			String np = getNamespace(floatCDV);

			if (wrap) {
				hd.startElement(emptyString, emptyString, np + "FloatCDV", null);
			}

			marshal(false, (FloatDV) floatCDV);
			marshal(np + "Min", floatCDV.getMin());
			marshal(np + "Max", floatCDV.getMax());
			if (wrap) {
				hd.endElement(emptyString, emptyString, np + "FloatCDV");
			}
		}

		public void marshal(boolean wrap, EnergyCostPowerInfo ecpi) throws SAXException {
			String np = getNamespace(ecpi);

			if (wrap) {
				hd.startElement(emptyString, emptyString, np + "EnergyCostPowerInfo", null);
			}
			marshal(np + "Duration", ecpi.getDuration());
			marshal(np + "DeltaEnergy", ecpi.getDeltaEnergy());
			marshal(np + "Cost", ecpi.getCost());
			marshal(np + "MinCost", ecpi.getMinCost());

			marshal(np + "MaxCost", ecpi.getMaxCost());
			if (ecpi.getPowerInfo() != null) {
				marshal(true, ecpi.getPowerInfo());
			}
			if (wrap) {
				hd.endElement(emptyString, emptyString, np + "EnergyCostPowerInfo");
			}
		}

		public void marshal(boolean wrap, MinMaxPowerInfo o) throws SAXException {
			String np = getNamespace(o);

			if (wrap) {
				hd.startElement(emptyString, emptyString, np + "PowerInfo", null);
			}
			marshal(np + "MinPower", o.getMinPower());
			marshal(np + "MinPowerTime", o.getMinPowerTime());
			marshal(np + "MaxPower", o.getMaxPower());
			marshal(np + "MaxPowerTime", o.getMaxPowerTime());

			if (wrap) {
				hd.endElement(emptyString, emptyString, np + "PowerInfo");
			}
		}

	}

	class SaxUnmarshaller extends DefaultHandler {

		public SaxUnmarshaller(SaxConverter saxConverter) {
			// TODO Auto-generated constructor stub
		}

		public Object unmarshal(InputStream is) throws ParserConfigurationException, SAXException, IOException {
			SAXParserFactory saxParserFactory = SAXParserFactory.newInstance();
			SAXParser saxParser = saxParserFactory.newSAXParser();
			saxParser.parse(is, this);
			return null;
		}

		public void setDocumentLocator(Locator locator) {
			// TODO Auto-generated method stub

		}

		public void startDocument() throws SAXException {
			// TODO Auto-generated method stub

		}

		public void endDocument() throws SAXException {
			// TODO Auto-generated method stub

		}

		public void startPrefixMapping(String prefix, String uri) throws SAXException {
			// TODO Auto-generated method stub

		}

		public void endPrefixMapping(String prefix) throws SAXException {
			// TODO Auto-generated method stub

		}

		public void startElement(String uri, String localName, String qName, Attributes atts) throws SAXException {
			// TODO Auto-generated method stub
			System.out.println("startElement: uri: " + uri + " qName = " + qName);

		}

		public void endElement(String uri, String localName, String qName) throws SAXException {
			// TODO Auto-generated method stub

		}

		public void characters(char[] ch, int start, int length) throws SAXException {
			// TODO Auto-generated method stub

		}

		public void ignorableWhitespace(char[] ch, int start, int length) throws SAXException {
			// TODO Auto-generated method stub

		}

		public void processingInstruction(String target, String data) throws SAXException {
			// TODO Auto-generated method stub

		}

		public void skippedEntity(String name) throws SAXException {
			// TODO Auto-generated method stub
		}
	}

	class DomUnmarshaller {

		public DomUnmarshaller(SaxConverter saxConverter) {
			// TODO Auto-generated constructor stub
		}

		public Object unmarshal(InputStream in) {

			// String s = slurp(in, 1000);
			// System.out.println(s);

			DocumentBuilderFactory docFactory = DocumentBuilderFactory.newInstance();
			DocumentBuilder docBuilder;
			try {
				docBuilder = docFactory.newDocumentBuilder();
				Document dom = docBuilder.parse(in);

				Element rootElement = dom.getDocumentElement();

				String name = rootElement.getNodeName();

				NamedNodeMap attributes = rootElement.getAttributes();

				String bbb = rootElement.getNamespaceURI();

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
				} else if (name.equals("ContentInstancesBatchRequest")) {
					return unmarshal(rootElement, new ContentInstancesBatchRequest());
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

		private Object unmarshal(Element rootElement, ContentInstancesBatchRequest contentInstancesBatchRequest) {
			// FIXME: todo!!!
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

		protected ContentInstanceItemStatus unmarshal(Node rootElement, ContentInstanceItemStatus contentInstanceItemStatus) {
			NodeList nl = rootElement.getChildNodes();
			if (nl == null)
				return contentInstanceItemStatus;

			NamedNodeMap attributes = rootElement.getAttributes();
			Node batchStatus = attributes.getNamedItem("BatchStatus");
			if (batchStatus != null) {
				contentInstanceItemStatus.setBatchStatus(getIntegerValue(batchStatus));
			}

			Node resourceId = attributes.getNamedItem("ResourceId");
			if (resourceId != null) {
				contentInstanceItemStatus.setResourceId(getLongValue(resourceId));
			}
			return contentInstanceItemStatus;
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
				if (name.equals("ContentInstanceItemsStatus")) {
					List<ContentInstanceItemsStatus> contentIstanceItemsStatuses = contentInstancesBatchResponse
							.getContentInstanceItemsStatuses();
					ContentInstanceItemsStatus contentInstanceItemsStatus = this.unmarshal(el, new ContentInstanceItemsStatus());
					contentIstanceItemsStatuses.add(contentInstanceItemsStatus);

				} else {
					throw new RuntimeException("unknown tag " + name);
				}
			}

			return contentInstancesBatchResponse;
		}

		protected ContentInstanceItemsStatus unmarshal(Node rootElement, ContentInstanceItemsStatus contentInstanceItemsStatus) {
			NodeList nl = rootElement.getChildNodes();
			if (nl == null)
				return contentInstanceItemsStatus;

			NamedNodeMap attributes = rootElement.getAttributes();
			Node addressedId = attributes.getNamedItem("AddressedId");
			if (addressedId != null) {
				contentInstanceItemsStatus.setAddressedId(addressedId.getNodeValue());
			}

			List<ContentInstanceItemStatus> list = contentInstanceItemsStatus.getContentInstanceItemStatuses();

			for (int i = 0; i < nl.getLength(); i++) {
				Node el = nl.item(i);
				String name = el.getNodeName();
				if (name.equals("ContentInstanceItemStatus")) {
					ContentInstanceItemStatus contentInstanceItemStatus = (ContentInstanceItemStatus) this.unmarshal(el,
							new ContentInstanceItemStatus());
					list.add(contentInstanceItemStatus);
				} else {
					throw new RuntimeException("unknown tag " + name);
				}
			}

			return contentInstanceItemsStatus;
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
	}
}
