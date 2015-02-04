//
// This file was generated by the JavaTM Architecture for XML Binding(JAXB) Reference Implementation, vhudson-jaxb-ri-2.1-2 
// See <a href="http://java.sun.com/xml/jaxb">http://java.sun.com/xml/jaxb</a> 
// Any modifications to this file will be lost upon recompilation of the source schema. 
// Generated on: 2014.07.25 at 11:13:34 AM CEST 
//

package org.energy_home.jemma.m2m;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import org.energy_home.jemma.ah.m2m.device.M2MXmlObject;

/**
 * <p>
 * Java class for anonymous complex type.
 * 
 * <p>
 * The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType>
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element ref="{http://schemas.telecomitalia.it/m2m}ContentInstanceItems" maxOccurs="unbounded" minOccurs="0"/>
 *       &lt;/sequence>
 *       &lt;attGroup ref="{http://schemas.telecomitalia.it/m2m}BatchTimeAttributeGroup"/>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "", propOrder = { "contentInstanceItems" })
@XmlRootElement(name = "ContentInstancesBatchRequest")
public class ContentInstancesBatchRequest implements M2MXmlObject {

	@XmlElement(name = "ContentInstanceItems")
	protected List<ContentInstanceItems> contentInstanceItems;
	@XmlAttribute(name = "Timestamp", required = true)
	protected long timestamp;

	/**
	 * Gets the value of the contentInstanceItems property.
	 * 
	 * <p>
	 * This accessor method returns a reference to the live list, not a snapshot. Therefore any modification you make to the
	 * returned list will be present inside the JAXB object. This is why there is not a <CODE>set</CODE> method for the
	 * contentInstanceItems property.
	 * 
	 * <p>
	 * For example, to add a new item, do as follows:
	 * 
	 * <pre>
	 * getContentInstanceItems().add(newItem);
	 * </pre>
	 * 
	 * 
	 * <p>
	 * Objects of the following type(s) are allowed in the list {@link ContentInstanceItems }
	 * 
	 * 
	 */
	public List<ContentInstanceItems> getContentInstanceItems() {
		if (contentInstanceItems == null) {
			contentInstanceItems = new ArrayList<ContentInstanceItems>();
		}
		return this.contentInstanceItems;
	}

	/**
	 * 
	 * The Timestamp property specifies the time of the first attempt to send the ContentInstancesBatchRequest as UTC milliseconds
	 * from the Epoch (January 1, 1970 00:00:00.000 GMT)
	 * 
	 * 
	 */
	public long getTimestamp() {
		return timestamp;
	}

	/**
	 * Sets the value of the timestamp property.
	 * 
	 */
	public void setTimestamp(long value) {
		this.timestamp = value;
	}

}
