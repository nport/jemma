//
// This file was generated by the JavaTM Architecture for XML Binding(JAXB) Reference Implementation, vhudson-jaxb-ri-2.1-2 
// See <a href="http://java.sun.com/xml/jaxb">http://java.sun.com/xml/jaxb</a> 
// Any modifications to this file will be lost upon recompilation of the source schema. 
// Generated on: 2014.07.25 at 11:13:34 AM CEST 
//

package org.energy_home.jemma.m2m;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlType;

/**
 * <p>
 * Java class for ContentInstanceItemStatus complex type.
 * 
 * <p>
 * The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="ContentInstanceItemStatus">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;attGroup ref="{http://schemas.telecomitalia.it/m2m}BatchStatusAttributeGroup"/>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "ContentInstanceItemStatus")
public class ContentInstanceItemStatus {

	@XmlAttribute(name = "BatchStatus", required = true)
	protected int batchStatus;
	@XmlAttribute(name = "ResourceId")
	protected Long resourceId;

	/**
	 * Gets the value of the batchStatus property.
	 * 
	 */
	public int getBatchStatus() {
		return batchStatus;
	}

	/**
	 * Sets the value of the batchStatus property.
	 * 
	 */
	public void setBatchStatus(int value) {
		this.batchStatus = value;
	}

	/**
	 * Gets the value of the resourceId property.
	 * 
	 * @return possible object is {@link Long }
	 * 
	 */
	public Long getResourceId() {
		return resourceId;
	}

	/**
	 * Sets the value of the resourceId property.
	 * 
	 * @param value
	 *            allowed object is {@link Long }
	 * 
	 */
	public void setResourceId(Long value) {
		this.resourceId = value;
	}

}
