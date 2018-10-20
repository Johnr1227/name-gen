package com.minecord.util;

import java.util.HashMap;

public class PermissionLevel {
	public HashMap<String,String> commandCapabilities;
	public int level;
	
	public PermissionLevel (int level, HashMap<String,String> commandCapabilities) {
		this.level = level;
		this.commandCapabilities = commandCapabilities;
	}
}
