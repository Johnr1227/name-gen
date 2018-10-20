package com.minecord.command;

import com.minecord.util.I18n;

public abstract class Command implements ICommand {
	private String name;
	
	private String[] alts;
	private boolean hasAlts;

	public String getHelpMessage() {
		return I18n.format("command." + name + ".description");
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
	
	public void setAlts(String... alts) {
		this.alts = alts;
		this.hasAlts = true;
	}
	public String[] getAlts() {
		return alts;
	}
	public boolean hasAlts() {
		return hasAlts;
	}
}
