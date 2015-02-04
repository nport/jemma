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
import java.math.BigInteger;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlSchemaType;
import javax.xml.bind.annotation.XmlType;
import javax.xml.bind.annotation.adapters.HexBinaryAdapter;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;

/**
 * <p>
 * Java class for StartupAttributeInfo complex type.
 * 
 * <p>
 * The following schema fragment specifies the expected content contained within
 * this class.
 * 
 * <pre>
 * &lt;complexType name="StartupAttributeInfo">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="StartupAttributeSetIndex" type="{http://www.w3.org/2001/XMLSchema}unsignedByte"/>
 *         &lt;element name="DeviceType" type="{http://www.zigbee.org/GWGSchema}LogicalType" minOccurs="0"/>
 *         &lt;element name="ProtocolVersion" type="{http://www.w3.org/2001/XMLSchema}unsignedByte" minOccurs="0"/>
 *         &lt;element name="StackProfile" type="{http://www.w3.org/2001/XMLSchema}unsignedByte" minOccurs="0"/>
 *         &lt;element name="ChannelMask" type="{http://www.zigbee.org/GWGSchema}unsigned32Bit" minOccurs="0"/>
 *         &lt;element name="ExtendedPANId" type="{http://www.zigbee.org/GWGSchema}IeeeAddress" minOccurs="0"/>
 *         &lt;element name="PANId" type="{http://www.zigbee.org/GWGSchema}unsigned16Bit" minOccurs="0"/>
 *         &lt;element name="ShortAddress" type="{http://www.zigbee.org/GWGSchema}NetworkAddress" minOccurs="0"/>
 *         &lt;element name="TrustCenterAddress" type="{http://www.zigbee.org/GWGSchema}IeeeAddress" minOccurs="0"/>
 *         &lt;element name="TrustCenterMasterKey" type="{http://www.zigbee.org/GWGSchema}unsigned128Bit" minOccurs="0"/>
 *         &lt;element name="NetworkKey" type="{http://www.zigbee.org/GWGSchema}unsigned128Bit" minOccurs="0"/>
 *         &lt;element name="UseInsecureJoin" type="{http://www.w3.org/2001/XMLSchema}boolean" minOccurs="0"/>
 *         &lt;element name="PreconfiguredLinkKey" type="{http://www.zigbee.org/GWGSchema}unsigned128Bit" minOccurs="0"/>
 *         &lt;element name="NetworkKeySeqNum" type="{http://www.w3.org/2001/XMLSchema}unsignedByte" minOccurs="0"/>
 *         &lt;element name="NetworkKeyType" type="{http://www.zigbee.org/GWGSchema}KeyType" minOccurs="0"/>
 *         &lt;element name="NetworkManagerAddress" type="{http://www.zigbee.org/GWGSchema}NetworkAddress" minOccurs="0"/>
 *         &lt;element name="StartupControl" type="{http://www.w3.org/2001/XMLSchema}unsignedByte" minOccurs="0"/>
 *         &lt;element name="ScanAttempts" type="{http://www.w3.org/2001/XMLSchema}unsignedByte" minOccurs="0"/>
 *         &lt;element name="TimeBetweenScans" type="{http://www.zigbee.org/GWGSchema}unsigned16Bit" minOccurs="0"/>
 *         &lt;element name="RejoinInterval" type="{http://www.zigbee.org/GWGSchema}unsigned16Bit" minOccurs="0"/>
 *         &lt;element name="maxRejoinInterval" type="{http://www.zigbee.org/GWGSchema}unsigned16Bit" minOccurs="0"/>
 *         &lt;element name="IndirectPollRate" type="{http://www.zigbee.org/GWGSchema}unsigned16Bit" minOccurs="0"/>
 *         &lt;element name="ParentRetryThreshold" type="{http://www.w3.org/2001/XMLSchema}unsignedByte" minOccurs="0"/>
 *         &lt;element name="ConcentratorFlag" type="{http://www.w3.org/2001/XMLSchema}boolean" minOccurs="0"/>
 *         &lt;element name="ConcentratorRadius" type="{http://www.w3.org/2001/XMLSchema}unsignedByte" minOccurs="0"/>
 *         &lt;element name="ConcentratorDiscoveryTime" type="{http://www.w3.org/2001/XMLSchema}unsignedByte" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "StartupAttributeInfo", propOrder = { "startupAttributeSetIndex", "deviceType", "protocolVersion", "stackProfile",
		"channelMask", "extendedPANId", "panId", "shortAddress", "trustCenterAddress", "trustCenterMasterKey", "networkKey",
		"useInsecureJoin", "preconfiguredLinkKey", "networkKeySeqNum", "networkKeyType", "networkManagerAddress", "startupControl",
		"scanAttempts", "timeBetweenScans", "rejoinInterval", "maxRejoinInterval", "indirectPollRate", "parentRetryThreshold",
		"concentratorFlag", "concentratorRadius", "concentratorDiscoveryTime" })
public class StartupAttributeInfo implements Serializable {

	@XmlElement(name = "StartupAttributeSetIndex")
	@XmlSchemaType(name = "unsignedByte")
	protected short startupAttributeSetIndex;
	@XmlElement(name = "DeviceType")
	protected LogicalType deviceType;
	@XmlElement(name = "ProtocolVersion")
	@XmlSchemaType(name = "unsignedByte")
	protected Short protocolVersion;
	@XmlElement(name = "StackProfile")
	@XmlSchemaType(name = "unsignedByte")
	protected Short stackProfile;
	@XmlElement(name = "ChannelMask")
	protected Long channelMask;
	@XmlElement(name = "ExtendedPANId")
	protected BigInteger extendedPANId;
	@XmlElement(name = "PANId")
	protected Integer panId;
	@XmlElement(name = "ShortAddress")
	protected Integer shortAddress;
	@XmlElement(name = "TrustCenterAddress")
	protected BigInteger trustCenterAddress;
	@XmlElement(name = "TrustCenterMasterKey", type = String.class)
	@XmlJavaTypeAdapter(HexBinaryAdapter.class)
	protected byte[] trustCenterMasterKey;
	@XmlElement(name = "NetworkKey", type = String.class)
	@XmlJavaTypeAdapter(HexBinaryAdapter.class)
	protected byte[] networkKey;
	@XmlElement(name = "UseInsecureJoin")
	protected Boolean useInsecureJoin;
	@XmlElement(name = "PreconfiguredLinkKey", type = String.class)
	@XmlJavaTypeAdapter(HexBinaryAdapter.class)
	protected byte[] preconfiguredLinkKey;
	@XmlElement(name = "NetworkKeySeqNum")
	@XmlSchemaType(name = "unsignedByte")
	protected Short networkKeySeqNum;
	@XmlElement(name = "NetworkKeyType")
	protected KeyType networkKeyType;
	@XmlElement(name = "NetworkManagerAddress")
	protected Integer networkManagerAddress;
	@XmlElement(name = "StartupControl")
	@XmlSchemaType(name = "unsignedByte")
	protected Short startupControl;
	@XmlElement(name = "ScanAttempts")
	@XmlSchemaType(name = "unsignedByte")
	protected Short scanAttempts;
	@XmlElement(name = "TimeBetweenScans")
	protected Integer timeBetweenScans;
	@XmlElement(name = "RejoinInterval")
	protected Integer rejoinInterval;
	protected Integer maxRejoinInterval;
	@XmlElement(name = "IndirectPollRate")
	protected Integer indirectPollRate;
	@XmlElement(name = "ParentRetryThreshold")
	@XmlSchemaType(name = "unsignedByte")
	protected Short parentRetryThreshold;
	@XmlElement(name = "ConcentratorFlag")
	protected Boolean concentratorFlag;
	@XmlElement(name = "ConcentratorRadius")
	@XmlSchemaType(name = "unsignedByte")
	protected Short concentratorRadius;
	@XmlElement(name = "ConcentratorDiscoveryTime")
	@XmlSchemaType(name = "unsignedByte")
	protected Short concentratorDiscoveryTime;

	/**
	 * Gets the value of the startupAttributeSetIndex property.
	 * 
	 */
	public short getStartupAttributeSetIndex() {
		return startupAttributeSetIndex;
	}

	/**
	 * Sets the value of the startupAttributeSetIndex property.
	 * 
	 */
	public void setStartupAttributeSetIndex(short value) {
		this.startupAttributeSetIndex = value;
	}

	/**
	 * Gets the value of the deviceType property.
	 * 
	 * @return possible object is {@link LogicalType }
	 * 
	 */
	public LogicalType getDeviceType() {
		return deviceType;
	}

	/**
	 * Sets the value of the deviceType property.
	 * 
	 * @param value
	 *            allowed object is {@link LogicalType }
	 * 
	 */
	public void setDeviceType(LogicalType value) {
		this.deviceType = value;
	}

	/**
	 * Gets the value of the protocolVersion property.
	 * 
	 * @return possible object is {@link Short }
	 * 
	 */
	public Short getProtocolVersion() {
		return protocolVersion;
	}

	/**
	 * Sets the value of the protocolVersion property.
	 * 
	 * @param value
	 *            allowed object is {@link Short }
	 * 
	 */
	public void setProtocolVersion(Short value) {
		this.protocolVersion = value;
	}

	/**
	 * Gets the value of the stackProfile property.
	 * 
	 * @return possible object is {@link Short }
	 * 
	 */
	public Short getStackProfile() {
		return stackProfile;
	}

	/**
	 * Sets the value of the stackProfile property.
	 * 
	 * @param value
	 *            allowed object is {@link Short }
	 * 
	 */
	public void setStackProfile(Short value) {
		this.stackProfile = value;
	}

	/**
	 * Gets the value of the channelMask property.
	 * 
	 * @return possible object is {@link Long }
	 * 
	 */
	public Long getChannelMask() {
		return channelMask;
	}

	/**
	 * Sets the value of the channelMask property.
	 * 
	 * @param value
	 *            allowed object is {@link Long }
	 * 
	 */
	public void setChannelMask(Long value) {
		this.channelMask = value;
	}

	/**
	 * Gets the value of the extendedPANId property.
	 * 
	 * @return possible object is {@link BigInteger }
	 * 
	 */
	public BigInteger getExtendedPANId() {
		return extendedPANId;
	}

	/**
	 * Sets the value of the extendedPANId property.
	 * 
	 * @param value
	 *            allowed object is {@link BigInteger }
	 * 
	 */
	public void setExtendedPANId(BigInteger value) {
		this.extendedPANId = value;
	}

	/**
	 * Gets the value of the panId property.
	 * 
	 * @return possible object is {@link Integer }
	 * 
	 */
	public Integer getPANId() {
		return panId;
	}

	/**
	 * Sets the value of the panId property.
	 * 
	 * @param value
	 *            allowed object is {@link Integer }
	 * 
	 */
	public void setPANId(Integer value) {
		this.panId = value;
	}

	/**
	 * Gets the value of the shortAddress property.
	 * 
	 * @return possible object is {@link Integer }
	 * 
	 */
	public Integer getShortAddress() {
		return shortAddress;
	}

	/**
	 * Sets the value of the shortAddress property.
	 * 
	 * @param value
	 *            allowed object is {@link Integer }
	 * 
	 */
	public void setShortAddress(Integer value) {
		this.shortAddress = value;
	}

	/**
	 * Gets the value of the trustCenterAddress property.
	 * 
	 * @return possible object is {@link BigInteger }
	 * 
	 */
	public BigInteger getTrustCenterAddress() {
		return trustCenterAddress;
	}

	/**
	 * Sets the value of the trustCenterAddress property.
	 * 
	 * @param value
	 *            allowed object is {@link BigInteger }
	 * 
	 */
	public void setTrustCenterAddress(BigInteger value) {
		this.trustCenterAddress = value;
	}

	/**
	 * Gets the value of the trustCenterMasterKey property.
	 * 
	 * @return possible object is {@link String }
	 * 
	 */
	public byte[] getTrustCenterMasterKey() {
		return trustCenterMasterKey;
	}

	/**
	 * Sets the value of the trustCenterMasterKey property.
	 * 
	 * @param value
	 *            allowed object is {@link String }
	 * 
	 */
	public void setTrustCenterMasterKey(byte[] value) {
		this.trustCenterMasterKey = ((byte[]) value);
	}

	/**
	 * Gets the value of the networkKey property.
	 * 
	 * @return possible object is {@link String }
	 * 
	 */
	public byte[] getNetworkKey() {
		return networkKey;
	}

	/**
	 * Sets the value of the networkKey property.
	 * 
	 * @param value
	 *            allowed object is {@link String }
	 * 
	 */
	public void setNetworkKey(byte[] value) {
		this.networkKey = ((byte[]) value);
	}

	/**
	 * Gets the value of the useInsecureJoin property.
	 * 
	 * @return possible object is {@link Boolean }
	 * 
	 */
	public Boolean isUseInsecureJoin() {
		return useInsecureJoin;
	}

	/**
	 * Sets the value of the useInsecureJoin property.
	 * 
	 * @param value
	 *            allowed object is {@link Boolean }
	 * 
	 */
	public void setUseInsecureJoin(Boolean value) {
		this.useInsecureJoin = value;
	}

	/**
	 * Gets the value of the preconfiguredLinkKey property.
	 * 
	 * @return possible object is {@link String }
	 * 
	 */
	public byte[] getPreconfiguredLinkKey() {
		return preconfiguredLinkKey;
	}

	/**
	 * Sets the value of the preconfiguredLinkKey property.
	 * 
	 * @param value
	 *            allowed object is {@link String }
	 * 
	 */
	public void setPreconfiguredLinkKey(byte[] value) {
		this.preconfiguredLinkKey = ((byte[]) value);
	}

	/**
	 * Gets the value of the networkKeySeqNum property.
	 * 
	 * @return possible object is {@link Short }
	 * 
	 */
	public Short getNetworkKeySeqNum() {
		return networkKeySeqNum;
	}

	/**
	 * Sets the value of the networkKeySeqNum property.
	 * 
	 * @param value
	 *            allowed object is {@link Short }
	 * 
	 */
	public void setNetworkKeySeqNum(Short value) {
		this.networkKeySeqNum = value;
	}

	/**
	 * Gets the value of the networkKeyType property.
	 * 
	 * @return possible object is {@link KeyType }
	 * 
	 */
	public KeyType getNetworkKeyType() {
		return networkKeyType;
	}

	/**
	 * Sets the value of the networkKeyType property.
	 * 
	 * @param value
	 *            allowed object is {@link KeyType }
	 * 
	 */
	public void setNetworkKeyType(KeyType value) {
		this.networkKeyType = value;
	}

	/**
	 * Gets the value of the networkManagerAddress property.
	 * 
	 * @return possible object is {@link Integer }
	 * 
	 */
	public Integer getNetworkManagerAddress() {
		return networkManagerAddress;
	}

	/**
	 * Sets the value of the networkManagerAddress property.
	 * 
	 * @param value
	 *            allowed object is {@link Integer }
	 * 
	 */
	public void setNetworkManagerAddress(Integer value) {
		this.networkManagerAddress = value;
	}

	/**
	 * Gets the value of the startupControl property.
	 * 
	 * @return possible object is {@link Short }
	 * 
	 */
	public Short getStartupControl() {
		return startupControl;
	}

	/**
	 * Sets the value of the startupControl property.
	 * 
	 * @param value
	 *            allowed object is {@link Short }
	 * 
	 */
	public void setStartupControl(Short value) {
		this.startupControl = value;
	}

	/**
	 * Gets the value of the scanAttempts property.
	 * 
	 * @return possible object is {@link Short }
	 * 
	 */
	public Short getScanAttempts() {
		return scanAttempts;
	}

	/**
	 * Sets the value of the scanAttempts property.
	 * 
	 * @param value
	 *            allowed object is {@link Short }
	 * 
	 */
	public void setScanAttempts(Short value) {
		this.scanAttempts = value;
	}

	/**
	 * Gets the value of the timeBetweenScans property.
	 * 
	 * @return possible object is {@link Integer }
	 * 
	 */
	public Integer getTimeBetweenScans() {
		return timeBetweenScans;
	}

	/**
	 * Sets the value of the timeBetweenScans property.
	 * 
	 * @param value
	 *            allowed object is {@link Integer }
	 * 
	 */
	public void setTimeBetweenScans(Integer value) {
		this.timeBetweenScans = value;
	}

	/**
	 * Gets the value of the rejoinInterval property.
	 * 
	 * @return possible object is {@link Integer }
	 * 
	 */
	public Integer getRejoinInterval() {
		return rejoinInterval;
	}

	/**
	 * Sets the value of the rejoinInterval property.
	 * 
	 * @param value
	 *            allowed object is {@link Integer }
	 * 
	 */
	public void setRejoinInterval(Integer value) {
		this.rejoinInterval = value;
	}

	/**
	 * Gets the value of the maxRejoinInterval property.
	 * 
	 * @return possible object is {@link Integer }
	 * 
	 */
	public Integer getMaxRejoinInterval() {
		return maxRejoinInterval;
	}

	/**
	 * Sets the value of the maxRejoinInterval property.
	 * 
	 * @param value
	 *            allowed object is {@link Integer }
	 * 
	 */
	public void setMaxRejoinInterval(Integer value) {
		this.maxRejoinInterval = value;
	}

	/**
	 * Gets the value of the indirectPollRate property.
	 * 
	 * @return possible object is {@link Integer }
	 * 
	 */
	public Integer getIndirectPollRate() {
		return indirectPollRate;
	}

	/**
	 * Sets the value of the indirectPollRate property.
	 * 
	 * @param value
	 *            allowed object is {@link Integer }
	 * 
	 */
	public void setIndirectPollRate(Integer value) {
		this.indirectPollRate = value;
	}

	/**
	 * Gets the value of the parentRetryThreshold property.
	 * 
	 * @return possible object is {@link Short }
	 * 
	 */
	public Short getParentRetryThreshold() {
		return parentRetryThreshold;
	}

	/**
	 * Sets the value of the parentRetryThreshold property.
	 * 
	 * @param value
	 *            allowed object is {@link Short }
	 * 
	 */
	public void setParentRetryThreshold(Short value) {
		this.parentRetryThreshold = value;
	}

	/**
	 * Gets the value of the concentratorFlag property.
	 * 
	 * @return possible object is {@link Boolean }
	 * 
	 */
	public Boolean isConcentratorFlag() {
		return concentratorFlag;
	}

	/**
	 * Sets the value of the concentratorFlag property.
	 * 
	 * @param value
	 *            allowed object is {@link Boolean }
	 * 
	 */
	public void setConcentratorFlag(Boolean value) {
		this.concentratorFlag = value;
	}

	/**
	 * Gets the value of the concentratorRadius property.
	 * 
	 * @return possible object is {@link Short }
	 * 
	 */
	public Short getConcentratorRadius() {
		return concentratorRadius;
	}

	/**
	 * Sets the value of the concentratorRadius property.
	 * 
	 * @param value
	 *            allowed object is {@link Short }
	 * 
	 */
	public void setConcentratorRadius(Short value) {
		this.concentratorRadius = value;
	}

	/**
	 * Gets the value of the concentratorDiscoveryTime property.
	 * 
	 * @return possible object is {@link Short }
	 * 
	 */
	public Short getConcentratorDiscoveryTime() {
		return concentratorDiscoveryTime;
	}

	/**
	 * Sets the value of the concentratorDiscoveryTime property.
	 * 
	 * @param value
	 *            allowed object is {@link Short }
	 * 
	 */
	public void setConcentratorDiscoveryTime(Short value) {
		this.concentratorDiscoveryTime = value;
	}

}
