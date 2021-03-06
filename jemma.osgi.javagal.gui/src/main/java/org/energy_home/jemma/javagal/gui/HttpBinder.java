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
package org.energy_home.jemma.javagal.gui;

import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;

import org.osgi.service.event.Event;
import org.osgi.service.event.EventHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class HttpBinder implements EventHandler, HttpServletBinder {

	private static final long serialVersionUID = 1L;

	private static final Logger LOG = LoggerFactory.getLogger(HttpBinder.class);

	private HttpImplementor implementor = null;

	public HttpBinder() {
	}

	public void bind(HttpImplementor implementor) {
		this.implementor = implementor;
	}

	public Object invokeMethod(Object targetObject, String methodName, ArrayList paramValues) throws IllegalArgumentException,
			IllegalAccessException, InvocationTargetException {
		// TODO Auto-generated method stub
		return null;
	}

	public Object getImplementor() {
		// TODO Auto-generated method stub
		return null;
	}

	public void handleEvent(Event arg0) {
		// TODO Auto-generated method stub

	}

	public Object getObjectByPid(String pid) {
		// TODO Auto-generated method stub
		return null;
	}
}
