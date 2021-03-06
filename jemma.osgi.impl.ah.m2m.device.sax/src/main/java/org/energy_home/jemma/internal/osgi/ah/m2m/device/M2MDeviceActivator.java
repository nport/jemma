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
package org.energy_home.jemma.internal.osgi.ah.m2m.device;

import java.util.Hashtable;

import org.eclipse.osgi.framework.console.CommandProvider;
import org.energy_home.jemma.ah.m2m.device.M2MDevice;
import org.energy_home.jemma.ah.m2m.device.M2MDeviceConfigurator;
import org.energy_home.jemma.ah.m2m.device.M2MDeviceListener;
import org.energy_home.jemma.ah.m2m.device.M2MNetworkScl;
import org.energy_home.jemma.ah.m2m.device.M2MXmlConverter;
import org.energy_home.jemma.ah.m2m.lib.M2MXmlConverterFactoryImpl;
import org.energy_home.jemma.internal.ah.m2m.device.lib.M2MDeviceServiceObject;
import org.osgi.framework.Bundle;
import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;
import org.osgi.framework.ServiceFactory;
import org.osgi.framework.ServiceRegistration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class M2MDeviceActivator implements M2MDeviceListener, BundleActivator, ServiceFactory {

	private static final Logger LOG = LoggerFactory.getLogger(M2MDeviceActivator.class);

	private BundleContext bc;
	private M2MDeviceServiceObject device;
	private ServiceRegistration networkSclRegistration;
	private ServiceRegistration deviceConfiguratorRegistration;
	private ServiceRegistration m2mDeviceRegistration = null;
	private ServiceRegistration commandProviderRegistration;
	private ServiceRegistration xmlConverterRegistration;

	public void start(BundleContext bc) throws Exception {
		this.bc = bc;
		device = new M2MDeviceServiceObject();

		Hashtable props = new Hashtable();

		// this property is used to adapt the command provider to a different OSGi console.
		props.put("osgi.command.scope", "m2m");

		M2MCommandProvider commandProvider = new M2MCommandProvider(device);
		m2mDeviceRegistration = bc.registerService(
				new String[] { M2MDevice.class.getName(), M2MDeviceConfigurator.class.getName() }, device, null);
		// deviceConfiguratorRegistration = bc.registerService(M2MDeviceConfigurator.class.getName(), device, null);
		commandProviderRegistration = bc.registerService(CommandProvider.class.getName(), commandProvider, props);

		M2MXmlConverter xmlConverter = M2MXmlConverterFactoryImpl.getCoreConverterStatic();
		xmlConverterRegistration = bc.registerService(M2MXmlConverter.class.getName(), xmlConverter, null);

		device.start();
		device.addListener(this);

		// notifies the local listener, since now we do not do that in the addListener() method.
		if (device.isStarted()) {
			this.deviceStarted();
		}

		if (device.isConnected()) {
			this.networkSclConnected();
		}
	}

	public void stop(BundleContext bc) throws Exception {
		try {
			device.removeListener(this);
			if (networkSclRegistration != null) {
				networkSclRegistration.unregister();
				networkSclRegistration = null;
			}
			if (commandProviderRegistration != null) {
				commandProviderRegistration.unregister();
				commandProviderRegistration = null;
			}
			if (deviceConfiguratorRegistration != null) {
				deviceConfiguratorRegistration.unregister();
				deviceConfiguratorRegistration = null;
			}
			if (m2mDeviceRegistration != null) {
				m2mDeviceRegistration.unregister();
				m2mDeviceRegistration = null;
			}
			if (xmlConverterRegistration != null) {
				xmlConverterRegistration.unregister();
				xmlConverterRegistration = null;
			}
			device.stop();
		} catch (Exception e) {
			LOG.error("Exception on stop", e);
		}
	}

	public void networkSclConnected() {
		try {
			// registers a N2MNetworkScl service as a service factory
			networkSclRegistration = bc.registerService(M2MNetworkScl.class.getName(), this, null);
		} catch (Exception e) {
			LOG.error("Exception on networkSclConnected", e);
		}
	}

	public void networkSclDisconnected() {
		try {
			if (networkSclRegistration != null) {
				networkSclRegistration.unregister();
				networkSclRegistration = null;

			}
		} catch (Exception e) {
			LOG.error("Exception on networkSclDisconnected", e);
		}
	}

	public void deviceStarted() {
		LOG.debug("M2M Device started");
	}

	public void deviceStopped() {
		LOG.debug("M2M Device stopped");
	}

	public void deviceConfigUpdated() {
		LOG.debug("Device config updated");
	}

	public void localSclIdUpdated() {
		LOG.debug("M2M Device local scl id updated");
	}

	public Object getService(Bundle bundle, ServiceRegistration registration) {
		String bundleName = bundle.getSymbolicName();
		LOG.debug("Created Network Scl service for bundle " + bundleName);
		return device.getNetworkScl(bundle.getSymbolicName());
	}

	public void ungetService(Bundle bundle, ServiceRegistration registration, Object service) {
		LOG.debug("Released Network Scl service for bundle " + bundle.getSymbolicName());
	}
}
