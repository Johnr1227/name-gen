package com.minecord.command.commands;

import java.util.ArrayList;

import org.javacord.api.entity.message.embed.EmbedBuilder;
import org.javacord.api.event.message.MessageCreateEvent;

import com.minecord.command.Command;
import com.minecord.command.Commands;
import com.minecord.settings.GuildSettings;
import com.minecord.settings.Preferences;

public class CommandHelp extends Command {

	public CommandHelp() {
		this.setName("help");
		this.setAlts("h");
	}

	@Override
	public void run(String[] args, MessageCreateEvent event) {
		GuildSettings.get(event.getServer().get().getIdAsString())
				.thenAcceptAsync(settings -> {
					ArrayList<Command> commands = Commands.getCommandList();
					EmbedBuilder builder = new EmbedBuilder();
					String prefix = (String) settings.get("prefix");
					builder.setTitle(":blue_heart: __Commands__ :blue_heart:");
					builder.setDescription(
							"try " + prefix + " help [command] for specific help on that command!\n"
									+ " also, try " + prefix + "help 'admin' for a list of admin commands.");
					builder.setColor(Preferences.HELP_COLOR);
					commands.stream().forEach(c -> {
						builder.addField(prefix + c.getName(), c.getHelpMessage());
					});
					event.getChannel().sendMessage(builder);
				})
				.exceptionally((Throwable ex) -> {
					System.out.println("EXCEPTIONALLY");
					ex.printStackTrace();
					return null;
				});
	}

}