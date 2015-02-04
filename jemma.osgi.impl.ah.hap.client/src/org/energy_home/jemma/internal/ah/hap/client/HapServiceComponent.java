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
package org.energy_home.jemma.internal.ah.hap.client;

import org.energy_home.jemma.ah.hap.client.AHContainerAddress;
import org.energy_home.jemma.ah.hap.client.AHM2MContainerAddress;
import org.energy_home.jemma.ah.hap.client.IM2MHapService;
import org.energy_home.jemma.ah.hap.client.M2MHapException;
import org.energy_home.jemma.ah.m2m.device.M2MDevice;
import org.energy_home.jemma.ah.m2m.device.M2MNetworkScl;
import org.energy_home.jemma.ah.m2m.device.M2MXmlConverter;
import org.energy_home.jemma.internal.shapi.M2MHapService;
import org.energy_home.jemma.m2m.ContentInstance;
import org.energy_home.jemma.m2m.ContentInstanceItems;
import org.energy_home.jemma.m2m.ContentInstanceItemsList;
import org.energy_home.jemma.osgi.ah.hap.client.IHapCoreService;
import org.energy_home.jemma.utils.datetime.DateTimeService;
import org.osgi.framework.Bundle;
import org.osgi.service.component.ComponentContext;

public class HapServiceComponent implements M2MHapService, IM2MHapService {

	private DateTimeService dateTimeService;

	private String user;

	private HapServiceManager hapServiceManager = new HapServiceManager();

	private M2MDevice m2mDevice;

