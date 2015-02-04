package org.energy_home.jemma.ah.zigbee.appliances;

import java.util.Dictionary;

import org.energy_home.jemma.ah.cluster.ah.ConfigServer;
import org.energy_home.jemma.ah.hac.ApplianceException;
import org.energy_home.jemma.ah.hac.IEndPointTypes;
import org.energy_home.jemma.ah.hac.ServiceClusterException;
import org.energy_home.jemma.ah.zigbee.zcl.cluster.general.ZclBasicServer;
import org.energy_home.jemma.ah.zigbee.zcl.cluster.general.ZclGroupsServer;
import org.energy_home.jemma.ah.zigbee.zcl.cluster.general.ZclIdentifyServer;
import org.energy_home.jemma.ah.zigbee.zcl.cluster.general.ZclLevelControlServer;
import org.energy_home.jemma.ah.zigbee.zcl.cluster.general.ZclOnOffServer;
import org.energy_home.jemma.ah.zigbee.zcl.cluster.general.ZclScenesServer;
import org.energy_home.jemma.ah.zigbee.zcl.lib.ZclAppliance;
import org.energy_home.jemma.ah.zigbee.zcl.lib.ZclEndPoint;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ZclUbisysDimmableLightAppliance extends ZclAppliance {

	private ZclEndPoint endPoint = null;

	private static final Logger LOG = LoggerFactory.getLogger(ZclUbisysDimmableLightAppliance.class);

	public ZclUbisysDimmableLightAppliance(String pid, Dictionary config) throws ApplianceException {
		super(pid, config);
		endPoint = this.zclAddEndPoint(IEndPointTypes.ZIGBEE_DIMMABLE_LIGHT);
		// Server Clusters
		endPoint.addServiceCluster(new ZclBasicServer());
		endPoint.addServiceCluster(new ZclIdentifyServer());
		endPoint.addServiceCluster(new ZclGroupsServer());
		endPoint.addServiceCluster(new ZclScenesServer());
		endPoint.addServiceCluster(new ZclOnOffServer());
		endPoint.addServiceCluster(new ZclLevelControlServer());
		// endPoint.addServiceCluster();0x0301
		// endPoint.addServiceCluster();0xFC01
		ConfigServer serviceCluster = (ConfigServer) this.getEndPoint(0).getServiceCluster(
				"org.energy_home.jemma.ah.cluster.ah.ConfigServer");
		if (serviceCluster != null) {
			try {
				if (serviceCluster.getIconName(null) == null) {
					// serviceCluster.setIconName("lampadina.png", null);
				}
			} catch (ServiceClusterException e) {

			}
		}
	}

	protected void attached() {
		LOG.debug("ZclUbisysDimmableLightAppliance attached");
	}

	protected void detached() {
		LOG.debug("ZclUbisysDimmableLightAppliance detached");
	}

}
