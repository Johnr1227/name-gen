package com.minecord;

import org.javacord.api.DiscordApi;
import org.javacord.api.DiscordApiBuilder;

public class Reference {
	// Get from -DTOKEN
	public static String token = System.getProperty("TOKEN");

	public static DiscordApi api = new DiscordApiBuilder().setToken(token).login().join();
}