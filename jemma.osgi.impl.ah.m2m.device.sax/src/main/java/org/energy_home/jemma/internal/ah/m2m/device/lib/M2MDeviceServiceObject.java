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
package org.energy_home.jemma.internal.ah.m2m.device.lib;

import org.energy_home.jemma.ah.m2m.device.M2MDevice;
import org.energy_home.jemma.ah.m2m.device.M2MDeviceConfig;
import org.energy_home.jemma.ah.m2m.device.M2MDeviceListener;
import org.energy_home.jemma.ah.m2m.device.M2MNetworkScl;
import org.energy_home.jemma.ah.m2m.device.M2MServiceException;
import org.energy_home.jemma.internal.ah.m2m.device.M2MDeviceManager;
import org.energy_home.jemma.internal.ah.m2m.device.M2MNetworkSclObject;
import org.energy_home.jemma.m2m.connection.ConnectionParameters;

public class M2MDeviceServiceObject implements M2MDevice {
	private M2MDeviceManager m2mDeviceManager;

	public M2MDeviceServiceObject() {
		this.m2mDeviceManager = M2MDeviceManager.get();
	}

	public synchronized void start() {
		m2mDeviceManager.addReference();
	}

	public synchronized void stop() {
		m2mDeviceManager.removeReference();
	}

	public synchronized boolean isStarted() {
		return m2mDeviceManager.isStarted();
	}

	public synchronized boolean isConnected() {
		return m2mDeviceManager.isConnected();
	}

	public synchronized M2MDeviceConfig getConfiguration() {
		return m2mDeviceManager.getConfiguration();
	}

	public synchronized void setConfiguration(M2MDeviceConfig config) throws M2MServiceException {
		m2mDeviceManager.setConfiguration(config);
	}

	public synchronized ConnectionParameters getCurrentConnectionParameters() {
		return m2mDeviceManager.getCurrentConnectionParameters();
	}

	public synchronized String getSclId() {
		return m2mDeviceManager.getConfiguration().getSclId();
	}

	public synchronized M2MNetworkScl getNetworkScl(String user) {
		return new M2MNetworkSclObject(m2mDeviceManager.getNetworkSclManager(), user);
	}

	public synchronized void addListener(M2MDeviceListener listener) {
		m2mDeviceManager.addListener(listener);
	}

	public synchronized void removeListener(M2MDeviceListener listener) {
		m2mDeviceManager.removeListener(listener);
	}
}