	public void start(ComponentContext context) {
		this.user = getId(context.getUsingBundle());
		try {
			this.hapServiceManager.setM2MDevice(m2mDevice);
			this.hapServiceManager.startup();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	public void stop(ComponentContext context) {
		this.hapServiceManager.shutdown();
		this.hapServiceManager.unsetM2MDevice(m2mDevice);

	}

	public void hapCoreServiceStarted(IHapCoreService hapService) {
		return;
	}

	public void hapCoreServiceStopped(IHapCoreService hapService) {
		return;
	}

	public void setDateTimeService(DateTimeService dateTimeService) {
		this.dateTimeService = dateTimeService;
	}

	public void unsetDateTimeService(DateTimeService dateTimeService) {
		if (this.dateTimeService == dateTimeService) {
			this.dateTimeService = null;
		}
	}

	public void setM2MDevice(M2MDevice m2mDevice) {
		try {
			this.m2mDevice = m2mDevice;
			// this.hapServiceManager.setM2MDevice(m2mDevice);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public void unsetM2MDevice(M2MDevice m2mDevice) {
		if (this.m2mDevice == m2mDevice) {
			// this.hapServiceManager.unsetM2MDevice(m2mDevice);
			this.hapServiceManager = null;
		}
	}

	protected void setM2MXmlConverter(M2MXmlConverter converter) {
		this.hapServiceManager.setM2MXmlConverter(converter);
	}

	protected void unsetM2MXmlConverter(M2MXmlConverter converter) {
		this.hapServiceManager.unsetM2MXmlConverter(converter);
	}

	private static String getId(Bundle bundle) {
		if (bundle != null)
			return bundle.getSymbolicName() + "_" + bundle.getVersion();
		else
			return null;
	}

	private void checkDateTime() throws M2MHapException {
		if (dateTimeService == null || !dateTimeService.isDateTimeOk())
			throw new M2MHapException("Invalid current date/time");
	}

	public long getLastSuccessfulBatchRequestTimestamp() {

		return hapServiceManager.getLastBatchRequestTimestamp(user);
	}

	public AHContainerAddress getContainerAddressFromUrl(String urlOrAddressedId) {
		return AHM2MContainerAddress.getAddressFromUrl(urlOrAddressedId);
	}

	public AHContainerAddress getContainerAddress(String containerName) {
		return hapServiceManager.getContainerAddress(user, containerName);
	}

	public AHContainerAddress getHagContainerAddress(String containerName) {
		return hapServiceManager.getHagContainerAddress(user, containerName);
	}

	public AHContainerAddress getLocalContainerAddress(String containerName) {
		return hapServiceManager.getLocalContainerAddress(user, containerName);
	}

	public AHContainerAddress getHagContainerAddress(String appliancePid, Integer endPointId, String containerName) {
		return hapServiceManager.getHagContainerAddress(user, appliancePid, endPointId, containerName);
	}

	public AHContainerAddress getLocalContainerAddress(String appliancePid, Integer endPointId, String containerName) {
		return hapServiceManager.getLocalContainerAddress(user, appliancePid, endPointId, containerName);
	}

	public AHContainerAddress getHagContainerAddress(String appliancePid, String endPointId, String containerName) {
		return hapServiceManager.getHagContainerAddress(user, appliancePid, endPointId, containerName);
	}

	public AHContainerAddress getLocalContainerAddress(String appliancePid, String endPointId, String containerName) {
		return hapServiceManager.getLocalContainerAddress(user, appliancePid, endPointId, containerName);
	}

	public ContentInstance getLatestContentInstance(AHContainerAddress containerId) throws M2MHapException {
		return hapServiceManager.getContentInstance(user, containerId, M2MNetworkScl.CONTENT_INSTANCE_LATEST_ID);
	}

	public ContentInstance getOldestContentInstance(AHContainerAddress containerId) throws M2MHapException {
		return hapServiceManager.getContentInstance(user, containerId, M2MNetworkScl.CONTENT_INSTANCE_OLDEST_ID);
	}

	public ContentInstance getContentInstance(AHContainerAddress containerId, long instanceId) throws M2MHapException {
		checkDateTime();
		return hapServiceManager.getContentInstance(user, containerId, instanceId);
	}

	public ContentInstanceItemsList getContentInstanceItemsList(AHContainerAddress containerId, long instanceId)
			throws M2MHapException {
		checkDateTime();
		return hapServiceManager.getContentInstanceItemsList(user, containerId, instanceId);
	}

	public ContentInstanceItems getContentInstanceItems(AHContainerAddress containerId, long startInstanceId, long endInstanceId)
			throws M2MHapException {
		checkDateTime();
		return hapServiceManager.getContentInstanceItems(user, containerId, startInstanceId, endInstanceId);
	}

	public ContentInstanceItemsList getContentInstanceItemsList(AHContainerAddress containerIdFilter, long startInstanceId,
			long endInstanceId) throws M2MHapException {
		checkDateTime();
		return hapServiceManager.getContentInstanceItemsList(user, containerIdFilter, startInstanceId, endInstanceId);
	}

	public ContentInstance createContentInstanceBatch(AHContainerAddress containerId, long instanceId, Object content)
			throws M2MHapException {
		checkDateTime();
		return hapServiceManager.createContentInstanceBatch(user, containerId, instanceId, content);
	}

	public ContentInstance createContentInstanceBatch(AHContainerAddress containerId, ContentInstance contentInstance)
			throws M2MHapException {
		checkDateTime();
		return hapServiceManager.createContentInstanceBatch(user, containerId, contentInstance);
	}

	public ContentInstance createContentInstance(AHContainerAddress containerId, long instanceId, Object content)
			throws M2MHapException {
		checkDateTime();
		return hapServiceManager.createContentInstance(user, containerId, instanceId, content);
	}

	public ContentInstance createContentInstance(AHContainerAddress containerId, ContentInstance contentInstance)
			throws M2MHapException {
		checkDateTime();
		return hapServiceManager.createContentInstance(user, containerId, contentInstance);
	}

	public ContentInstance createContentInstanceQueued(AHContainerAddress containerId, long instanceId, Object content, boolean sync)
			throws M2MHapException {
		checkDateTime();
		return hapServiceManager.createContentInstanceQueued(user, containerId, instanceId, content, sync);
	}

	public ContentInstance createContentInstanceQueued(AHContainerAddress containerId, ContentInstance contentInstance, boolean sync)
			throws M2MHapException {
		checkDateTime();
		return hapServiceManager.createContentInstanceQueued(user, containerId, contentInstance, sync);
	}

	public ContentInstance getCachedLatestContentInstance(AHContainerAddress containerName) throws M2MHapException {
		return hapServiceManager.getCachedLatestContentInstance(user, containerName);
	}

	public ContentInstanceItemsList getCachedLatestContentItemsList(AHContainerAddress containerIdFilter) throws M2MHapException {
		checkDateTime();
		return hapServiceManager.getCachedLatestContentInstanceItemsList(user, containerIdFilter);
	}

	public ContentInstance getLocalContentInstance(AHContainerAddress containerAddressFilter) throws M2MHapException {
		return hapServiceManager.getLocalContentInstance(user, containerAddressFilter);
	}

	public ContentInstanceItemsList getLocalContentInstanceItemsList(AHContainerAddress containerAddressFilter)
			throws M2MHapException {
		return hapServiceManager.getLocalContentInstanceItemsList(user, containerAddressFilter);
	}

	public ContentInstanceItemsList getLocalContentInstanceItemsList(AHContainerAddress containerAddressFilter,
			long startInstanceId, long endInstanceId) throws M2MHapException {
		return hapServiceManager.getLocalContentInstanceItemsList(user, containerAddressFilter, startInstanceId, endInstanceId);
	}

	public String getLocalHagId() {
		return hapServiceManager.getLocalHagId(user);
	}

	public boolean isConnected() {
		return hapServiceManager.isConnected(user);
	}
}
