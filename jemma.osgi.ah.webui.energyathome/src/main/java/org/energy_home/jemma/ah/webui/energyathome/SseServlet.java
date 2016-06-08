package org.energy_home.jemma.ah.webui.energyathome;

import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintStream;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.osgi.framework.ServiceRegistration;
import org.osgi.service.event.Event;
import org.osgi.service.event.EventConstants;
import org.osgi.service.event.EventHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;

public class SseServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	private static final Logger LOG = LoggerFactory.getLogger(SseServlet.class);

	final Set<OutputStream> streams = new CopyOnWriteArraySet<OutputStream>();

	Gson gson = new Gson();

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse rsp) throws ServletException, IOException {

		String path = req.getPathInfo();
		String topic = null;
		if (path != null) {
			topic = path.substring("/".length()); // skip leading /
		} else {
			topic = "*";
		}

		rsp.setContentType("text/event-stream;charset=UTF-8");
		rsp.setStatus(HttpServletResponse.SC_OK);
		OutputStream out = rsp.getOutputStream();

		final PrintStream pout = new PrintStream(out);
		pout.printf(": welcome\r\n\r\n");
		pout.flush();

		final BlockingQueue<Event> eventQueue = new LinkedBlockingQueue<Event>();

		Hashtable<String, String> p = new Hashtable<String, String>();
		p.put(EventConstants.EVENT_TOPIC, topic);
		ServiceRegistration registration = Activator.getContext().registerService(EventHandler.class.getName(),
				new EventHandler() {
					public synchronized void handleEvent(Event event) {
						try {
							eventQueue.offer(event, 100, TimeUnit.MILLISECONDS);
						} catch (InterruptedException e) {
							// let it go ...
						}
					}
				}, p);
		try {
			streams.add(out);
			while (true) {
				Event event = eventQueue.poll(5, TimeUnit.SECONDS);
				if (event == null) {
					out.write(":ping\r\n".getBytes("UTF-8"));
				} else {
					Map<String, Object> props = new HashMap<String, Object>();
					for (String name : event.getPropertyNames()) {
						props.put(name, event.getProperty(name));
					}
					pout.printf("type: org.osgi.service.eventadmin;topic=%s\r\n", event.getTopic());
					pout.printf("data: ");

					gson.toJson(props, pout);

					// aQute library doesn't marshall the AttributeValueExtended
					// class

					// codec.enc().to((Appendable)
					// pout).charset("UTF-8").put(props);
					pout.print("\r\n\r\n");
					pout.flush();
				}
				out.flush();
			}
		} catch (Exception e) {
			// this.component.log.debug("Quiting " + topic, e);

			// session = req.getSession(false);

			// time to close ...
		} finally {
			streams.remove(out);
			registration.unregister();
			out.close();
		}
	}
}
