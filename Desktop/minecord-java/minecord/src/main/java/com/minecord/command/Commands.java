package com.minecord.command;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;

import org.javacord.api.entity.message.Message;

import com.minecord.Reference;
import com.minecord.command.commands.CommandExit;
import com.minecord.command.commands.CommandFirebase;
import com.minecord.command.commands.CommandHelp;
import com.minecord.command.commands.CommandPing;
import com.minecord.command.commands.None;
import com.minecord.settings.GuildSettings;

public class Commands {
	private static ArrayList<Command> commands = new ArrayList<>();
	private static HashMap<String, Command> altCmdMap = new HashMap<>();
	public static Command none = new None();
	
	public static Command help = new CommandHelp();
	public static Command exit = new CommandExit();
	public static Command ping = new CommandPing();
	
	public static Command firebase = new CommandFirebase();
	
	public static void init() {
		System.out.println("================================================");
		registerCommand(help);
		registerCommand(exit);
		registerCommand(ping);
		
		registerCommand(firebase);
		System.out.println("================================================");
		addMessageListener();
	}
	/**
	 * Adds the specified command to the listener.
	 * @param cmd
	 * the command to add
	 */
	public static void registerCommand(Command cmd) {
		System.out.println("Registered command " + cmd.getName());
		altCmdMap.put(cmd.getName(), cmd);
		commands.add(cmd);
		if(cmd.hasAlts()) {
			System.out.println("    Has alts:");
			for(String s : cmd.getAlts()) {
				altCmdMap.put(s, cmd);
				System.out.println("      • " + s);
			}
		} else {
			System.out.println("    No alts.");
		}
	}
	/**
	 * @param cmd
	 * the name of the command you want to execute
	 * @return
	 * the command object that associates with that name/alt...
	 * if it doesn't exist it returns the default command (none)
	 */
	public static Command getCommand(String cmd) {
		return altCmdMap.containsKey(cmd) ? altCmdMap.get(cmd) : none;
	}
	public static ArrayList<Command> getCommandList () {
		return commands;
	}
	/**
	 * Add the listener for commands...only call once!
	 */
	public static void addMessageListener() {
		System.out.println("Command listener started!");
		
		Reference.api.addMessageCreateListener(event -> {
			// get the prefix
			GuildSettings.get(event.getServer().get().getIdAsString(), "prefix").thenAccept(data -> {
				String prefix = (String)data;
				Message message = event.getMessage();
				if (message.getContent().startsWith(prefix)) {
					// get the message content as a list split on ' '.
				    String[] args = message.getContent().toLowerCase().split(" ");
					// command is the first one, remove the prefix
					Command cmd = getCommand(args[0].substring(prefix.length()));
					args = Arrays.copyOfRange(args, prefix.length(), args.length);
					// run the command
					cmd.run(args,event);
				}
			});
		});
	}
}
