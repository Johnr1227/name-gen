package com.minecord.command.commands;

import org.javacord.api.event.message.MessageCreateEvent;

import com.minecord.command.Command;
import com.minecord.settings.GuildSettings;

public class CommandFirebase extends Command {

	public CommandFirebase() {
		this.setName("firebase");
//		this.setHelpMessage("adds args[0] to my firebase thingy.");
		this.setAlts("fb");
	}

	@Override
	public void run(String[] args, MessageCreateEvent event) {
		if(args.length > 1) {
			if(args[0].equalsIgnoreCase("get")) {
				long t1 = System.currentTimeMillis();
				GuildSettings.get(args[1]).thenAccept(v -> {
					long t2 = System.currentTimeMillis();
					System.out.println("V is " + v + " took " + (t2-t1) + "ms");
					event.getChannel().sendMessage("Value is " + v + " took " + (t2-t1) + "ms");
				});
			} else if (args[0].equalsIgnoreCase("set")) {
				if(args.length > 2) {
					
					
					GuildSettings.set(args[1], args[2]);
					event.getChannel().sendMessage(args[1] + " has been set to " + args[2]);
					
					
				} else {
					event.getChannel().sendMessage("u need a third argument dummy");
				}
			} else {
				event.getChannel().sendMessage("`type either 'get', or 'set'`");
			}
		} else {
			event.getChannel().sendMessage("`not enough args.`");
		}
	}

}
