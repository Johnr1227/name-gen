package com.minecord.command.commands;

import org.javacord.api.event.message.MessageCreateEvent;

import com.minecord.command.Command;

public class CommandExit extends Command {

	public CommandExit() {
		this.setName("exit");
//		this.setHelpMessage("manually shuts off the bot.");
	}
	
	@Override
	public void run(String[] args, MessageCreateEvent event) {
		if(args.length > 0) {
			event.getChannel().sendMessage("`Exiting with exit code " + args[0] + "`").thenAcceptAsync(m -> {
				System.exit(Integer.parseInt(args[0]));
			});
		} else {
		event.getChannel().sendMessage("`Exiting with exit code -1`").thenAcceptAsync(m -> {
			System.exit(-1);
		});
		}
	}

}
