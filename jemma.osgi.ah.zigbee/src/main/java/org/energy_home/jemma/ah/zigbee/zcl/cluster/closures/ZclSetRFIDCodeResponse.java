package org.energy_home.jemma.ah.zigbee.zcl.cluster.closures;

import org.energy_home.jemma.ah.cluster.zigbee.closures.SetRFIDCodeResponse;
import org.energy_home.jemma.ah.zigbee.IZclFrame;
import org.energy_home.jemma.ah.zigbee.zcl.ZclValidationException;
import org.energy_home.jemma.ah.zigbee.zcl.lib.types.ZclDataTypeUI8;

public class ZclSetRFIDCodeResponse {

	public static SetRFIDCodeResponse zclParse(IZclFrame zclFrame) throws ZclValidationException {
		SetRFIDCodeResponse r = new SetRFIDCodeResponse();
		r.Status = ZclDataTypeUI8.zclParse(zclFrame);
		return r;
	}

	public static void zclSerialize(IZclFrame zclFrame, SetRFIDCodeResponse r) throws ZclValidationException {
		ZclDataTypeUI8.zclSerialize(zclFrame, r.Status);
	}

	public static int zclSize(SetRFIDCodeResponse r) throws ZclValidationException {
		int size = 0;
		size += ZclDataTypeUI8.zclSize(r.Status);
		return size;
	}

}
