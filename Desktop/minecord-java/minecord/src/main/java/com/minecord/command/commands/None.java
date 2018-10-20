package com.minecord.command.commands;

import org.javacord.api.event.message.MessageCreateEvent;

import com.minecord.command.Command;

public class None extends Command {
	
	public None() {
		this.setName("none");
	}
	
	@Override
	public void run(String[] args, MessageCreateEvent event) {
		event.getChannel().sendMessage("`That command doesn't exist.`");
	}

}
