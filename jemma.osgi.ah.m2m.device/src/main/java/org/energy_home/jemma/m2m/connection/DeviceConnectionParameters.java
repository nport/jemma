//
// This file was generated by the JavaTM Architecture for XML Binding(JAXB) Reference Implementation, vhudson-jaxb-ri-2.1-2 
// See <a href="http://java.sun.com/xml/jaxb">http://java.sun.com/xml/jaxb</a> 
// Any modifications to this file will be lost upon recompilation of the source schema. 
// Generated on: 2014.07.25 at 11:13:34 AM CEST 
//

package org.energy_home.jemma.m2m.connection;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlSchemaType;
import javax.xml.bind.annotation.XmlType;

/**
 * 
 * Parameters sent by the M2M Device to the M2M Core Platform during the registration phase and the connection keepalive
 * interactions.
 * 
 * 
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "", propOrder = { "version", "restarted", "time", "timeOffset", "listeningPort", "keepAliveTimeout" })
@XmlRootElement(name = "DeviceConnectionParameters")
public class DeviceConnectionParameters {

	@XmlElement(name = "Version")
	protected String version;
	@XmlElement(name = "Restarted")
	protected boolean restarted;
	@XmlElement(name = "Time")
	protected long time;
	@XmlElement(name = "TimeOffset")
	protected int timeOffset;
	@XmlElement(name = "ListeningPort")
	@XmlSchemaType(name = "unsignedShort")
	protected Integer listeningPort;
	@XmlElement(name = "KeepAliveTimeout")
	protected Long keepAliveTimeout;

	/**
	 * 
	 * The version property is used in the registration phase to specify the protocol version used by the M2M Device (some old
	 * versions of M2M Device may not specify any protocol version)
	 * 
	 * 
	 * @return possible object is {@link String }
	 * 
	 */
	public String getVersion() {
		return version;
	}

	/**
	 * Sets the value of the version property.
	 * 
	 * @param value
	 *            allowed object is {@link String }
	 * 
	 */
	public void setVersion(String value) {
		this.version = value;
	}

	/**
	 * 
	 * The restarted property is used in the registration phase to specify if a connection request is the first one after a M2M
	 * Device restart.
	 * 
	 * 
	 */
	public boolean isRestarted() {
		return restarted;
	}

	/**
	 * Sets the value of the restarted property.
	 * 
	 */
	public void setRestarted(boolean value) {
		this.restarted = value;
	}

	/**
	 * 
	 * The time property specifies the M2M Device time as UTC milliseconds from the Epoch (January 1, 1970 00:00:00.000 GMT)
	 * 
	 * 
	 */
	public long getTime() {
		return time;
	}

	/**
	 * Sets the value of the time property.
	 * 
	 */
	public void setTime(long value) {
		this.time = value;
	}

	/**
	 * 
	 * The timeOffset property specifies the offset of M2M Device time zone from UTC.
	 * 
	 * 
	 */
	public int getTimeOffset() {
		return timeOffset;
	}

	/**
	 * Sets the value of the timeOffset property.
	 * 
	 */
	public void setTimeOffset(int value) {
		this.timeOffset = value;
	}

	/**
	 * 
	 * The listeningPort property specifies the TCP port used by the by the M2M Device to expose its Service Capabilities.
	 * 
	 * 
	 * @return possible object is {@link Integer }
	 * 
	 */
	public Integer getListeningPort() {
		return listeningPort;
	}

	/**
	 * Sets the value of the listeningPort property.
	 * 
	 * @param value
	 *            allowed object is {@link Integer }
	 * 
	 */
	public void setListeningPort(Integer value) {
		this.listeningPort = value;
	}

	/**
	 * 
	 * The KeepAliveTimeout property specifies the M2M Device's preferred value for the keepalive timeout. This timeout, expressed
	 * in milliseconds, is used to monitor the M2M Device connection. A 0 value for this timeout the M2M Device preference to not
	 * send keepalive messages.
	 * 
	 * 
	 * @return possible object is {@link Long }
	 * 
	 */
	public Long getKeepAliveTimeout() {
		return keepAliveTimeout;
	}

	/**
	 * Sets the value of the keepAliveTimeout property.
	 * 
	 * @param value
	 *            allowed object is {@link Long }
	 * 
	 */
	public void setKeepAliveTimeout(Long value) {
		this.keepAliveTimeout = value;
	}

}
