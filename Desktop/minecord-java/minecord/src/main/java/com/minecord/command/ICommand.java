package com.minecord.command;

import org.javacord.api.event.message.MessageCreateEvent;

public interface ICommand {
	public void run(String[] args, MessageCreateEvent event);
}
