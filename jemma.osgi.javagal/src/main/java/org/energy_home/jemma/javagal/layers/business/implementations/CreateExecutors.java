package org.energy_home.jemma.javagal.layers.business.implementations;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

public class CreateExecutors {

	public static ExecutorService createThreadPoolExecutor(String name, int poolSize, long keepAliveTime) {
		TimeUnit unit = TimeUnit.SECONDS;
		BlockingQueue<Runnable> workQueue = new LinkedBlockingQueue<Runnable>();

		ExecutorService executor = new ThreadPoolExecutor(poolSize, poolSize, keepAliveTime, unit, workQueue, new ThreadFactory() {
			public Thread newThread(Runnable r) {
				return new Thread(r, "THPool-APSMessageIndication");
			}
		});

		return executor;
	}
}
