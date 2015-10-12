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
 */
package org.energy_home.jemma.internal.shapi;

import org.energy_home.jemma.ah.hap.client.AHContainerAddress;
import org.energy_home.jemma.ah.hap.client.M2MHapException;
import org.energy_home.jemma.m2m.ContentInstance;
import org.energy_home.jemma.m2m.ContentInstanceItemsList;

public interface M2MHapService {

	String getLocalHagId();

	boolean isConnected();

	AHContainerAddress getLocalContainerAddress(String containerName);

	AHContainerAddress getLocalContainerAddress(String appliancePid, String endPointId, String containerName);

	AHContainerAddress getLocalContainerAddress(String appliancePid, Integer endPointId, String containerName);

	ContentInstance getLocalContentInstance(AHContainerAddress containerAddress) throws M2MHapException;

	ContentInstanceItemsList getLocalContentInstanceItemsList(AHContainerAddress containerAddress) throws M2MHapException;

	ContentInstanceItemsList getLocalContentInstanceItemsList(AHContainerAddress containerAddress, long startInstanceId,
			long endInstanceId) throws M2MHapException;

	AHContainerAddress getHagContainerAddress(String appliancePid, String string, String attributeId);

	ContentInstance createContentInstanceBatch(AHContainerAddress containerId, long timestamp, Object value) throws M2MHapException;

	ContentInstance createContentInstance(AHContainerAddress containerId, long timestamp, Object value) throws M2MHapException;

	ContentInstance createContentInstanceQueued(AHContainerAddress containerId, long timestamp, Object value, boolean sync)
			throws M2MHapException;

	ContentInstance getOldestContentInstance(AHContainerAddress containerId) throws M2MHapException;

	ContentInstance getContentInstance(AHContainerAddress containerId, long timestamp) throws M2MHapException;

	ContentInstance getLatestContentInstance(AHContainerAddress containerId) throws M2MHapException;

}
