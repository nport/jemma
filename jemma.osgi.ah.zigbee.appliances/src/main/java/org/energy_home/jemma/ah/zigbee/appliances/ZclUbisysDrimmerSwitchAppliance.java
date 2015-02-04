package org.energy_home.jemma.ah.zigbee.appliances;

import java.util.Dictionary;

import org.energy_home.jemma.ah.cluster.ah.ConfigServer;
import org.energy_home.jemma.ah.hac.ApplianceException;
import org.energy_home.jemma.ah.hac.IEndPointTypes;
import org.energy_home.jemma.ah.hac.ServiceClusterException;
import org.energy_home.jemma.ah.zigbee.zcl.cluster.general.ZclBasicServer;
import org.energy_home.jemma.ah.zigbee.zcl.cluster.general.ZclIdentifyServer;
import org.energy_home.jemma.ah.zigbee.zcl.cluster.general.ZclLevelControlClient;
import org.energy_home.jemma.ah.zigbee.zcl.cluster.general.ZclOnOffClient;
import org.energy_home.jemma.ah.zigbee.zcl.lib.ZclAppliance;
import org.energy_home.jemma.ah.zigbee.zcl.lib.ZclEndPoint;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ZclUbisysDrimmerSwitchAppliance extends ZclAppliance {

	private ZclEndPoint endPoint = null;

	private static final Logger LOG = LoggerFactory.getLogger(ZclUbisysDrimmerSwitchAppliance.class);

	public ZclUbisysDrimmerSwitchAppliance(String pid, Dictionary config) throws ApplianceException {
		super(pid, config);
		endPoint = this.zclAddEndPoint(IEndPointTypes.ZIGBEE_DRIMMER_SWITCH);
		// Server Clusters
		endPoint.addServiceCluster(new ZclBasicServer());
		endPoint.addServiceCluster(new ZclIdentifyServer());
		// Client Clusters
		endPoint.addServiceCluster(new ZclOnOffClient());
		endPoint.addServiceCluster(new ZclLevelControlClient());

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
		LOG.debug("ZclUbisysDrimmerSwitchAppliance attached");
	}

	protected void detached() {
		LOG.debug("ZclUbisysDrimmerSwitchAppliance detached");
	}

}
