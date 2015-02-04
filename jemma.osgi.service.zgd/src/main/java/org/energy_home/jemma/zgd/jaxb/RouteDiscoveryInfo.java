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
//
// This file was generated by the JavaTM Architecture for XML Binding(JAXB) Reference Implementation, v2.1.9-03/31/2009 04:14 PM(snajper)-fcs 
// See <a href="http://java.sun.com/xml/jaxb">http://java.sun.com/xml/jaxb</a> 
// Any modifications to this file will be lost upon recompilation of the source schema. 
// Generated on: 2014.04.03 at 05:23:14 PM CEST 
//

package org.energy_home.jemma.zgd.jaxb;

import java.io.Serializable;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlSchemaType;
import javax.xml.bind.annotation.XmlType;

/**
 * <p>
 * Java class for RouteDiscoveryInfo complex type.
 * 
 * <p>
 * The following schema fragment specifies the expected content contained within
 * this class.
 * 
 * <pre>
 * &lt;complexType name="RouteDiscoveryInfo">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="DstAddrMode" type="{http://www.w3.org/2001/XMLSchema}unsignedByte" minOccurs="0"/>
 *         &lt;element name="DstAddr" type="{http://www.zigbee.org/GWGSchema}Address" minOccurs="0"/>
 *         &lt;element name="Radius" type="{http://www.w3.org/2001/XMLSchema}unsignedByte"/>
 *         &lt;element name="NoRouteCache" type="{http://www.w3.org/2001/XMLSchema}boolean" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "RouteDiscoveryInfo", propOrder = { "dstAddrMode", "dstAddr", "radius", "noRouteCache" })
public class RouteDiscoveryInfo implements Serializable {

	@XmlElement(name = "DstAddrMode")
	@XmlSchemaType(name = "unsignedByte")
	protected Short dstAddrMode;
	@XmlElement(name = "DstAddr")
	protected Address dstAddr;
	@XmlElement(name = "Radius")
	@XmlSchemaType(name = "unsignedByte")
	protected short radius;
	@XmlElement(name = "NoRouteCache")
	protected Boolean noRouteCache;

	/**
	 * Gets the value of the dstAddrMode property.
	 * 
	 * @return possible object is {@link Short }
	 * 
	 */
	public Short getDstAddrMode() {
		return dstAddrMode;
	}

	/**
	 * Sets the value of the dstAddrMode property.
	 * 
	 * @param value
	 *            allowed object is {@link Short }
	 * 
	 */
	public void setDstAddrMode(Short value) {
		this.dstAddrMode = value;
	}

	/**
	 * Gets the value of the dstAddr property.
	 * 
	 * @return possible object is {@link Address }
	 * 
	 */
	public Address getDstAddr() {
		return dstAddr;
	}

	/**
	 * Sets the value of the dstAddr property.
	 * 
	 * @param value
	 *            allowed object is {@link Address }
	 * 
	 */
	public void setDstAddr(Address value) {
		this.dstAddr = value;
	}

	/**
	 * Gets the value of the radius property.
	 * 
	 */
	public short getRadius() {
		return radius;
	}

	/**
	 * Sets the value of the radius property.
	 * 
	 */
	public void setRadius(short value) {
		this.radius = value;
	}

	/**
	 * Gets the value of the noRouteCache property.
	 * 
	 * @return possible object is {@link Boolean }
	 * 
	 */
	public Boolean isNoRouteCache() {
		return noRouteCache;
	}

	/**
	 * Sets the value of the noRouteCache property.
	 * 
	 * @param value
	 *            allowed object is {@link Boolean }
	 * 
	 */
	public void setNoRouteCache(Boolean value) {
		this.noRouteCache = value;
	}

}
