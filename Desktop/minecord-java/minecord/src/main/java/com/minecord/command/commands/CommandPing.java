package com.minecord.command.commands;

import org.javacord.api.event.message.MessageCreateEvent;

import com.minecord.command.Command;
import com.minecord.settings.GuildSettings;

public class CommandPing extends Command {

	public CommandPing() {
		this.setName("ping");
//		this.setHelpMessage("get the bot's ping.");
	}

	@Override
	public void run(String[] args, MessageCreateEvent event) {
		if (args.length == 0) {
			GuildSettings.get(event.getServer().get().getIdAsString(),"prefix").thenAcceptAsync(prefix -> {
				event.getChannel().sendMessage(prefix + "ping " + System.currentTimeMillis());
			});
		} else if (args.length == 1) {
			long t1 = Long.parseLong(args[0]);
			long pingTime = System.currentTimeMillis() - t1;
			event.getMessage().edit("Ping: " + pingTime + "ms");	
		}
	}

}
